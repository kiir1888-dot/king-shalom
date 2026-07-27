# Software Tools Used for King's Shalom

## Summary

The King's Shalom project uses **14 principal technologies and services**. Its main application is a Vite-built, multi-page HTML, CSS, and JavaScript website with an Express API, Supabase authentication and production news storage, GitHub source control, and Vercel hosting.

The project also declares **21 direct npm packages**: 9 runtime dependencies and 12 development dependencies. Not every installed package controls the live website.
 
## Principal Tools

| # | Tool | Category | How King's Shalagaom Uses It |
|---|---|---|---|
| 1 | HTML5 | Frontend | Defines the public pages, administrator screens, forms, navigation, and page content. |
| 2 | CSS3 | Frontend | Provides custom branding, layouts, responsive behavior, themes, cards, and animations. |
| 3 | JavaScript | Frontend | Loads dynamic news and team content, handles forms, themes, galleries, navigation, and dashboard actions. |
| 4 | Bootstrap 5 | Frontend framework | Supplies responsive grids, navigation, spacing, buttons, and interface components. |
| 5 | Bootstrap Icons | Icon library | Supplies icons on the main branded pages and controls. |
| 6 | Vite | Build tool | Runs the local frontend server and builds all configured HTML pages for production. |
| 7 | Node.js | Runtime | Runs Express, Vite, build commands, and project scripts. |
| 8 | Express | Backend framework | Provides authentication, news CRUD, contact, protected messages, and static-file routes. |
| 9 | Supabase | Cloud backend | Verifies administrator accounts and stores production news in PostgreSQL. |
| 10 | SQLite | Local database | Stores news during local backend development when available. |
| 11 | JSON | Local fallback storage | Stores local news and contact messages when used by the Express backend. |
| 12 | Nodemailer | Email integration | Supports optional email notifications from the Express contact endpoint. |
| 13 | Git and GitHub | Version control | Track source changes, preserve code history, and provide the repository used for deployment. |
| 14 | Vercel | Hosting | Hosts the production frontend and runs the Express application through serverless API adapters. |

## Additional Browser Services and Libraries

| Tool or service | Current use |
|---|---|
| Google Fonts | Loads the Poppins typeface. |
| Font Awesome | Supplies icons on some secondary/starter pages. |
| Web3Forms | Receives submissions from the current public contact forms. |
| Google Maps embed | Displays location information where embedded. |
| WhatsApp links | Opens direct customer communication. |
| Facebook links | Connect to company social presence where configured. |
| Unsplash/external images | Supply some fallback or starter images. External availability is not controlled by King's Shalom. |

## Runtime npm Dependencies

These 9 packages are listed under `dependencies` in `package.json`:

| Package | Status | Purpose |
|---|---|---|
| `@supabase/supabase-js` | Active | Supabase authentication and production news access. |
| `cors` | Active | Controls permitted browser origins for API access. |
| `dotenv` | Active | Loads local environment variables from `.env`. |
| `express` | Active | Runs the backend API and local static server. |
| `nodemailer` | Implemented, optional | Sends contact notification email when SMTP is configured. |
| `sqlite3` | Active locally | Provides the local news database. |
| `react` | Installed, not primary | Supports the separate starter application under `src/`. |
| `react-dom` | Installed, not primary | Mounts the separate React starter application. |
| `@tailwindcss/vite` | Configured, not primary | Tailwind Vite integration; it does not control the main root HTML website. |

## Development npm Dependencies

These 12 packages are listed under `devDependencies`:

