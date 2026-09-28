export const runtime = "nodejs";

export async function POST(request) {
  try {
    // Compatibilité avec les 2 noms possibles dans Vercel.
    // Ta clé Gemini est actuellement enregistrée sous OPENAI_API_KEY,
    // donc on l'accepte aussi pour éviter l'erreur "GEMINI_API_KEY absente".
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY;

    const model =
      process.env.GEMINI_MODEL ||
      "gemini-3.5-flash-lite";

    if (!apiKey) {
      return Response.json(
        {
          error:
            "Aucune clé Gemini trouvée. Vérifie GEMINI_API_KEY ou OPENAI_API_KEY dans Vercel."
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    if (!messages.length) {
      return Response.json(
        { error: "Aucun message reçu." },
        { status: 400 }
      );
    }

    const contents = messages
      .slice(-12)
      .filter((m) => m?.content)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content) }]
      }));

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `${encodeURIComponent(model)}:generateContent`;

    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: [
                "Tu es JARVIS, un assistant personnel francophone.",
                "Réponds clairement et de façon pratique.",
                "N'invente jamais d'information.",
                "Ne prétends jamais avoir exécuté une action externe si aucun outil ne t'a été fourni.",
                "Pour l'instant, tu peux converser, expliquer, rédiger, résumer et aider sur des projets."
              ].join(" ")
            }
          ]
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1200
        }
      }),
      cache: "no-store"
    });

    const data = await geminiResponse.json().catch(() => ({}));

    if (!geminiResponse.ok) {
      const googleMessage =
        data?.error?.message ||
        "Erreur Gemini inconnue";

      console.error(
        "Gemini API:",
        geminiResponse.status,
        googleMessage
      );

      return Response.json(
        {
          error:
            `Gemini ${geminiResponse.status} : ${googleMessage}`
        },
        { status: 502 }
      );
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text || "")
        .join("")
        .trim();

    if (!text) {
      return Response.json(
        { error: "Gemini n'a renvoyé aucun texte." },
        { status: 502 }
      );
    }

    return Response.json({ text });
  } catch (error) {
    console.error("JARVIS /api/chat:", error);

    return Response.json(
      {
        error:
          error?.message ||
          "Erreur interne lors de l'appel à Gemini."
      },
      { status: 500 }
    );
  }
}
