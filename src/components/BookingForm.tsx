import { useState, useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceItem {
  name: string;
  desc: string;
  price: string;
  price_caption?: string;
}

interface Props {
  t: any; // full i18n object (has t.services, t.booking, etc.)
  lang: 'en' | 'th';
  webhookUrl: string;
}

interface FormData {
  // Step 1
  name: string;
  phone: string;
  email: string;
  // Step 2
  service: string;
  serviceLabel: string;
  size: string;
  area: string;
  notes: string;
  // Step 3
  date: string;
  slot: 'morning' | 'afternoon' | 'evening' | '';
}

const EMPTY_FORM: FormData = {
  name: '',
  phone: '',
  email: '',
  service: '',
  serviceLabel: '',
  size: '',
  area: '',
  notes: '',
  date: '',
  slot: '',
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

function phoneValid(phone: string): boolean {
  return phone.replace(/\D/g, '').length >= 8;
}

function emailValid(email: string): boolean {
  if (!email) return true; // optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateBookingRef(name: string, date: string, slot: string): string {
  const prefix = name
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 4)
    .toUpperCase()
    .padEnd(4, 'X');
  const d = new Date(date + 'T00:00:00');
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).substring(2);
  const slotCode =
    slot === 'morning' ? 'AM' : slot === 'afternoon' ? 'PM' : 'EV';
  return `${prefix}-${dd}${mm}${yy}-${slotCode}`;
}

function formatDateDisplay(dateStr: string, slot: string, t: any): string {
  const d = new Date(dateStr + 'T00:00:00');
  const dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
  ];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const slotLabel =
    slot === 'morning'
      ? t.booking.step3.morning
      : slot === 'afternoon'
      ? t.booking.step3.afternoon
      : t.booking.step3.evening;
  const slotTime =
    slot === 'morning'
      ? t.booking.step3.morningTime
      : slot === 'afternoon'
      ? t.booking.step3.afternoonTime
      : t.booking.step3.eveningTime;
  return `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} · ${slotLabel} (${slotTime})`;
}

function buildLineUrl(data: FormData, bookingRef: string, t: any): string {
  const d = new Date(data.date + 'T00:00:00');
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const dateStr = `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`;
  const slotLabel =
    data.slot === 'morning'
      ? 'Morning (9 AM–12 PM)'
      : data.slot === 'afternoon'
      ? 'Afternoon (1 PM–4 PM)'
      : 'Evening (5 PM–8 PM)';
  const lines = [
    `Hi Dee Cleaning Co.! I just requested a clean on your website:`,
    ``,
    `→ Service: ${data.serviceLabel}`,
    `→ Size: ${data.size}`,
    `→ Area: ${data.area}`,
    `→ When: ${dateStr} · ${slotLabel}`,
    `→ Name: ${data.name}`,
    `→ Phone: ${normalizePhone(data.phone)}`,
    data.notes ? `→ Notes: ${data.notes}` : null,
    ``,
    `(Booking ref: ${bookingRef})`,
  ]
    .filter((l) => l !== null)
    .join('\n');
  return `https://line.me/R/oaMessage/@deecleaning/?${encodeURIComponent(lines)}`;
}

