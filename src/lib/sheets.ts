import { google } from 'googleapis';

function getAuth() {
  return new google.auth.JWT({
    email: import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (import.meta.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

const SHEET_ID = import.meta.env.GOOGLE_SHEET_ID || '1Qz1Cf0CSVlfXmjQJeqzoZ0Oo0pPXwtC-ZgtAP3b3uJw';

export interface Booking {
  rowIndex: number;
  timestamp: string;
  bookingRef: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  size: string;
  area: string;
  date: string;
  slot: string;
  notes: string;
  status: string;
  assignedCleaner: string;
  finalPrice: string;
  source: string;
}

export interface Staff {
  rowIndex: number;
  name: string;
  phone: string;
  line: string;
  email: string;
  areas: string;
  notes: string;
}

export async function getBookings(): Promise<Booking[]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Bookings!A2:P',
  });
  const rows = res.data.values || [];
  return rows.map((row, i) => ({
    rowIndex: i + 2,
    timestamp: row[0] || '',
    bookingRef: row[1] || '',
    name: row[2] || '',
    phone: row[3] || '',
    email: row[4] || '',
    service: row[5] || '',
    size: row[6] || '',
    area: row[7] || '',
    date: row[8] || '',
    slot: row[9] || '',
    notes: row[10] || '',
    status: row[11] || 'Pending',
    assignedCleaner: row[12] || '',
    finalPrice: row[13] || '',
    source: row[14] || '',
  }));
}

export async function getBookingByRef(ref: string): Promise<Booking | null> {
  const bookings = await getBookings();
  return bookings.find(b => b.bookingRef === ref) || null;
}

export async function updateBooking(rowIndex: number, updates: Partial<Booking>): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const requests = [];
  if (updates.status !== undefined) {
    requests.push(sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Bookings!L${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[updates.status]] },
    }));
  }
  if (updates.assignedCleaner !== undefined) {
    requests.push(sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Bookings!M${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[updates.assignedCleaner]] },
    }));
  }
  if (updates.finalPrice !== undefined) {
    requests.push(sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Bookings!N${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[updates.finalPrice]] },
    }));
  }
  await Promise.all(requests);
}

export async function getStaff(): Promise<Staff[]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Cleaners!A2:G',
    });
    const rows = res.data.values || [];
    return rows.map((row, i) => ({
      rowIndex: i + 2,
      name: row[0] || '',
      phone: row[1] || '',
      line: row[2] || '',
      email: row[3] || '',
      areas: row[4] || '',
      notes: row[5] || '',
    }));
  } catch {
    return [];
  }
}

export async function addStaff(staff: Omit<Staff, 'rowIndex'>): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Cleaners!A:F',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[staff.name, staff.phone, staff.line, staff.email, staff.areas, staff.notes]],
    },
  });
}

export async function deleteStaff(rowIndex: number): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `Cleaners!A${rowIndex}:G${rowIndex}`,
  });
}
