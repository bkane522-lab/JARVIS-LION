# JARVIS V1 — Gemini gratuit

Cette version utilise Gemini à la place d'OpenAI.

## Vercel > Settings > Environment Variables

Ajoute exactement :

GEMINI_API_KEY = ta clé Google AI Studio (AQ...)
GEMINI_MODEL = gemini-3.5-flash-lite

Applique les variables à Production, Preview et Development si Vercel te propose ces choix.

Ensuite fais un nouveau déploiement.

## Important

- Ne mets jamais la clé dans GitHub.
- Le niveau gratuit Gemini est soumis à des quotas.
- Le modèle `gemini-3.5-flash-lite` possède un niveau sans frais.
