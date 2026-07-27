# Daily Management of the King's Shalom Website

## Purpose

This is the operating guide for the person responsible for daily website administration, especially publishing news, checking inquiries, and confirming that the live website works correctly.

## Daily Start Checklist

1. Open the live King's Shalom homepage.
2. Confirm the page loads without an error.
3. Check the navigation menu, team section, services, latest news, and contact section.
4. Open the news page and the latest article.
5. Check that important images display correctly.
6. Review the Web3Forms destination inbox for new customer inquiries.
7. Check the Vercel dashboard if a deployment was made recently.

## Administrator Login

1. Open `/admin-login.html` on the live website.
2. Enter an approved administrator email and password.
3. Select **Login**.
4. Confirm that the **News Management Dashboard** opens.

Only approved administrator accounts can log in. Never share a password. Administrator sessions normally expire after eight hours.

If login fails:

1. Check the spelling of the email address.
2. Confirm that the account is an approved administrator account.
3. Retry the password carefully.
4. Wait before retrying if the website reports too many attempts.
5. Use **Forgot Password** if necessary.
6. Contact the Website and IT Administrator if the problem continues.

## Publish a News Article

### Prepare Before Posting

Have the following ready:

- A clear article title.
- The correct category.
- The official author name.
- The publication date.
- A complete, proofread description.
- A suitable image with permission for company use.

Avoid posting private customer information, passwords, internal documents, unconfirmed claims, or copyrighted images without permission.

### Posting Steps

1. Log in at `/admin-login.html`.
2. On the **News Management Dashboard**, locate the article form.
3. Enter the **Title**.
4. Select or enter the **Category**.
5. Enter the **Author**.
6. Select the **Date**.
7. Enter the **Description**.
8. Under **News Image**, browse for an image or drag and drop it into the upload area.
9. Review the image preview.
10. Proofread every field again.
11. Select **Publish Article** once.
12. Wait for **Article published successfully**.
13. Confirm the article appears under **Published Articles**.

If no image is selected, the website may use a category or external fallback image. An uploaded image is converted to data stored with the article, so use a reasonably sized, web-ready image.

## Verify a Published Article

Publishing is not complete until the live result is checked.

1. Open the homepage in a new tab and refresh it.
2. Confirm the article appears in the latest news area when expected.
3. Open the main news page and locate the article.
4. Select **Read more**.
5. Confirm the article page opens with the correct title, category, author, date, description, and image.
6. Check spelling and paragraph readability.
7. Check the article on a mobile-size screen or phone.
8. Confirm no text or image overlaps another element.

## Edit an Existing Article

1. Log in and find the article under **Published Articles**.
2. Select **Edit**.
3. Confirm the article details populate the form.
4. Change only the fields that need correction.
5. Recheck the title, category, author, date, description, and image.
6. Select **Update Article**.
7. Wait for the success message.
8. Refresh the public news and article pages to confirm the change.
9. Use **Cancel** if you enter edit mode by mistake.

## Delete an Article

Deletion is immediate and the dashboard has no undo or recycle bin.

1. Confirm that deletion is authorized.
2. If the article may be needed later, preserve its text and image outside the website first.
3. Find the article under **Published Articles**.
4. Select **Delete**.
5. Read the confirmation prompt carefully.
6. Confirm only when you are certain.
7. Verify the article disappears from the dashboard and public pages.

For a minor error, edit the article instead of deleting it.

## News Content Standard

Every article should meet these checks:

- **Title:** specific, accurate, and easy to understand.
- **Category:** consistent with existing categories.
- **Author:** the approved person's or organization's name.
- **Date:** the real publication date.
- **Description:** complete, factual, professional, and proofread.
- **Image:** relevant, clear, authorized, and not unnecessarily large.
- **Names:** checked carefully against official spelling.
- **Links and contacts:** tested before publishing.
- **Confidentiality:** no private customer, shipment, staff, or credential data.

The current system uses the description as both the summary and most of the article body. Write it so it works in both places.

