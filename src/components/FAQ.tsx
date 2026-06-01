import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQTranslations {
  section_num: string;
  eyebrow: string;
  items: FAQItem[];
}

interface Props {
  t: FAQTranslations;
}

function FAQRow({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  const answerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = answerRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isOpen) {
      el.style.display = 'block';
      const h = el.scrollHeight;
      if (prefersReduced) {
        el.style.height = h + 'px';
        el.style.opacity = '1';
      } else {
        gsap.fromTo(
          el,
          { height: 0, opacity: 0 },
          { height: h, opacity: 1, duration: 0.35, ease: 'power2.out' }
        );
        if (indicatorRef.current) {
          gsap.to(indicatorRef.current, { rotation: 45, duration: 0.25, ease: 'power2.out' });
        }
      }
    } else {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        el.style.height = '0';
        el.style.opacity = '0';
        el.style.display = 'none';
      } else {
        gsap.to(el, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            el.style.display = 'none';
          },
        });
        if (indicatorRef.current) {
          gsap.to(indicatorRef.current, { rotation: 0, duration: 0.25, ease: 'power2.out' });
        }
      }
    }
  }, [isOpen]);

  return (
    <div className="border-b border-line">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 py-6 text-left group"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${item.q.slice(0, 10)}`}
      >
        <span className="font-serif font-medium text-lg md:text-xl text-ink group-hover:text-terra transition-colors duration-200 flex-1 pr-4">
          {item.q}
        </span>
        <span
          ref={indicatorRef}
          className="font-serif text-terra text-2xl font-medium flex-shrink-0 leading-none mt-0.5 select-none"
          aria-hidden="true"
          style={{ display: 'inline-block' }}
        >
          +
        </span>
      </button>

      <div
        ref={answerRef}
        id={`faq-answer-${item.q.slice(0, 10)}`}
        className="overflow-hidden"
        style={{ display: 'none', height: 0, opacity: 0 }}
        aria-hidden={!isOpen}
      >
        <p className="font-sans text-muted text-base leading-relaxed pb-6">
          {item.a}
        </p>
      </div>
    </div>
  );
}

export default function FAQ({ t }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  function toggle(i: number) {
    setOpenIdx((prev) => (prev === i ? null : i));
  }

  return (
    <section
      id="faq"
      className="py-24 md:py-32 bg-paper-deep"
      aria-labelledby="faq-heading"
    >
      <div className="container mx-auto px-6 md:px-10 lg:px-16">
        <div className="mb-12">
          <p className="section-num mb-2">{t.section_num}</p>
          <h2 id="faq-heading" className="eyebrow">
            {t.eyebrow}
          </h2>
        </div>

        <div className="max-w-2xl border-t border-line">
          {t.items.map((item, i) => (
            <FAQRow
              key={i}
              item={item}
              isOpen={openIdx === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
