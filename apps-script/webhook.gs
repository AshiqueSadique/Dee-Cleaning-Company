// webhook.gs
// Google Apps Script webhook for Dee Cleaning Co. bookings
// Deploy as: Web app > Execute as: Me > Anyone can access
//
// IMPORTANT: POST requests must use Content-Type: text/plain
// (not application/json) due to Apps Script CORS limitations.
// The JSON body is sent as plain text and parsed here.

const SHEET_ID = '[REPLACE_WITH_YOUR_SHEET_ID]';
const SHEET_NAME = 'Bookings';
const TIMEZONE = 'Asia/Bangkok';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Validate required fields
    const required = ['name', 'phone', 'service', 'size', 'area', 'date', 'slot', 'bookingRef'];
    for (const field of required) {
      if (!data[field]) {
        return respond({ success: false, error: `Missing required field: ${field}` });
      }
    }

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      return respond({ success: false, error: `Sheet "${SHEET_NAME}" not found` });
    }

    // Format timestamp in Bangkok timezone
    const now = new Date();
    const timestamp = Utilities.formatDate(now, TIMEZONE, 'yyyy-MM-dd HH:mm:ss');

    // Append row in exact column order
    sheet.appendRow([
      timestamp,           // 1. Timestamp
      data.bookingRef,     // 2. Booking Ref
      data.name,           // 3. Name
      data.phone,          // 4. Phone
      data.email || '',    // 5. Email
      data.service,        // 6. Service
      data.size,           // 7. Size
      data.area,           // 8. Area
      data.date,           // 9. Preferred Date
      data.slot,           // 10. Preferred Slot
      data.notes || '',    // 11. Notes
      'Pending',           // 12. Status
      '',                  // 13. Assigned Cleaner
      '',                  // 14. Final Price
      'website',           // 15. Source
    ]);

    return respond({ success: true, bookingRef: data.bookingRef });
  } catch (err) {
    return respond({ success: false, error: err.toString() });
  }
}

function doGet(e) {
  return respond({ status: 'ok', message: 'Dee Cleaning Co. booking webhook is running.' });
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