## Customer Inquiries

The current public contact forms submit to Web3Forms. They do not normally appear in the internal contact-message dashboard.

Daily inquiry procedure:

1. Open the email inbox configured for Web3Forms.
2. Check new submissions and the spam/junk folder.
3. Confirm the sender's name, email, phone, service, and message when supplied.
4. Forward or assign the inquiry to the correct King's Shalom staff member.
5. Reply through the approved company email or phone process.
6. Record the response outside the website if the company uses a customer log or CRM.
7. Treat inquiry details as private business information.

The `/dashboard` contact-message view reads a separate Express endpoint. Because the current public forms do not use that endpoint, it must not be treated as the complete customer-inquiry record.

## Static Website Changes

Do not use the news dashboard to change team members, services, addresses, navigation, design, or static gallery content. Those are source-code changes.

Send the Website and IT Administrator:

- The exact old text and new text.
- The page where the change belongs.
- Approved images or documents.
- The required publication date.
- The person who approved the change.

Static changes require a local build, Git commit, GitHub push, and Vercel deployment.

## Deployment Check After a Code Push

1. Open the Vercel project dashboard.
2. Find the deployment created by the latest GitHub push.
3. Wait until its status is **Ready**.
4. If it fails, open the build logs and notify the Website and IT Administrator.
5. Open the live site and perform a hard refresh.
6. Check the changed page on desktop and mobile.
7. Confirm images, forms, links, login, news, and articles still work as applicable.

## End-of-Day Checklist

- All intended articles were published and verified.
- Incorrect or duplicate articles were corrected.
- New inquiries were reviewed and assigned.
- Any website error was recorded and reported.
- No password, token, or customer information was left visible.
- The administrator account was logged out.

## Weekly Tasks

- Export or back up the Supabase news table.
- Review failed Vercel deployments and function errors.
- Review Supabase authentication activity.
- Confirm both approved administrators can securely access their email inboxes.
- Submit one test inquiry and confirm it reaches the correct inbox.
- Check major navigation links, WhatsApp, email, and social links.
- Review articles for broken external images.
- Ask the Website and IT Administrator to run the code-quality checks.

## Monthly Tasks

- Review administrator access with the business owner.
- Verify the documented email-account recovery owner still has secure Supabase project access.
- Test recovery from a news backup.
- Review old, inaccurate, or duplicated content.
- Confirm company phone, email, address, services, and team information.
- Check the website on current desktop and mobile browsers.
- Review image and database growth.
- Review the sitemap, search-engine information, and production-domain references.

## Common Problems

### Article Does Not Appear

1. Refresh the dashboard and public page.
2. Confirm a success message appeared after publishing.
3. Check the internet connection.
4. Log in again if the session expired.
5. Report the article title, time, and error message to the Website and IT Administrator.

### Image Does Not Appear

1. Edit the article and upload the image again.
2. Use a standard JPEG, PNG, or WebP image.
3. Reduce very large image dimensions and file size before uploading.
4. Verify the public article after updating.

### Public Site Still Shows Old Static Content

1. Confirm the source-code change was committed and pushed to GitHub.
2. Confirm the Vercel deployment is **Ready**.
3. Hard-refresh the browser.
4. Check the deployment URL directly.
5. Report the page URL and expected text if the problem remains.

### Password Reset Does Not Work

1. Confirm the email belongs to an approved administrator.
2. Wait before retrying if the service reports an email rate limit.
3. Check spam/junk mail.
4. Use only the newest recovery link.
5. Contact the Website and IT Administrator if the link or callback fails.

## Emergency Contacts Record

Keep the following information in a secure company record, not in this public repository:

- Business owner contact.
- Website and IT Administrator contact.
- Authorized content administrators.
- GitHub organization/repository owner.
- Vercel project owner.
- Supabase project owner.
- Domain registrar and DNS owner.
- Web3Forms destination inbox owner.

Update that secure record whenever responsibilities change.