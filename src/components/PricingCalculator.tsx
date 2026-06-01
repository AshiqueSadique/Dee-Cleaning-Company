import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface Addon {
  label: string;
  price: number;
}

interface CalcTranslations {
  title: string;
  size_label: string;
  sizes: string[];
  type_label: string;
  types: string[];
  addons_label: string;
  addons: Addon[];
  estimated_caption: string;
  note: string;
  cta: string;
}

interface Props {
  t: CalcTranslations;
  lang: 'en' | 'th';
}

const BASE_PRICES: Record<string, Record<string, number>> = {
  Standard: {
    'Under 50 sqm': 650,
    '50–80 sqm': 950,
    '80+ sqm': 1400,
    // Thai
    'ไม่เกิน 50 ตร.ม.': 650,
    '50–80 ตร.ม.': 950,
    '80+ ตร.ม.': 1400,
  },
  'Deep Clean': { default: 2200 },
  'Monthly Plan': { default: 2400 },
  // Thai service types
  'มาตรฐาน': {
    'ไม่เกิน 50 ตร.ม.': 650,
    '50–80 ตร.ม.': 950,
    '80+ ตร.ม.': 1400,
  },
  'ทำความสะอาดอย่างละเอียด': { default: 2200 },
  'แพ็กเกจรายเดือน': { default: 2400 },
};

function calcPrice(serviceType: string, size: string, addons: boolean[]): number {
  const svcPrices = BASE_PRICES[serviceType];
  let base = 0;

  if (svcPrices) {
    base = svcPrices[size] ?? svcPrices['default'] ?? 0;
  }

  const addonMap = [200, 200, 300, 400];
  const addonTotal = addons.reduce((sum, checked, i) => sum + (checked ? addonMap[i] : 0), 0);

  return base + addonTotal;
}

export default function PricingCalculator({ t, lang }: Props) {
  const [sizeIdx, setSizeIdx] = useState(0);
  const [typeIdx, setTypeIdx] = useState(0);
  const [addonChecks, setAddonChecks] = useState<boolean[]>(t.addons.map(() => false));
  const [displayPrice, setDisplayPrice] = useState(0);
  const priceRef = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const currentPrice = calcPrice(t.types[typeIdx], t.sizes[sizeIdx], addonChecks);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplayPrice(currentPrice);
      return;
    }

    const obj = { val: displayPrice };
    if (tweenRef.current) tweenRef.current.kill();
    tweenRef.current = gsap.to(obj, {
      val: currentPrice,
      duration: 0.4,
      ease: 'power2.out',
      onUpdate() {
        setDisplayPrice(Math.round(obj.val));
      },
    });
  }, [currentPrice]);

  function toggleAddon(i: number) {
    setAddonChecks((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  const bookingParams = new URLSearchParams({
    service: t.types[typeIdx],
    size: t.sizes[sizeIdx],
    addons: addonChecks
      .map((checked, i) => (checked ? t.addons[i].label : null))
      .filter(Boolean)
      .join(','),
  });

  return (
    <div className="bg-paper-deep border border-line p-6 md:p-10" style={{ borderRadius: 2 }}>
      <h3 className="font-serif font-medium text-2xl md:text-3xl text-ink mb-8">
        {t.title}
      </h3>

      <div className="space-y-7">
        {/* Size selector */}
        <fieldset>
          <legend className="font-sans font-semibold text-xs tracking-widest uppercase text-muted mb-3">
            {t.size_label}
          </legend>
          <div className="flex flex-wrap gap-2" role="group">
            {t.sizes.map((size, i) => (
              <button
                key={size}
                onClick={() => setSizeIdx(i)}
                className={`font-sans font-semibold text-sm px-4 py-2 border transition-colors duration-150 ${
                  sizeIdx === i
                    ? 'bg-terra text-paper border-terra'
                    : 'bg-paper text-ink border-line hover:border-terra hover:text-terra'
                }`}
                style={{ borderRadius: 4 }}
                aria-pressed={sizeIdx === i}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Service type selector */}
        <fieldset>
          <legend className="font-sans font-semibold text-xs tracking-widest uppercase text-muted mb-3">
            {t.type_label}
          </legend>
          <div className="flex flex-wrap gap-2" role="group">
            {t.types.map((type, i) => (
              <button
                key={type}
                onClick={() => setTypeIdx(i)}
                className={`font-sans font-semibold text-sm px-4 py-2 border transition-colors duration-150 ${
                  typeIdx === i
                    ? 'bg-terra text-paper border-terra'
                    : 'bg-paper text-ink border-line hover:border-terra hover:text-terra'
                }`}
                style={{ borderRadius: 4 }}
                aria-pressed={typeIdx === i}
              >
                {type}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Add-ons */}
        <fieldset>
          <legend className="font-sans font-semibold text-xs tracking-widest uppercase text-muted mb-3">
            {t.addons_label}
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {t.addons.map((addon, i) => (
              <label
                key={addon.label}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={addonChecks[i]}
                  onChange={() => toggleAddon(i)}
                  className="w-4 h-4 accent-terra cursor-pointer"
                />
                <span className="font-sans text-sm text-ink group-hover:text-terra transition-colors">
                  {addon.label}
                  <span className="text-muted ml-1">(+฿{addon.price})</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Price display */}
      <div className="mt-10 pt-8 border-t border-line text-center">
        <p className="font-sans text-xs tracking-widest uppercase text-muted mb-2">
          {t.estimated_caption}
        </p>
        <div className="font-serif font-semibold text-5xl md:text-6xl text-terra mb-2" aria-live="polite" aria-atomic="true">
          ฿<span ref={priceRef}>{displayPrice.toLocaleString()}</span>
        </div>
        <p className="font-sans text-muted text-sm mb-8">
          {t.note}
        </p>
        <a
          href={`/${lang}/book?${bookingParams.toString()}`}
          className="btn-terra inline-flex text-sm"
        >
          {t.cta}
        </a>
      </div>
    </div>
  );
}
