# King's Shalom Website

Company website and admin-backed news system for King's Shalom customs clearing and freight services.

## Project Center

King's Shalom is centered on a **multi-page logistics company website** built from the HTML files in the project root. The primary frontend uses HTML, CSS, Bootstrap, and browser JavaScript. Vite builds these pages for production.

The backend is centered on `server.js`, which provides contact, news, and administrator APIs through Express. Vercel exposes the same Express application as serverless API routes through `api/[...all].js`.

Authentication and production news storage are centered on Supabase. Administrator access requires an approved email and password. Local development uses SQLite, with JSON fallback storage if SQLite is unavailable. GitHub stores the source code, and pushing to the connected repository triggers deployment on Vercel.

The React files under `src/` are separate starter content and are not the primary King's Shalom website entry point.

## Technology Inventory

The project uses **14 principal technologies and services**:

| # | Technology or service | Purpose |
|---|---|---|
| 1 | HTML5 | Multi-page website structure |
| 2 | CSS3 | Custom styling and responsive layouts |
| 3 | JavaScript | Browser interactions and dynamic content |
| 4 | Bootstrap | Responsive layout and interface components |
| 5 | Bootstrap Icons | Interface and social icons |
| 6 | Vite | Local frontend server and production builds |
| 7 | Node.js | JavaScript runtime for the backend and build tools |
| 8 | Express | Contact, news, and administrator APIs |
| 9 | Supabase | Administrator authentication and production news database |
| 10 | SQLite | Local news database |
| 11 | JSON | Local fallback storage for news and contact messages |
| 12 | Nodemailer | Optional contact email notifications |
| 13 | Git and GitHub | Version control and remote source repository |
| 14 | Vercel | Production hosting and serverless API deployment |

`package.json` currently declares **21 direct npm packages**: 9 runtime dependencies and 12 development dependencies. React and Tailwind CSS are among the installed packages, but they do not currently control the main root HTML website.

## Project Map

| Location | Responsibility |
|---|---|
| `index.html` and other root `.html` files | Main public and administrator pages |
| `css/` | Shared site styling and responsive rules |
| `js/` | Frontend behavior, news rendering, gallery, and admin dashboard logic |
| `images/` | Source website images |
| `public/` | Static files copied directly into the Vite production build |
| `server.js` | Express API, authentication checks, and local static server |
| `api/` | Vercel serverless entry points for the Express application |
| `data/` | Local SQLite and JSON data |
| `supabase/news.sql` | Production news table definition |
| `vite.config.js` | Multi-page build configuration and local API proxy |
| `vercel.json` | Production routes and cache headers |
| `src/` | Separate React starter content, not the primary live site |

## Application Flow

```text
Visitor -> HTML/CSS/JavaScript website -> /api requests -> Express server
													 -> Supabase in production
													 -> SQLite/JSON locally

Git push -> GitHub repository -> Vercel build and deployment -> Live website
```

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

After the password is accepted, the server creates an eight-hour application session in an `HttpOnly`, `SameSite=Strict`, `Secure` production cookie. The session is not stored in browser `localStorage` and is not returned to frontend JavaScript. Protected write requests also require the application's CSRF header.

Password recovery sends a Supabase verification link to an allowed administrator's email. Vercel uses its production project URL automatically; `ADMIN_PASSWORD_RESET_URL` controls the callback during local or non-Vercel deployments. Add the deployed `admin-reset-password.html` URL to the Supabase Auth redirect allowlist.

### Add the two admin users in Supabase dashboard

1. Open your project in Supabase.
2. Go to `Authentication` -> `Users`.
3. Click `Add user`.
4. Enter owner email and password, then create.
5. Repeat for editor email and password.
6. Copy these two emails into `.env` as `ADMIN_OWNER_EMAIL` and `ADMIN_EDITOR_EMAIL`.

No credentials are stored in frontend source code.

### Account recovery

Keep each approved administrator email account secure and recoverable under company control because password recovery uses that mailbox. A trusted Supabase project owner should update an approved authentication account only after verifying the administrator's identity.

## Production Security Notes

- Never deploy with missing Supabase auth environment variables.
- Set a long, stable `SESSION_SECRET` in Vercel. Production admin authentication is disabled when it is missing.
- Rotate `SESSION_SECRET` if an admin session compromise is suspected. Rotation signs out existing sessions.
- Keep HTTPS enabled so production cookies retain their `Secure` protection.
- Login is limited to five attempts per 15 minutes for each IP/email combination, and password recovery to three attempts per hour.
- Normal login does not use a second factor. Require a strong, unique password and secure the administrator's email account with its own MFA where available.
- The in-memory application limiter is an additional safeguard; Supabase and Vercel platform protections should also remain enabled because serverless instances do not share memory.
- News and inquiry content is escaped before rendering to reduce stored cross-site scripting risk.

## Scripts

- `npm run dev` - Vite development server
- `npm start` - Express API/static server
- `npm run build` - Production build
- `npm run preview` - Preview built frontend
- `npm run lint` - ESLint

## Deploy Through GitHub and Vercel

After validating changes locally, stage the required files, commit them, and push the current branch:

```bash
git status
git add <files>
git commit -m "Describe the change"
git push origin HEAD
```

If the GitHub repository is connected to Vercel, the push automatically starts a new deployment. A successful local `npm run build` prepares and validates the site but does not update the live website by itself.
