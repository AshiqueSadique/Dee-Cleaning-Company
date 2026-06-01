export interface BookingData {
  serviceName: string;
  area: string;
  dateFormatted: string;
  timeSlot: string;
  notes?: string;
  size?: string;
  addons?: string[];
}

export function buildLineMessage(formData: BookingData): string {
  const lines = [
    "Hi Dee Cleaning Co.! I'd like to book:",
    `→ Service: ${formData.serviceName}`,
    `→ Area: ${formData.area}`,
    `→ Date: ${formData.dateFormatted}`,
    `→ Time: ${formData.timeSlot}`,
  ];

  if (formData.size) {
    lines.push(`→ Size: ${formData.size}`);
  }

  if (formData.addons && formData.addons.length > 0) {
    lines.push(`→ Add-ons: ${formData.addons.join(', ')}`);
  }

  if (formData.notes) {
    lines.push(`→ Notes: ${formData.notes}`);
  }

  return lines.join('\n');
}

export function openLineBooking(formData: BookingData): void {
  const message = buildLineMessage(formData);
  // LINE @ID placeholder
  const lineUrl = `https://line.me/R/oaMessage/@deecleaning/?${encodeURIComponent(message)}`;
  window.location.href = lineUrl;
}

export function buildLineUrl(params: {
  service?: string;
  size?: string;
  addons?: string;
}): string {
  const parts: string[] = ["Hi Dee Cleaning Co.! I'd like to book:"];
  if (params.service) parts.push(`→ Service: ${params.service}`);
  if (params.size) parts.push(`→ Size: ${params.size}`);
  if (params.addons) parts.push(`→ Add-ons: ${params.addons}`);
  const message = parts.join('\n');
  return `https://line.me/R/oaMessage/@deecleaning/?${encodeURIComponent(message)}`;
}

export const LINE_ID = '@deecleaning'; // [PLACEHOLDER]
export const LINE_URL = `https://line.me/R/ti/p/${LINE_ID}`;