| Package | Status | Purpose |
|---|---|---|
| `vite` | Active | Local frontend server and production build. |
| `eslint` | Active | Static JavaScript code checking. |
| `@eslint/js` | Active | Recommended ESLint JavaScript rules. |
| `globals` | Active | Supplies global-variable definitions to ESLint. |
| `@vitejs/plugin-react` | Configured, not primary | Supports the separate React starter files. |
| `eslint-plugin-react-hooks` | Starter support | Checks React Hook usage. |
| `eslint-plugin-react-refresh` | Starter support | Supports React Fast Refresh lint rules. |
| `tailwindcss` | Configured, not primary | CSS utility framework installed for the starter/build setup. |
| `autoprefixer` | Apparently unused directly | CSS vendor-prefix processing dependency. |
| `postcss` | Apparently unused directly | CSS transformation tooling. |
| `@types/react` | Starter support | React type declarations. |
| `@types/react-dom` | Starter support | React DOM type declarations. |

## Project Files Controlled by Each Tool

| Area | Main files |
|---|---|
| Public website | Root `.html` files, `css/`, `js/`, `images/` |
| Vite build | `vite.config.js`, `package.json` |
| Express API | `server.js` |
| Vercel API adapters | `api/index.js`, `api/[...all].js` |
| Supabase database | `supabase/news.sql` |
| Vercel routing | `vercel.json` |
| Code quality | `eslint.config.js` |
| React starter | `src/` |
| Static production files | `public/` |

## Common Development Commands

```powershell
npm install
npm start
npm run dev -- --host
npm run build
npm run lint
npm run preview
```

- `npm install` installs the packages from `package.json`.
- `npm start` runs the Express backend, normally on port 3001.
- `npm run dev -- --host` runs Vite, normally on port 5173.
- `npm run build` validates and creates the production frontend in `dist/`.
- `npm run lint` checks JavaScript with ESLint.
- `npm run preview` previews the built frontend.

## Recommended Answer When Asked About the Tools

> I developed the King's Shalom website with HTML5, CSS3, JavaScript, Bootstrap, and Vite. The backend uses Node.js and Express. Supabase handles administrator authentication and production news storage, while SQLite and JSON support local development. I use Git and GitHub for version control and Vercel for hosting and deployment. The website also integrates Web3Forms for public inquiries and Nodemailer as an optional backend email service.

## Important Distinction

React and Tailwind CSS are installed and configured, but the primary live King's Shalom website is not currently a React single-page application. The production pages are the root HTML files included in the Vite multi-page build. Do not describe React or Tailwind as the main frontend unless the website is migrated to use them.

## Security and Quality

GitHub Dependabot can notify the repository owner when it detects a known dependency vulnerability, but it does not guarantee a monthly email. Enable the dependency graph, Dependabot alerts, Dependabot security updates, and GitHub security email notifications before handing over the website.

The deployed administrator security controls include:

- Supabase email/password verification restricted to two approved email addresses.
- `HttpOnly`, `Secure`, `SameSite=Strict` production session cookies.
- CSRF protection on authenticated write operations and logout.
- Rate limiting for password login and password recovery.
- Escaping of dynamic news and inquiry content to reduce stored cross-site scripting risk.
- GitHub Dependabot and CodeQL for dependency and source-code security findings.

The person responsible for technical maintenance should perform these checks at least once per month and whenever GitHub reports a vulnerability:

```powershell
npm outdated
npm audit
npm run lint
npm run build
```

- `npm outdated` lists dependencies with newer versions.
- `npm audit` reports known vulnerabilities in installed npm packages.
- `npm run lint` checks the JavaScript source for code-quality problems.
- `npm run build` confirms that Vite can create the production website.

Dependency updates are not automatically safe for production. Apply them locally, review the changes, test the website and administrator functions, then commit and push the tested files to GitHub. Vercel deploys the new versions after the GitHub push.

Buying or renewing a Vercel domain does not update dependencies and does not transfer software-maintenance responsibility. During handover, record who owns the GitHub repository, Vercel project and domain, Supabase project, security notifications, monthly checks, and emergency maintenance.

The handover record must also identify who controls each approved administrator mailbox and who can inspect Supabase Auth settings if login or recovery fails. Passwords, session secrets, and Supabase keys must never be stored in this repository.