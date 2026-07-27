# King's Shalom Software Management

## Purpose

This document defines how the King's Shalom website should be owned, operated, changed, secured, backed up, and deployed. It applies to the public website, administrator dashboard, API, authentication, news database, contact channels, and hosting services.

## System Overview

King's Shalom is a multi-page company website for logistics, customs clearing, freight forwarding, company news, and customer inquiries.

The main system consists of:

- Root HTML pages for the public website and administrator screens.
- Shared CSS and browser JavaScript under `css/` and `js/`.
- Vite for local frontend development and production builds.
- Express in `server.js` for authentication, news, contact, and protected API routes.
- Supabase for administrator authentication and production news storage.
- Supabase email/password authentication for approved administrators.
- SQLite, with JSON fallback, for local news storage.
- Web3Forms for submissions from the current public contact forms.
- GitHub for source control and Vercel for production hosting and serverless APIs.

The React starter under `src/` is not the primary live King's Shalom website.

## Management Roles

### Business Owner

- Approves official company information and major public announcements.
- Decides who may receive administrator access.
- Approves changes affecting branding, services, legal information, or customer communication.

### Website and IT Administrator

- Maintains the website, code, accounts, integrations, and deployment services.
- Publishes or supervises news content.
- Manages GitHub, Vercel, Supabase, domain settings, backups, and incidents.
- Reviews security, dependency, storage, and availability issues.
- Removes access promptly when a staff member leaves or changes responsibility.

### Content Administrator

- Creates, edits, checks, and removes news articles.
- Reviews spelling, dates, authors, categories, images, and links before publishing.
- Monitors customer inquiries and routes them to the correct staff member.
- Reports technical errors to the Website and IT Administrator.

The current implementation allows exactly two configured administrator email accounts. The labels "owner" and "editor" do not create different permissions: both accounts can create, edit, and delete news and access protected messages.

## Environments

### Local Development

- Frontend: Vite, normally `http://localhost:5173`.
- Backend: Express, normally `http://localhost:3001`.
- Vite proxies `/api` requests to the Express backend.
- News uses SQLite when available and JSON as a fallback.
- Local secrets belong in `.env` and must never be committed.

### Production

- Frontend and API are deployed on Vercel.
- Authentication and durable news storage use Supabase.
- Vercel environment variables provide production configuration.
- Vercel's temporary filesystem is not a reliable production backup or inquiry archive.

## Source-Control Policy

1. Make focused changes in the local project.
2. Review `git status` before staging files.
3. Run the required checks.
4. Stage only the intended files.
5. Use a short, descriptive commit message.
6. Push to the GitHub branch connected to Vercel.
7. Confirm the Vercel deployment reaches `Ready`.
8. Test the live website after deployment.

Standard commands:

```powershell
git status
npm run build
git add <reviewed-files>
git commit -m "Describe the change"
git push origin HEAD
```

A successful local build does not update the live website. The committed changes must be pushed to GitHub so Vercel can deploy them.

## Change Management

### Content Changes Through the Dashboard

News created in the administrator dashboard is data, not a source-code change. It is sent to the news API and stored in Supabase in production. It does not require a Git commit or Vercel deployment.

### Website File Changes

Changes to company details, team members, services, layout, code, or static images require:

1. Local editing and review.
2. A production build with `npm run build`.
3. A Git commit and push.
4. Vercel deployment verification.
5. A live-site check on desktop and mobile.

Team content currently exists in both `founder-team.html` and `public/founder-team.html`. Keep both copies synchronized until this duplication is removed.

## Access and Security

- Give administrator access only to approved personnel.
- Use a unique password of at least 12 characters for each account.
- Keep every approved administrator mailbox and its recovery procedure under company control.
- Never share passwords through source code, chat messages, screenshots, or Git commits.
- Enable MFA on each administrator's email account where available.
- Never commit `.env`, session secrets, SMTP passwords, or Supabase keys.
- Store `SUPABASE_SERVICE_ROLE_KEY` only in secure server/Vercel environment variables.
- Log out after administration, especially on shared computers.
- Rotate credentials immediately after suspected exposure or staff changes.
- Review Supabase authentication activity and Vercel logs regularly.
- Keep the Supabase password-reset redirect allowlist limited to approved URLs.

