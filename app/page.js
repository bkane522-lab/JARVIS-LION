"use client";

import { useEffect, useRef, useState } from "react";

const starterMessages = [
  { role: "assistant", content: "Bonsoir. Je suis prêt. Appuie sur le micro ou écris-moi." }
];

export default function Home() {
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function speak(text) {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 1;
    utterance.pitch = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const frenchVoice = voices.find(v => v.lang?.toLowerCase().startsWith("fr"));
    if (frenchVoice) utterance.voice = frenchVoice;

    window.speechSynthesis.speak(utterance);
  }

  async function sendMessage(textOverride) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || `Erreur ${response.status}`);
      }

      const assistantMessage = {
        role: "assistant",
        content: data.text || "Je n’ai pas pu produire de réponse."
      };

      setMessages(prev => [...prev, assistantMessage]);
      speak(assistantMessage.content);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `Connexion Gemini impossible : ${error.message}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function startListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "La reconnaissance vocale n’est pas disponible dans ce navigateur. Tu peux utiliser le clavier."
        }
      ]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript.trim()) {
        setInput(transcript);
        sendMessage(transcript);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function clearConversation() {
    window.speechSynthesis?.cancel();
    setMessages(starterMessages);
    setInput("");
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">ASSISTANT PERSONNEL</div>
          <h1>JARVIS</h1>
        </div>
        <div className={"status " + (loading ? "thinking" : "ready")}>
          <span className="dot" />
          {loading ? "Réflexion" : "Prêt"}
        </div>
      </header>

      <section className="hero">
        <div className={"orb " + (listening ? "active" : "")}>
          <div className="orbCore">J</div>
        </div>

        <p className="hint">
          {listening
            ? "Je t’écoute…"
            : "Parle-moi naturellement. La réponse peut aussi être lue à voix haute."}
        </p>

        <button
          className={"micButton " + (listening ? "active" : "")}
          onClick={listening ? stopListening : startListening}
          disabled={loading}
        >
          <span className="micIcon">{listening ? "■" : "●"}</span>
          {listening ? "Arrêter" : "Parler"}
        </button>
      </section>

      <section className="quickActions">
        {["Que puis-je faire aujourd’hui ?", "Résume mon message", "Aide-moi sur un projet"].map((label) => (
          <button key={label} onClick={() => sendMessage(label)} disabled={loading}>
            {label}
          </button>
        ))}
      </section>

      <section className="conversation">
        {messages.map((m, index) => (
          <div key={index} className={"message " + m.role}>
            <div className="label">{m.role === "user" ? "Vous" : "Jarvis"}</div>
            <div className="bubble">{m.content}</div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="label">Jarvis</div>
            <div className="bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </section>

      <section className="composer">
        <textarea
          rows="1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Écris à Jarvis…"
          disabled={loading}
        />
        <button
          className="sendButton"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
        >
          Envoyer
        </button>
      </section>

      <footer className="footer">
        <button onClick={() => setVoiceEnabled(v => !v)}>
          {voiceEnabled ? "🔊 Voix activée" : "🔇 Voix coupée"}
        </button>
        <button onClick={clearConversation}>Nouvelle discussion</button>
      </footer>
    </main>
  );
}
