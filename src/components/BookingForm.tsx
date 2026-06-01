import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ServiceOption {
  id: string;
  name: string;
  desc: string;
  price: string;
}

interface BookingTranslations {
  back: string;
  eyebrow: string;
  heading: string;
  subtext: string;
  step1_heading: string;
  step2_heading: string;
  step3_heading: string;
  next: string;
  submit: string;
  size_label: string;
  area_label: string;
  areas_options: string[];
  time_label: string;
  times: string[];
  date_label: string;
  notes_label: string;
  notes_placeholder: string;
  services: ServiceOption[];
}

interface Props {
  t: BookingTranslations;
  lang: 'en' | 'th';
  initialService?: string;
  initialSize?: string;
  initialAddons?: string;
}

const SIZES = ['Under 50 sqm', '50–80 sqm', '80+ sqm'];
const SIZES_TH = ['ไม่เกิน 50 ตร.ม.', '50–80 ตร.ม.', '80+ ตร.ม.'];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-4 mb-10" aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`font-serif italic text-lg transition-colors duration-300 ${
            i + 1 === current ? 'text-terra' : i + 1 < current ? 'text-muted line-through' : 'text-muted'
          }`}
          aria-current={i + 1 === current ? 'step' : undefined}
        >
          {i + 1}
        </span>
      ))}
    </div>
  );
}

export default function BookingForm({ t, lang, initialService, initialSize, initialAddons }: Props) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(
    initialService ? t.services.find((s) => s.id === initialService) ?? null : null
  );
  const [size, setSize] = useState(initialSize ?? '');
  const [area, setArea] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');

  const stepRef = useRef<HTMLDivElement>(null);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sizes = lang === 'th' ? SIZES_TH : SIZES;

  function animateTransition(direction: 'forward' | 'back', onDone: () => void) {
    const el = stepRef.current;
    if (!el) { onDone(); return; }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { onDone(); return; }

    const outY = direction === 'forward' ? -20 : 20;
    const inY = direction === 'forward' ? 20 : -20;

    gsap.to(el, {
      y: outY,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        onDone();
        gsap.fromTo(el, { y: inY, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
      },
    });
  }

  function selectService(svc: ServiceOption) {
    setSelectedService(svc);
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => {
      animateTransition('forward', () => setStep(2));
    }, 400);
  }

  function goToStep3() {
    animateTransition('forward', () => setStep(3));
  }

  function goBack() {
    animateTransition('back', () => setStep((s) => s - 1));
  }

  function formatDate(raw: string): string {
    if (!raw) return 'TBD';
    try {
      return new Date(raw).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return raw;
    }
  }

  function handleSubmit() {
    const lines = [
      lang === 'th' ? "สวัสดี ดี คลีนนิ่ง! ต้องการจองบริการ:" : "Hi Dee Cleaning Co.! I'd like to book:",
      `→ ${lang === 'th' ? 'บริการ' : 'Service'}: ${selectedService?.name ?? ''}`,
      `→ ${lang === 'th' ? 'ขนาด' : 'Size'}: ${size}`,
      `→ ${lang === 'th' ? 'พื้นที่' : 'Area'}: ${area}`,
      `→ ${lang === 'th' ? 'วันที่' : 'Date'}: ${formatDate(date)}`,
      `→ ${lang === 'th' ? 'เวลา' : 'Time'}: ${timeSlot}`,
    ];
    if (notes) lines.push(`→ ${lang === 'th' ? 'หมายเหตุ' : 'Notes'}: ${notes}`);
    const message = lines.join('\n');
    // LINE @ID: @deecleaning [PLACEHOLDER]
    window.location.href = `https://line.me/R/oaMessage/@deecleaning/?${encodeURIComponent(message)}`;
  }

  const isStep2Valid = size && area;
  const isStep3Valid = date && timeSlot;

  // Today's date for min attr
  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <StepIndicator current={step} total={3} />

      <div ref={stepRef}>
        {/* Step 1: Service selection */}
        {step === 1 && (
          <div>
            <h2 className="font-serif font-medium text-2xl md:text-3xl text-ink mb-8">
              {t.step1_heading}
            </h2>
            <div className="space-y-3" role="radiogroup" aria-label={t.step1_heading}>
              {t.services.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => selectService(svc)}
                  className={`w-full text-left border p-5 transition-all duration-200 group ${
                    selectedService?.id === svc.id
                      ? 'border-terra bg-paper-deep'
                      : 'border-line bg-paper hover:border-terra'
                  }`}
                  style={{ borderRadius: 4 }}
                  role="radio"
                  aria-checked={selectedService?.id === svc.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`font-serif font-medium text-lg transition-colors ${
                        selectedService?.id === svc.id ? 'text-terra' : 'text-ink group-hover:text-terra'
                      }`}>
                        {svc.name}
                      </p>
                      <p className="font-sans text-muted text-sm mt-1">{svc.desc}</p>
                    </div>
                    <span className="font-serif font-semibold text-terra flex-shrink-0 mt-0.5">
                      {svc.price}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Size & Area */}
        {step === 2 && (
          <div>
            <button
              onClick={goBack}
              className="font-sans text-muted text-sm mb-6 hover:text-terra transition-colors flex items-center gap-1"
            >
              ← {lang === 'th' ? 'ย้อนกลับ' : 'Back'}
            </button>
            <h2 className="font-serif font-medium text-2xl md:text-3xl text-ink mb-8">
              {t.step2_heading}
            </h2>

            {/* Size */}
            <fieldset className="mb-8">
              <legend className="font-sans font-semibold text-xs tracking-widest uppercase text-muted mb-3">
                {t.size_label}
              </legend>
              <div className="flex flex-wrap gap-2" role="group">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`font-sans font-semibold text-sm px-4 py-2.5 border transition-colors duration-150 ${
                      size === s
                        ? 'bg-terra text-paper border-terra'
                        : 'bg-paper text-ink border-line hover:border-terra hover:text-terra'
                    }`}
                    style={{ borderRadius: 4 }}
                    aria-pressed={size === s}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Area */}
            <div className="mb-10">
              <label htmlFor="area-select" className="font-sans font-semibold text-xs tracking-widest uppercase text-muted block mb-3">
                {t.area_label}
              </label>
              <select
                id="area-select"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full border border-line bg-paper font-sans text-sm text-ink px-4 py-3 focus:outline-none focus:border-terra transition-colors"
                style={{ borderRadius: 4 }}
              >
                <option value="">{lang === 'th' ? 'เลือกพื้นที่...' : 'Select area...'}</option>
                {t.areas_options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <button
              onClick={goToStep3}
              disabled={!isStep2Valid}
              className={`btn-terra text-sm px-8 py-3 ${!isStep2Valid ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {t.next}
            </button>
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <div>
            <button
              onClick={goBack}
              className="font-sans text-muted text-sm mb-6 hover:text-terra transition-colors flex items-center gap-1"
            >
              ← {lang === 'th' ? 'ย้อนกลับ' : 'Back'}
            </button>
            <h2 className="font-serif font-medium text-2xl md:text-3xl text-ink mb-8">
              {t.step3_heading}
            </h2>

            {/* Date */}
            <div className="mb-8">
              <label htmlFor="date-input" className="font-sans font-semibold text-xs tracking-widest uppercase text-muted block mb-3">
                {t.date_label}
              </label>
              <input
                id="date-input"
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-line bg-paper font-sans text-sm text-ink px-4 py-3 focus:outline-none focus:border-terra transition-colors"
                style={{ borderRadius: 4 }}
              />
            </div>

            {/* Time slot */}
            <fieldset className="mb-8">
              <legend className="font-sans font-semibold text-xs tracking-widest uppercase text-muted mb-3">
                {t.time_label}
              </legend>
              <div className="flex flex-wrap gap-2" role="group">
                {t.times.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setTimeSlot(slot)}
                    className={`font-sans font-semibold text-sm px-4 py-2.5 border transition-colors duration-150 ${
                      timeSlot === slot
                        ? 'bg-terra text-paper border-terra'
                        : 'bg-paper text-ink border-line hover:border-terra hover:text-terra'
                    }`}
                    style={{ borderRadius: 4 }}
                    aria-pressed={timeSlot === slot}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Notes */}
            <div className="mb-10">
              <label htmlFor="notes-input" className="font-sans font-semibold text-xs tracking-widest uppercase text-muted block mb-3">
                {t.notes_label}
              </label>
              <textarea
                id="notes-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.notes_placeholder}
                rows={3}
                className="w-full border border-line bg-paper font-sans text-sm text-ink px-4 py-3 focus:outline-none focus:border-terra transition-colors resize-none placeholder-muted"
                style={{ borderRadius: 4 }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isStep3Valid}
              className={`btn-terra text-sm px-8 py-3.5 ${!isStep3Valid ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {t.submit}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
