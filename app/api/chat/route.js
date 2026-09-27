import OpenAI from "openai";

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OPENAI_API_KEY absente du serveur." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    if (!messages.length) {
      return Response.json({ error: "Aucun message reçu." }, { status: 400 });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const history = messages
      .slice(-12)
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || "")
      }));

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      instructions: [
        "Tu es JARVIS, un assistant personnel francophone.",
        "Réponds de façon claire, concise et pratique.",
        "Ne prétends jamais avoir exécuté une action externe si aucun outil ne t'a été fourni.",
        "Si une action nécessite Gmail, Agenda, GitHub, un site ou une autre intégration, explique simplement que cette capacité sera ajoutée dans une prochaine version.",
        "N'invente aucune information."
      ].join(" "),
      input: history
    });

    const text = response.output_text?.trim() || "Je n’ai pas de réponse pour le moment.";

    return Response.json({ text });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Erreur lors de l’appel au modèle IA." },
      { status: 500 }
    );
  }
}