async function postToWebhook(
  payload: object,
  webhookUrl: string
): Promise<boolean> {
  if (!webhookUrl) {
    console.warn('[BookingForm] No webhook URL configured — skipping POST');
    return false;
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const json = await res.json();
    return json.success === true;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('[BookingForm] Webhook error:', err);
    return false;
  }
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div
      className="flex items-center gap-5 mb-10"
      aria-label={`Step ${current} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const num = i + 1;
        const isActive = num === current;
        const isDone = num < current;
        return (
          <div key={i} className="flex items-center gap-5">
            <span
              aria-current={isActive ? 'step' : undefined}
              style={{
                fontFamily: 'inherit',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                color: isActive
                  ? 'var(--terra)'
                  : isDone
                  ? 'var(--muted)'
                  : 'var(--line)',
                textDecoration: isDone ? 'line-through' : 'none',
                transition: 'color 0.2s',
              }}
            >
              {num}
            </span>
            {i < total - 1 && (
              <span
                style={{
                  display: 'block',
                  width: '24px',
                  height: '1px',
                  background: 'var(--line)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Shared field styles ──────────────────────────────────────────────────────

const inputBaseStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--paper)',
  border: 'none',
  borderBottom: '1px solid rgba(26,26,26,0.2)',
  padding: '10px 0',
  fontFamily: 'Fraunces, Georgia, serif',
  fontSize: '16px',
  color: 'var(--ink)',
  outline: 'none',
  borderRadius: 0,
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 600,
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
  marginBottom: '6px',
};

const errorStyle: React.CSSProperties = {
  fontFamily: 'Manrope, sans-serif',
  fontSize: '12px',
  color: 'var(--terra)',
  marginTop: '5px',
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function BookingForm({ t, lang, webhookUrl }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({ ...EMPTY_FORM });
  const [step1Attempted, setStep1Attempted] = useState(false);
  const [step2Attempted, setStep2Attempted] = useState(false);
  const [step3Attempted, setStep3Attempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [webhookSuccess, setWebhookSuccess] = useState<boolean | null>(null);
  const [bookingRef, setBookingRef] = useState('');
  const [lineUrl, setLineUrl] = useState('');

  const stepRef = useRef<HTMLDivElement>(null);

  const b = t.booking;

  // ── Date bounds ──────────────────────────────────────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // ── Validation ───────────────────────────────────────────────────────────
  const nameOk = formData.name.trim().length > 0;
  const phoneOk = phoneValid(formData.phone);
  const emailOk = emailValid(formData.email);
  const step1Valid = nameOk && phoneOk && emailOk;

  const step2Valid =
    !!formData.service && !!formData.size && !!formData.area;

  const step3Valid = !!formData.date && !!formData.slot;

  // ── sessionStorage ───────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('dee_booking_form');
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<FormData>;
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem('dee_booking_form', JSON.stringify(formData));
    } catch {
      // ignore
    }
  }, [formData]);

  // ── URL params pre-fill ──────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get('service');
    const sizeParam = params.get('size');

    if (serviceParam || sizeParam) {
      setFormData((prev) => {
        const next = { ...prev };
        if (serviceParam) {
          const found = t.services?.items?.find(
            (s: ServiceItem & { id?: string }) =>
              (s as any).id === serviceParam || s.name === serviceParam
          );
          if (found) {
            next.service = (found as any).id ?? serviceParam;
            next.serviceLabel = found.name;
          }
        }
        if (sizeParam) {
          next.size = sizeParam;
        }
        return next;
      });
    }
  }, []);

  // ── Field updater ────────────────────────────────────────────────────────
  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  // ── Animation ────────────────────────────────────────────────────────────
  function animateStep(direction: 'forward' | 'back', onDone: () => void) {
    const el = stepRef.current;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!el || prefersReduced) {
      onDone();
      return;
    }

    const outY = direction === 'forward' ? -16 : 16;
    const inY = direction === 'forward' ? 16 : -16;

    el.style.transition = 'opacity 0.2s, transform 0.2s';
    el.style.opacity = '0';
    el.style.transform = `translateY(${outY}px)`;

    setTimeout(() => {
      onDone();
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = `translateY(${inY}px)`;
      // force reflow
      void el.offsetHeight;
      el.style.transition = 'opacity 0.28s, transform 0.28s';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 210);
  }

  function goNext(toStep: number) {
    animateStep('forward', () => setStep(toStep));
  }

  function goBack() {
    animateStep('back', () => setStep((s) => s - 1));
  }

  // ── Step 1 next ──────────────────────────────────────────────────────────
  function handleStep1Next() {
    setStep1Attempted(true);
    if (!step1Valid) return;
    goNext(2);
  }

  // ── Step 2 next ──────────────────────────────────────────────────────────
  function handleStep2Next() {
    setStep2Attempted(true);
    if (!step2Valid) return;
    goNext(3);
  }

  // ── Step 3 submit ────────────────────────────────────────────────────────
  async function handleSubmit() {
    setStep3Attempted(true);
    if (!step3Valid) return;

    setSubmitting(true);

    const ref = generateBookingRef(formData.name, formData.date, formData.slot);
    setBookingRef(ref);
    setLineUrl(buildLineUrl(formData, ref, t));

    const payload = {
      bookingRef: ref,
      name: formData.name,
      phone: normalizePhone(formData.phone),
      email: formData.email,
      service: formData.service,
      size: formData.size,
      area: formData.area,
      date: formData.date,
      slot: formData.slot,
      notes: formData.notes,
    };

    const ok = await postToWebhook(payload, webhookUrl);
    setWebhookSuccess(ok);
    setSubmitting(false);

    try {
      sessionStorage.removeItem('dee_booking_form');
    } catch {
      // ignore
    }

    goNext(4);
  }

  // ── Back button shared ───────────────────────────────────────────────────
  const BackButton = () => (
    <button
      onClick={goBack}
      style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: '13px',
        color: 'var(--muted)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'color 0.15s',
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.color = 'var(--terra)')
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)')
      }
    >
      {b.back ?? '← Back'}
    </button>
  );

  // ── Step heading ─────────────────────────────────────────────────────────
  const StepHeading = ({
    heading,
    subtext,
  }: {
    heading: string;
    subtext: string;
  }) => (
    <div style={{ marginBottom: '32px' }}>
      <h2
        style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontWeight: 500,
          fontSize: '26px',
          color: 'var(--ink)',
          margin: '0 0 10px',
          lineHeight: 1.2,
        }}
      >
        {heading}
      </h2>
      <p
        style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontStyle: 'italic',
          color: 'var(--muted)',
          fontSize: '15px',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {subtext}
      </p>
    </div>
  );

  // ── Focusable input helper ────────────────────────────────────────────────
  const [focusedField, setFocusedField] = useState<string | null>(null);

  function fieldStyle(fieldName: string): React.CSSProperties {
    return {
      ...inputBaseStyle,
      borderBottomColor:
        focusedField === fieldName
          ? 'var(--terra)'
          : 'rgba(26,26,26,0.2)',
    };
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <StepIndicator current={step} total={4} />

      <div ref={stepRef}>
        {/* ══════════════════════════════════════════════════════
            STEP 1 — Contact details
        ══════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div>
            <StepHeading
              heading={b.step1.heading}
              subtext={b.step1.subtext}
            />

            {/* Name */}
            <div style={{ marginBottom: '28px' }}>
              <label htmlFor="bf-name" style={labelStyle}>
                {b.step1.nameLabel}
              </label>
              <input
                id="bf-name"
                type="text"
                required
                autoComplete="name"
                value={formData.name}
                placeholder={b.step1.namePlaceholder}
                onChange={(e) => update('name', e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                style={fieldStyle('name')}
                aria-describedby={
                  step1Attempted && !nameOk ? 'bf-name-err' : undefined
                }
              />
              {step1Attempted && !nameOk && (
                <p id="bf-name-err" style={errorStyle} role="alert">
                  Please enter your name.
                </p>
              )}
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '28px' }}>
              <label htmlFor="bf-phone" style={labelStyle}>
                {b.step1.phonelabel}
              </label>
              <input
                id="bf-phone"
                type="tel"
                required
                autoComplete="tel"
                value={formData.phone}
                placeholder={b.step1.phonePlaceholder}
                onChange={(e) => update('phone', e.target.value)}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                style={fieldStyle('phone')}
                aria-describedby={
                  step1Attempted && !phoneOk ? 'bf-phone-err' : undefined
                }
              />
              {step1Attempted && !phoneOk && (
                <p id="bf-phone-err" style={errorStyle} role="alert">
                  Please enter a valid phone number.
                </p>
              )}
            </div>

            {/* Email */}
            <div style={{ marginBottom: '40px' }}>
              <label htmlFor="bf-email" style={labelStyle}>
                {b.step1.emailLabel}
              </label>
              <input
                id="bf-email"
                type="email"
                autoComplete="email"
                value={formData.email}
                placeholder={b.step1.emailPlaceholder}
                onChange={(e) => update('email', e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                style={fieldStyle('email')}
                aria-describedby={
                  step1Attempted && !emailOk ? 'bf-email-err' : undefined
                }
              />
              {step1Attempted && !emailOk && (
                <p id="bf-email-err" style={errorStyle} role="alert">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            <button
              onClick={handleStep1Next}
              disabled={step1Attempted && !step1Valid}
              className="btn-terra"
              style={{
                opacity: step1Attempted && !step1Valid ? 0.5 : 1,
                cursor:
                  step1Attempted && !step1Valid ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                padding: '12px 32px',
              }}
            >
              {b.next ?? 'Next →'}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 2 — Service & details
        ══════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div>
            <BackButton />
            <StepHeading
              heading={b.step2.heading}
              subtext={b.step2.subtext}
            />

            {/* Service cards */}
            <div
              style={{ marginBottom: '32px' }}
              role="radiogroup"
              aria-label={b.step2.heading}
            >
              {t.services?.items?.map(
                (svc: ServiceItem & { id?: string }, idx: number) => {
                  const svcId = (svc as any).id ?? String(idx);
                  const isSelected = formData.service === svcId;
                  return (
                    <button
                      key={svcId}
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        update('service', svcId);
                        update('serviceLabel', svc.name);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        border: `1px solid ${isSelected ? 'var(--terra)' : 'var(--line)'}`,
                        background: isSelected
                          ? 'var(--paper-deep)'
                          : 'var(--paper)',
                        padding: '16px 20px',
                        marginBottom: '10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '12px',
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontFamily: 'Fraunces, Georgia, serif',
                              fontWeight: 500,
                              fontSize: '17px',
                              color: isSelected ? 'var(--terra)' : 'var(--ink)',
                              margin: '0 0 4px',
                              transition: 'color 0.15s',
                            }}
                          >
                            {svc.name}
                          </p>
                          <p
                            style={{
                              fontFamily: 'Manrope, sans-serif',
                              fontSize: '13px',
                              color: 'var(--muted)',
                              margin: 0,
                            }}
                          >
                            {svc.desc}
                          </p>
                        </div>
                        <span
                          style={{
                            fontFamily: 'Fraunces, Georgia, serif',
                            fontWeight: 600,
                            color: 'var(--terra)',
                            flexShrink: 0,
                            fontSize: '15px',
                            marginTop: '2px',
                          }}
                        >
                          {svc.price}
                        </span>
                      </div>
                    </button>
                  );
                }
              )}
              {step2Attempted && !formData.service && (
                <p style={errorStyle} role="alert">
                  Please select a service.
                </p>
              )}
            </div>

            {/* Size segmented control */}
            <fieldset style={{ border: 'none', padding: 0, marginBottom: '28px' }}>
              <legend style={labelStyle}>{b.step2.sizeLabel}</legend>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                {[
                  { key: 'small', label: b.step2.sizeSmall },
                  { key: 'medium', label: b.step2.sizeMedium },
                  { key: 'large', label: b.step2.sizeLarge },
                ].map(({ key, label }) => {
                  const isActive = formData.size === label;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => update('size', label)}
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 600,
                        fontSize: '13px',
                        padding: '9px 18px',
                        border: `1px solid ${isActive ? 'var(--terra)' : 'var(--line)'}`,
                        background: isActive ? 'var(--terra)' : 'var(--paper)',
                        color: isActive ? 'var(--paper)' : 'var(--ink)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {step2Attempted && !formData.size && (
                <p style={errorStyle} role="alert">
                  Please select a size.
                </p>
              )}
            </fieldset>

            {/* Neighborhood select */}
            <div style={{ marginBottom: '28px' }}>
              <label htmlFor="bf-area" style={labelStyle}>
                {b.step2.areaLabel}
              </label>
              <select
                id="bf-area"
                value={formData.area}
                onChange={(e) => update('area', e.target.value)}
                onFocus={() => setFocusedField('area')}
                onBlur={() => setFocusedField(null)}
                style={{
                  width: '100%',
                  background: 'var(--paper)',
                  border: 'none',
                  borderBottom: `1px solid ${focusedField === 'area' ? 'var(--terra)' : 'rgba(26,26,26,0.2)'}`,
                  padding: '10px 0',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: formData.area ? 'var(--ink)' : 'var(--muted)',
                  outline: 'none',
                  borderRadius: 0,
                  cursor: 'pointer',
                  appearance: 'none' as const,
                  transition: 'border-color 0.15s',
                }}
              >
                <option value="">
                  {lang === 'th' ? 'เลือกย่าน...' : 'Select neighbourhood...'}
                </option>
                {b.step2.areas?.map((opt: string) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {step2Attempted && !formData.area && (
                <p style={errorStyle} role="alert">
                  Please select your area.
                </p>
              )}
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '40px' }}>
              <label htmlFor="bf-notes" style={labelStyle}>
                {b.step2.notesLabel}
              </label>
              <textarea
                id="bf-notes"
                value={formData.notes}
                onChange={(e) => update('notes', e.target.value)}
                onFocus={() => setFocusedField('notes')}
                onBlur={() => setFocusedField(null)}
                placeholder={b.step2.notesPlaceholder}
                rows={3}
                style={{
                  width: '100%',
                  background: 'var(--paper)',
                  border: 'none',
                  borderBottom: `1px solid ${focusedField === 'notes' ? 'var(--terra)' : 'rgba(26,26,26,0.2)'}`,
                  padding: '10px 0',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: 'var(--ink)',
                  outline: 'none',
                  borderRadius: 0,
                  resize: 'none' as const,
                  transition: 'border-color 0.15s',
                }}
              />
            </div>

            <button
              onClick={handleStep2Next}
              disabled={step2Attempted && !step2Valid}
              className="btn-terra"
              style={{
                opacity: step2Attempted && !step2Valid ? 0.5 : 1,
                cursor:
                  step2Attempted && !step2Valid ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                padding: '12px 32px',
              }}
            >
              {b.next ?? 'Next →'}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 3 — Date & time
        ══════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div>
            <BackButton />
            <StepHeading
              heading={b.step3.heading}
              subtext={b.step3.subtext}
            />

            {/* Date */}
            <div style={{ marginBottom: '32px' }}>
              <label htmlFor="bf-date" style={labelStyle}>
                {b.step3.dateLabel}
              </label>
              <input
                id="bf-date"
                type="date"
                value={formData.date}
                min={tomorrowStr}
                max={maxDateStr}
                onChange={(e) => update('date', e.target.value)}
                onFocus={() => setFocusedField('date')}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...fieldStyle('date'),
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                }}
              />
              {step3Attempted && !formData.date && (
                <p style={errorStyle} role="alert">
                  Please choose a date.
                </p>
              )}
            </div>

            {/* Time slot cards */}
            <fieldset style={{ border: 'none', padding: 0, marginBottom: '12px' }}>
              <legend style={labelStyle}>{b.step3.slotLabel}</legend>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                }}
              >
                {(
                  [
                    {
                      key: 'morning',
                      label: b.step3.morning,
                      time: b.step3.morningTime,
                    },
                    {
                      key: 'afternoon',
                      label: b.step3.afternoon,
                      time: b.step3.afternoonTime,
                    },
                    {
                      key: 'evening',
                      label: b.step3.evening,
                      time: b.step3.eveningTime,
                    },
                  ] as const
                ).map(({ key, label, time }) => {
                  const isSelected = formData.slot === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() =>
                        update('slot', key as 'morning' | 'afternoon' | 'evening')
                      }
                      style={{
                        textAlign: 'center',
                        padding: '18px 10px',
                        border: `1px solid ${isSelected ? 'var(--terra)' : 'rgba(26,26,26,0.15)'}`,
                        boxShadow: isSelected
                          ? 'inset 0 0 0 1px var(--terra)'
                          : 'none',
                        background: 'var(--paper)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'Fraunces, Georgia, serif',
                          fontWeight: 500,
                          fontSize: '17px',
                          color: isSelected ? 'var(--terra)' : 'var(--ink)',
                          margin: '0 0 4px',
                          transition: 'color 0.15s',
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '10px',
                          color: 'var(--muted)',
                          margin: '0 0 8px',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {time}
                      </p>
                      <p
                        style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '11px',
                          color: 'var(--terra)',
                          margin: 0,
                          opacity: isSelected ? 1 : 0,
                          transition: 'opacity 0.2s',
                        }}
                        aria-hidden={!isSelected}
                      >
                        {b.step3.chosen}
                      </p>
                    </button>
                  );
                })}
              </div>
              {step3Attempted && !formData.slot && (
                <p style={errorStyle} role="alert">
                  Please choose a time slot.
                </p>
              )}
            </fieldset>

            {/* Preference note */}
            <p
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontStyle: 'italic',
                fontSize: '13px',
                color: 'var(--muted)',
                marginBottom: '40px',
                lineHeight: 1.5,
              }}
            >
              {b.step3.preferenceNote}
            </p>

            <button
              onClick={handleSubmit}
              disabled={submitting || (step3Attempted && !step3Valid)}
              className="btn-terra"
              style={{
                opacity:
                  submitting || (step3Attempted && !step3Valid) ? 0.5 : 1,
                cursor:
                  submitting || (step3Attempted && !step3Valid)
                    ? 'not-allowed'
                    : 'pointer',
                fontSize: '14px',
                padding: '12px 32px',
              }}
            >
              {submitting
                ? (b.submitting ?? 'Sending...')
                : (b.submitRequest ?? b.submit ?? 'Submit request →')}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 4 — Confirmation
        ══════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div>
            {/* Webhook error banner */}
            {webhookSuccess === false && (
              <div
                role="alert"
                style={{
                  border: '1px solid var(--terra)',
                  background: 'rgba(184,92,60,0.06)',
                  borderRadius: '4px',
                  padding: '14px 18px',
                  marginBottom: '24px',
                }}
              >
                <p
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '13px',
                    color: 'var(--terra)',
                    margin: 0,
                    lineHeight: 1.55,
                  }}
                >
                  {b.step4.errorMessage}
                </p>
              </div>
            )}

            {/* Heading */}
            <div style={{ marginBottom: '28px' }}>
              <h2
                style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontWeight: 500,
                  fontSize: '26px',
                  color: 'var(--ink)',
                  margin: '0 0 10px',
                  lineHeight: 1.2,
                }}
              >
                <span style={{ color: 'var(--terra)' }}>✓ </span>
                {b.step4.heading}
              </h2>
              <p
                style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontStyle: 'italic',
                  color: 'var(--muted)',
                  fontSize: '15px',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {b.step4.subtext}
              </p>
            </div>

            {/* Summary card */}
            <div
              style={{
                background: 'var(--paper-deep)',
                border: '1px solid rgba(26,26,26,0.15)',
                borderRadius: '4px',
                padding: '20px 24px',
                marginBottom: '28px',
              }}
            >
              <p
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  margin: '0 0 16px',
                }}
              >
                {b.step4.summaryLabel}
              </p>

              {(
                [
                  { label: b.step4.serviceLabel, value: formData.serviceLabel },
                  { label: b.step4.sizeLabel, value: formData.size },
                  { label: b.step4.areaLabel, value: formData.area },
                  {
                    label: b.step4.whenLabel,
                    value: formatDateDisplay(formData.date, formData.slot, t),
                  },
                  { label: b.step4.nameLabel, value: formData.name },
                  {
                    label: b.step4.phoneLabel,
                    value: normalizePhone(formData.phone),
                  },
                  ...(formData.notes
                    ? [{ label: b.step4.notesLabel, value: formData.notes }]
                    : []),
                ] as { label: string; value: string }[]
              ).map(({ label, value }, idx, arr) => (
                <div key={label}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '100px 1fr',
                      gap: '12px',
                      padding: '10px 0',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 600,
                        fontSize: '11px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--muted)',
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '14px',
                        color: 'var(--ink)',
                        lineHeight: 1.4,
                      }}
                    >
                      {value}
                    </span>
                  </div>
                  {idx < arr.length - 1 && (
                    <div
                      style={{
                        borderBottom: '1px dotted var(--line)',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Reassurance lines */}
            <p
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '13px',
                color: 'var(--muted)',
                margin: '0 0 6px',
                lineHeight: 1.6,
              }}
            >
              {b.step4.lineConfirm1}
            </p>
            <p
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '13px',
                color: 'var(--muted)',
                margin: '0 0 28px',
                lineHeight: 1.6,
              }}
            >
              {b.step4.lineConfirm2}
            </p>

            {/* LINE button */}
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-terra"
              style={{
                display: 'inline-flex',
                fontSize: '15px',
                padding: '14px 32px',
                marginBottom: '16px',
                textDecoration: 'none',
              }}
            >
              {b.step4.lineButton}
            </a>

            {/* Call fallback */}
            <p
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '13px',
                color: 'var(--muted)',
                margin: 0,
              }}
            >
              {b.step4.callFallback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
