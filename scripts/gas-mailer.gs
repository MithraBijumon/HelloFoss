/**
 * Deploy this as a Google Apps Script web app to send OTP emails for free via
 * MailApp, instead of a paid transactional email API.
 *
 * Quota: MailApp/GmailApp share a daily recipient cap tied to whichever
 * Google account you deploy this under — 100/day on a personal gmail.com
 * account, 1,500/day on a Google Workspace account. Deploy under a
 * Workspace account if you have one (e.g. your club/institute domain) for
 * the higher limit.
 *
 * Setup:
 * 1. Go to https://script.google.com/ → New project. Paste this file's
 *    contents in as Code.gs (replace the default content).
 * 2. Project Settings (gear icon) → Script Properties → add a property
 *    named MAIL_SECRET with a long random value. Generate one with:
 *    node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
 *    This stops anyone who finds the deployed URL from sending mail through
 *    your account — every request must include the matching secret.
 * 3. Deploy → New deployment → type "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Authorize it (it'll ask for Gmail send permission under your account).
 * 5. Copy the deployment URL (ends in /exec). Set it as GAS_MAIL_WEBHOOK_URL
 *    in your app's environment, and the same secret from step 2 as
 *    GAS_MAIL_SECRET.
 * 6. If you change this script later, you must create a "New deployment"
 *    (or Manage deployments → Edit → new version) for the change to take
 *    effect — saving the file alone doesn't update a live deployment.
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const expectedSecret = PropertiesService.getScriptProperties().getProperty("MAIL_SECRET");

    if (!expectedSecret || body.secret !== expectedSecret) {
      return jsonResponse({ ok: false, error: "Unauthorized" });
    }
    if (!body.to || !body.subject || !body.text) {
      return jsonResponse({ ok: false, error: "Missing to/subject/text" });
    }

    MailApp.sendEmail({
      to: body.to,
      subject: body.subject,
      body: body.text,
      htmlBody: body.html || undefined,
      name: "Hello FOSS",
    });

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
