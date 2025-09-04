# Optimizi Supplier Email Backend

This small Express server receives POST requests from the frontend and sends emails using Gmail SMTP via Nodemailer.

Setup (local):

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies: `npm install`
3. Start server: `npm run dev` (requires `nodemon`) or `npm start`.

Environment variables (.env):
- GMAIL_USER: your Gmail address (e.g., example@gmail.com)
- GMAIL_APP_PASSWORD: an App Password (recommended) or your account password (less secure)
- FROM_NAME: optional display name for the From header
- PORT: optional port (default 4001)
 - ALLOW_SELF_SIGNED: set to true during local development if your environment has self-signed certificates (default: true in .env.example)

Notes about running locally:
- If `GMAIL_USER` or `GMAIL_APP_PASSWORD` are not set the server will use a debug JSON transport and will not actually send emails. This is convenient for local development.

Notes:
- For Gmail, create an App Password (recommended) in your Google Account security settings.
- This server is intentionally minimal. In production, add rate limiting, auth, input validation, and error tracking.
