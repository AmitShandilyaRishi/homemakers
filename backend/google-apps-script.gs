/* ============================================================
   HOMEMAKERS — Google Apps Script backend
   Paste this whole file into a Google Apps Script project bound
   to a Google Sheet, then Deploy → Web App (execute as: Me,
   access: Anyone). Copy the /exec URL into APPS_SCRIPT_URL
   in js/main.js.
   ============================================================ */

var LEAD_EMAIL  = 'thakuramit3572@gmail.com'; // where lead emails are sent
var LEADS_SHEET = 'Leads';                    // tab name for stored leads
var STATS_SHEET = 'Stats';                    // tab name for visit counter

/* ═══ POST: receive an enquiry lead ═══ */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);

    var name  = String(d.name  || '').trim().substring(0, 100);
    var phone = String(d.phone || '').trim().substring(0, 20);
    var email = String(d.email || '').trim().substring(0, 150);
    var msg   = String(d.msg   || '').trim().substring(0, 1000);
    var page  = String(d.page  || '').trim().substring(0, 300);
    if (!name || !phone) {
      return json({ success: false, message: 'Name and phone are required.' });
    }
    if (d.company) {           // honeypot: bots fill it, humans never see it
      return json({ success: true });
    }

    /* 1) save to the Leads sheet first — a lead is never lost */
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(LEADS_SHEET);
    if (!sh) {
      sh = ss.insertSheet(LEADS_SHEET);
      sh.appendRow(['Timestamp', 'Name', 'Phone', 'Email', 'Message', 'Page']);
      sh.getRange('A1:F1').setFontWeight('bold');
      sh.setFrozenRows(1);
    }
    sh.appendRow([new Date(), name, phone, email, msg, page]);

    /* 2) email the lead */
    try {
      MailApp.sendEmail({
        to: LEAD_EMAIL,
        subject: 'NEW LEAD - HomeMakers Aradhana Pre-Launch Enquiry',
        htmlBody:
          '<h3 style="margin:0 0 12px;">New enquiry from the website</h3>' +
          '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">' +
          row('Name', name) + row('Phone', phone) +
          row('Email', email || '(not provided)') +
          row('Message', msg || '(no message)') +
          row('Page', page) +
          row('Received', new Date().toString()) +
          '</table>' +
          '<p style="color:#888;font-size:12px;">All leads are also saved in your Google Sheet.</p>'
      });
    } catch (mailErr) {
      /* email quota hit — lead is already in the sheet, still a success */
    }

    return json({ success: true });
  } catch (err) {
    return json({ success: false, message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function row(k, v) {
  return '<tr><td style="background:#f4f4f4;font-weight:bold;">' + esc(k) +
         '</td><td>' + esc(v) + '</td></tr>';
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ═══ GET: visit counter ═══ */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || '';
  if (action === 'visit' || action === 'count') {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sh = ss.getSheetByName(STATS_SHEET);
      if (!sh) {
        sh = ss.insertSheet(STATS_SHEET);
        sh.getRange('A1').setValue('Site Visits');
        sh.getRange('B1').setValue(0);
      }
      var cell  = sh.getRange('B1');
      var count = Number(cell.getValue()) || 0;
      if (action === 'visit') {
        count += 1;
        cell.setValue(count);
      }
      return json({ success: true, count: count });
    } finally {
      lock.releaseLock();
    }
  }
  return json({ success: true, message: 'Homemakers backend is running.' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
