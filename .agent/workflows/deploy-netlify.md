---
description: Wie man die App auf Netlify hostet
---

Diese Anleitung beschreibt, wie du deine Prompt-Generator App auf Netlify veröffentlichst.

## 1. GitHub Repository vorbereiten
Stelle sicher, dass dein Code auf GitHub hochgeladen ist.

// turbo
1. Initialisiere Git (falls noch nicht geschehen):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Prompt Generator ready for deployment"
   ```
2. Erstelle ein Repository auf GitHub und verbinde es:
   ```bash
   git remote add origin https://github.com/DEIN_USERNAME/DEIN_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## 2. Netlify Deployment
1. Logge dich bei [Netlify](https://app.netlify.com/) ein.
2. Klicke auf **"Add new site"** > **"Import an existing project"**.
3. Wähle **GitHub** und autorisiere den Zugriff auf dein Repository.
4. Wähle das Repository der App aus.
5. Konfiguriere die Build-Einstellungen:
   - **Build Command:** `npm run build`
   - **Publish directory:** `dist`
6. Klicke auf **"Deploy [Site Name]"**.

## 3. Wichtige Details (Bereits erledigt)
- **Routing:** Ich habe bereits die Datei `public/_redirects` erstellt. Sie sorgt dafür, dass URLs wie `/generator` auch nach einem Seiten-Refresh funktionieren.
- **API Keys:** Da deine API-Keys (OpenRouter, Cloudinary) im `localStorage` gespeichert werden (über die Settings-Seite der App), musst du in Netlify **keine** Environment Variables setzen. Jeder Nutzer gibt seinen eigenen Key direkt in der laufenden App ein.

## 4. Lokale Verifizierung
Bevor du pusht, kannst du lokal testen, ob der Build reibungslos durchläuft:
```bash
npm run build
```
Wenn der Ordner `dist` ohne Fehler erstellt wird, ist alles bereit für Netlify!