Administrator sessions normally last eight hours and are stored in secure `HttpOnly`, `SameSite=Strict` cookies rather than browser `localStorage`. JavaScript cannot read the session cookie. Logout expires the application cookie. Rotating `SESSION_SECRET` invalidates all existing application sessions.

Protected news changes require both the authenticated cookie and the application's CSRF header. Login and password recovery are rate-limited. News and inquiry values are escaped when rendered to reduce stored cross-site scripting risk.

## Backup and Recovery

### Production News

- Export or back up the Supabase `news` table every week.
- Keep backups outside the Git repository.
- Retain enough dated copies to recover from accidental deletion.
- Perform a restore test at least monthly.

### Local Data

Before changing local API or storage code, copy these files when they exist:

- `data/news.db`
- `data/news.json`
- `data/contacts.json`

These files may contain business or personal data and should not be shared publicly.

### Source Code

GitHub is the source-code history. Use commits for code and static content, but do not use Git as a database backup or a place for secrets and customer information.

## Maintenance Schedule

### Daily

- Check that the homepage, news list, and latest article open correctly.
- Review public inquiries in the Web3Forms destination inbox.
- Verify every newly published article and image on the live site.
- Check Vercel for a failed deployment after any code push.
- Log out of the administrator dashboard when finished.

### Weekly

- Export the Supabase news table.
- Review Vercel deployment and function errors.
- Review Supabase authentication activity.
- Test one contact submission and confirm delivery.
- Check important links and externally hosted images.
- Run `npm run lint` and record existing versus new errors.

### Monthly

- Test restoration from a backup.
- Run `npm audit` and review dependency updates.
- Review all administrator access.
- Verify Vercel environment variables and Supabase redirect URLs.
- Check storage growth, especially news images stored as base64 data.
- Review `robots.txt` and `sitemap.xml` for the correct production domain and pages.

## Incident Response

### Website Is Unavailable

1. Check the Vercel project status and latest deployment logs.
2. Confirm the domain points to the correct Vercel project.
3. Open the most recent successful deployment.
4. If the latest code caused the failure, redeploy a known good Git revision.
5. Record the cause and corrective action.

### Administrator Login Fails

1. Confirm the account is one of the configured administrator emails.
2. Check Supabase authentication status and logs.
3. Confirm Vercel authentication environment variables are present.
4. Confirm `SESSION_SECRET` is present and stable in Vercel.
5. Wait for the displayed retry period after too many login attempts.
6. Use the password-recovery page when appropriate.
7. Do not create temporary passwords in source code.

### News Is Missing or Incorrect

1. Check `GET /api/news` and the Vercel function logs.
2. Confirm the Supabase service-role configuration is present on Vercel.
3. Inspect the Supabase `news` table.
4. Restore from backup only after preserving the current data for investigation.

### Account or Secret Is Exposed

1. Revoke or change the affected credential immediately.
2. Remove unauthorized administrator access.
3. Rotate `SESSION_SECRET` and affected Supabase/SMTP keys.
4. Review Git history, Supabase logs, and Vercel logs.
5. Redeploy with corrected environment variables.

## Known Management Risks

- There are no drafts, approvals, schedules, article revisions, or content rollback in the dashboard.
- News deletion is immediate and irreversible from the interface.
- Both administrators currently have the same permissions.
- Normal administrator login has no second factor; a stolen password can permit access, so strong unique passwords and regular authentication-log reviews are essential.
- Application login limits are held in memory and are not shared across all Vercel serverless instances.
- Public contact forms use Web3Forms, while the internal messages API is a separate path not used by those forms.
- Base64 news images can make database records and API responses large.
- The project has no automated test suite or automated backup job.
- Secondary pages still contain some starter content and placeholder controls.
- `robots.txt` and `sitemap.xml` require review for the actual production domain.

These risks should be tracked by the Website and IT Administrator and addressed through planned, reviewed changes.