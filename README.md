# JARVIS V1

Assistant vocal personnel minimal, pensé pour téléphone + Vercel.

## Ce que fait cette V1

- Conversation texte avec une IA
- Bouton micro via la reconnaissance vocale du navigateur
- Réponse lue à voix haute via la synthèse vocale du téléphone
- Clé API uniquement côté serveur
- Interface mobile simple
- PWA installable
- Aucune action externe simulée : Gmail, Agenda, GitHub, JPQ, etc. viendront ensuite

## Installation locale

1. Installe Node.js 20+
2. Dans le dossier du projet :

```bash
npm install
```

3. Copie `.env.example` en `.env.local`
4. Ajoute ta clé OpenAI :

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5-mini
```

5. Lance :

```bash
npm run dev
```

Puis ouvre `http://localhost:3000`.

## Déploiement Vercel

1. Envoie le projet sur GitHub
2. Importe le dépôt dans Vercel
3. Dans **Settings → Environment Variables**, ajoute :
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` = `gpt-5-mini`
4. Redéploie

## Important

Un abonnement ChatGPT Plus n’inclut pas automatiquement l’utilisation de l’API OpenAI dans une application externe. L’API est facturée séparément selon l’usage.

La reconnaissance vocale dépend du navigateur. Sur Android/Chrome elle fonctionne généralement, mais un champ texte reste disponible en secours.
