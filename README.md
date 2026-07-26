# King's Shalom Website

Company website and admin-backed news system for King's Shalom customs clearing and freight services.

## Stack

- Vite frontend
- Express backend
- SQLite for news storage

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
cp .env.example .env
```

3. Set secure values in `.env`:

- `SESSION_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ADMIN_OWNER_EMAIL`
- `ADMIN_EDITOR_EMAIL`

4. Start backend API server:

```bash
npm start
```

5. Start frontend development server:

```bash
npm run dev -- --host
```

## Admin Auth (Supabase)

Admin login uses email/password verified by Supabase on the backend (`/api/admin/login`).
Only two users can access admin routes:

- `ADMIN_OWNER_EMAIL`
- `ADMIN_EDITOR_EMAIL`

Any other valid Supabase user is blocked from admin access.

Password recovery sends a Supabase verification link to an allowed administrator's email. Vercel uses its production project URL automatically; `ADMIN_PASSWORD_RESET_URL` controls the callback during local or non-Vercel deployments. Add the deployed `admin-reset-password.html` URL to the Supabase Auth redirect allowlist.

### Add the two admin users in Supabase dashboard

1. Open your project in Supabase.
2. Go to `Authentication` -> `Users`.
3. Click `Add user`.
4. Enter owner email and password, then create.
5. Repeat for editor email and password.
6. Copy these two emails into `.env` as `ADMIN_OWNER_EMAIL` and `ADMIN_EDITOR_EMAIL`.

No credentials are stored in frontend source code.

## Production Security Notes

- Never deploy with missing Supabase auth environment variables.
- Rotate `SESSION_SECRET` if a token leak is suspected.
- Restrict CORS using `CORS_ORIGIN` in production.
- Use HTTPS in production and keep server ports private behind a reverse proxy.

## Scripts

- `npm run dev` - Vite development server
- `npm start` - Express API/static server
- `npm run build` - Production build
- `npm run preview` - Preview built frontend
- `npm run lint` - ESLint
