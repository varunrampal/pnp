/* global process */
const MAX_ATTACHMENT_BYTES = 2.5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['xlsx', 'xls', 'csv', 'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (value, maxLength = 500) => String(value || '').trim().slice(0, maxLength);
const escapeHtml = value => clean(value, 5000).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
}[character]));

const validateAttachment = attachment => {
  if (!attachment) return null;
  const filename = clean(attachment.name, 180);
  const extension = filename.split('.').pop()?.toLowerCase();
  const size = Number(attachment.size);
  if (!filename || !ALLOWED_EXTENSIONS.has(extension)) throw new Error('Unsupported attachment type.');
  if (!Number.isFinite(size) || size <= 0 || size > MAX_ATTACHMENT_BYTES) throw new Error('The attachment must be smaller than 2.5 MB.');
  if (!attachment.contentBytes || typeof attachment.contentBytes !== 'string') throw new Error('The attachment is invalid.');
  return { filename, content: attachment.contentBytes };
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }
  try {
    const normalizeOrigin = value => String(value || '').trim().replace(/\/$/, '').toLowerCase();
    const configuredOrigins = String(process.env.QUOTE_ALLOWED_ORIGINS || '').split(',').map(normalizeOrigin).filter(Boolean);
    const allowedHosts = new Set(['pnpplants.ca', 'www.pnpplants.ca', 'peelsnativeplants.com', 'www.peelsnativeplants.com']);
    configuredOrigins.forEach(configuredOrigin => {
      try { allowedHosts.add(new URL(configuredOrigin).hostname.toLowerCase()); } catch { allowedHosts.add(configuredOrigin.replace(/:\d+$/, '')); }
    });
    const requestOrigin = normalizeOrigin(request.headers?.origin);
    const originHost = requestOrigin ? new URL(requestOrigin).hostname.toLowerCase() : '';
    const requestHost = String(request.headers?.host || '').trim().replace(/:\d+$/, '').toLowerCase();
    const isSameSite = originHost && requestHost && originHost === requestHost;
    if (requestOrigin && !isSameSite && !allowedHosts.has(originHost)) return response.status(403).json({ error: 'This website is not allowed to submit quote requests.' });

    const body = typeof request.body === 'string' ? JSON.parse(request.body) : (request.body || {});
    if (clean(body.website)) return response.status(200).json({ ok: true });
    const fullName = clean(body.fullName, 120);
    const companyName = clean(body.companyName, 160);
    const email = clean(body.email, 254).toLowerCase();
    const plantList = clean(body.plantList, 5000);
    const projectNotes = clean(body.projectNotes, 5000);
    const attachment = validateAttachment(body.attachment);
    if (!fullName || !EMAIL_PATTERN.test(email)) return response.status(400).json({ error: 'Please provide your name and a valid email address.' });
    if (!plantList && !attachment) return response.status(400).json({ error: 'Enter your plant requirements or attach a plant list.' });

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = clean(process.env.RESEND_FROM_EMAIL, 254);
    const recipientEmail = clean(process.env.QUOTE_RECIPIENT_EMAIL || fromEmail, 254);
    const fromName = clean(process.env.RESEND_FROM_NAME || 'PEELS Native Plants', 100);
    if (!apiKey || !EMAIL_PATTERN.test(fromEmail) || !EMAIL_PATTERN.test(recipientEmail)) throw new Error('Resend is not configured.');

    const details = [['Name', fullName], ['Company', companyName || 'Not provided'], ['Email', email], ['Phone', clean(body.phone, 60) || 'Not provided'], ['Project location', clean(body.location, 160) || 'Not provided'], ['Required timing', clean(body.requiredBy, 80) || 'Not provided'], ['Plant list', plantList || 'See attached plant list'], ['Project notes', projectNotes || 'Not provided']];
    const rows = details.map(([label, value]) => `<tr><th style="padding:8px;text-align:left;vertical-align:top">${escapeHtml(label)}</th><td style="padding:8px;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join('');
    const resendResponse = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: `${fromName} <${fromEmail}>`, to: [recipientEmail], reply_to: email, subject: `New quote request — ${companyName || fullName}`, html: `<h2>New PEELS website quote request</h2><table style="border-collapse:collapse">${rows}</table>`, ...(attachment ? { attachments: [attachment] } : {}) }) });
    if (!resendResponse.ok) { console.error('Resend email failed:', resendResponse.status, await resendResponse.text()); throw new Error('The email service rejected the request.'); }
    const result = await resendResponse.json();
    try {
      const customerSummary = [['Project location', clean(body.location, 160) || 'Not provided'], ['Required timing', clean(body.requiredBy, 80) || 'Not provided'], ['Plant list', plantList || 'Attached to your request'], ['Project notes', projectNotes || 'Not provided']];
      const customerRows = customerSummary.map(([label, value]) => `<tr><th style="padding:8px;text-align:left;vertical-align:top;color:#173d2b">${escapeHtml(label)}</th><td style="padding:8px;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join('');
      const acknowledgementResponse = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: `${fromName} <${fromEmail}>`, to: [email], reply_to: recipientEmail, subject: 'We received your quote request', html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#26352d"><h2 style="color:#173d2b">Thank you, ${escapeHtml(fullName)}.</h2><p>We have received your quote request and our nursery team will review it shortly.</p><p>We respond during nursery business hours. If we need more information about availability, substitutions, delivery or timing, we will contact you directly.</p><h3 style="color:#173d2b">Your request summary</h3><table style="border-collapse:collapse">${customerRows}</table><p style="margin:24px 0 4px">PEELS Native Plants</p><p style="margin:0 0 12px"><a href="tel:+18334989898" style="color:#173d2b;text-decoration:none">1-833-498-9898</a></p><img src="https://peelsnativeplants.com/assets/peels-logo-BiL_axi_.jpeg" alt="PEELS Native Plants" width="120" style="display:block;width:120px;height:auto;border:0"></div>` }) });
      if (!acknowledgementResponse.ok) console.error('Customer quote acknowledgement failed:', acknowledgementResponse.status, await acknowledgementResponse.text());
    } catch (acknowledgementError) {
      console.error('Customer quote acknowledgement failed:', acknowledgementError);
    }
    return response.status(200).json({ ok: true, id: result.id });
  } catch (error) {
    console.error('Resend quote submission failed:', error);
    const validationError = /attachment|unsupported/i.test(error.message);
    return response.status(validationError ? 400 : 500).json({ error: validationError ? error.message : 'We could not send your request. Please try again or email us directly.' });
  }
}
