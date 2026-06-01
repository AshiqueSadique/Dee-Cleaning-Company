import { useRef, useState } from 'react';

interface GalleryTranslations {
  section_num: string;
  eyebrow: string;
  before_label: string;
  after_label: string;
  replace_note: string;
  slides: string[];
}

interface Props {
  t: GalleryTranslations;
}

export default function Gallery({ t }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  function scrollTo(idx: number) {
    if (!scrollRef.current) return;
    const child = scrollRef.current.children[idx] as HTMLElement;
    if (child) {
      scrollRef.current.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
      setActiveIdx(idx);
    }
  }

  function handleScroll() {
    if (!scrollRef.current) return;
    const { scrollLeft, offsetWidth } = scrollRef.current;
    const idx = Math.round(scrollLeft / offsetWidth);
    setActiveIdx(idx);
  }

  return (
    <section
      id="gallery"
      className="py-24 md:py-32 bg-paper"
      aria-labelledby="gallery-heading"
    >
      <div className="container mx-auto px-6 md:px-10 lg:px-16 mb-10">
        <p className="section-num mb-2">{t.section_num}</p>
        <h2
          id="gallery-heading"
          className="eyebrow"
        >
          {t.eyebrow}
        </h2>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="snap-container flex overflow-x-auto gap-0"
        onScroll={handleScroll}
        role="region"
        aria-label="Before and after gallery"
        tabIndex={0}
      >
        {t.slides.map((caption, i) => (
          <div
            key={i}
            className="snap-item flex-shrink-0 w-full md:w-[85vw] lg:w-[75vw] mx-auto"
            role="group"
            aria-label={`Slide ${i + 1}: ${caption}`}
          >
            {/* Before/after split */}
            <div className="flex border-x border-line mx-6 md:mx-10 lg:mx-16 overflow-hidden" style={{ height: 'clamp(240px, 45vw, 520px)' }}>

              {/* BEFORE — cartoon dirty room */}
              <div className="flex-1 border-r border-line relative overflow-hidden flex items-end" style={{ background: '#d6cfc4' }}>
                <svg viewBox="0 0 300 320" xmlns="http://www.w3.org/2000/svg" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} aria-hidden="true">
                  {/* Room walls */}
                  <rect width="300" height="320" fill="#cec5b8"/>
                  <rect y="240" width="300" height="80" fill="#b8ad9e"/>
                  {/* Baseboard */}
                  <rect y="236" width="300" height="8" fill="#a99e8f"/>
                  {/* Wall stains */}
                  <ellipse cx="60" cy="80" rx="35" ry="20" fill="#b8a898" opacity="0.6"/>
                  <ellipse cx="220" cy="120" rx="28" ry="16" fill="#b0a090" opacity="0.5"/>
                  <ellipse cx="140" cy="50" rx="20" ry="12" fill="#b5a593" opacity="0.4"/>
                  {/* Cobweb top-left */}
                  <g stroke="#a09080" strokeWidth="0.8" opacity="0.7" fill="none">
                    <line x1="0" y1="0" x2="40" y2="30"/>
                    <line x1="0" y1="0" x2="55" y2="10"/>
                    <line x1="0" y1="0" x2="20" y2="45"/>
                    <path d="M 12,9 Q 20,15 28,21"/>
                    <path d="M 20,15 Q 30,20 38,24"/>
                    <circle cx="38" cy="24" r="3" fill="#a09080" opacity="0.5"/>
                  </g>
                  {/* Cobweb top-right */}
                  <g stroke="#a09080" strokeWidth="0.8" opacity="0.6" fill="none" transform="translate(300,0) scale(-1,1)">
                    <line x1="0" y1="0" x2="40" y2="30"/>
                    <line x1="0" y1="0" x2="55" y2="10"/>
                    <line x1="0" y1="0" x2="20" y2="45"/>
                    <path d="M 12,9 Q 20,15 28,21"/>
                    <path d="M 20,15 Q 30,20 38,24"/>
                    <circle cx="38" cy="24" r="3" fill="#a09080" opacity="0.5"/>
                  </g>
                  {/* Dirty window */}
                  <rect x="110" y="40" width="80" height="70" rx="3" fill="#c8d4d0" opacity="0.5" stroke="#a09080" strokeWidth="2"/>
                  <line x1="150" y1="40" x2="150" y2="110" stroke="#a09080" strokeWidth="1.5"/>
                  <line x1="110" y1="75" x2="190" y2="75" stroke="#a09080" strokeWidth="1.5"/>
                  {/* Window grime smears */}
                  <ellipse cx="135" cy="60" rx="12" ry="6" fill="#a09580" opacity="0.3" transform="rotate(-15,135,60)"/>
                  <ellipse cx="165" cy="88" rx="8" ry="4" fill="#a09580" opacity="0.25" transform="rotate(10,165,88)"/>
                  {/* Trash pile */}
                  <ellipse cx="55" cy="248" rx="42" ry="14" fill="#8a7d6e" opacity="0.4"/>
                  <rect x="30" y="220" width="24" height="32" rx="3" fill="#7a6e5e"/>
                  <rect x="32" y="218" width="20" height="5" rx="2" fill="#6a5e50"/>
                  {/* Crumpled paper */}
                  <polygon points="60,240 75,225 90,238 80,250 62,252" fill="#d4cabb" stroke="#b0a490" strokeWidth="1"/>
                  <line x1="65" y1="243" x2="78" y2="230" stroke="#b0a490" strokeWidth="0.8"/>
                  {/* Pizza box */}
                  <rect x="15" y="235" width="35" height="22" rx="2" fill="#c8a87a" stroke="#a08858" strokeWidth="1"/>
                  <line x1="15" y1="246" x2="50" y2="246" stroke="#a08858" strokeWidth="0.8"/>
                  {/* Dirty mug on floor */}
                  <rect x="220" y="230" width="22" height="20" rx="3" fill="#9a8878"/>
                  <path d="M242,235 Q250,240 242,245" fill="none" stroke="#9a8878" strokeWidth="2"/>
                  <ellipse cx="231" cy="230" rx="11" ry="4" fill="#8a7868"/>
                  {/* Spill */}
                  <ellipse cx="231" cy="252" rx="18" ry="5" fill="#7a6858" opacity="0.5"/>
                  {/* Dust bunnies */}
                  <ellipse cx="160" cy="258" rx="14" ry="7" fill="#b8b0a0" opacity="0.7"/>
                  <ellipse cx="155" cy="256" rx="8" ry="5" fill="#c0b8a8" opacity="0.6"/>
                  <ellipse cx="167" cy="255" rx="7" ry="4" fill="#b4ac9c" opacity="0.6"/>
                  {/* Floating dust motes */}
                  <circle cx="85" cy="160" r="2" fill="#a09080" opacity="0.5"/>
                  <circle cx="200" cy="140" r="1.5" fill="#a09080" opacity="0.4"/>
                  <circle cx="130" cy="180" r="2.5" fill="#a09080" opacity="0.35"/>
                  <circle cx="250" cy="200" r="1.5" fill="#a09080" opacity="0.45"/>
                  {/* Sad face on wall */}
                  <circle cx="240" cy="70" r="18" fill="none" stroke="#9a8878" strokeWidth="1.5" opacity="0.4"/>
                  <circle cx="234" cy="65" r="2" fill="#9a8878" opacity="0.4"/>
                  <circle cx="246" cy="65" r="2" fill="#9a8878" opacity="0.4"/>
                  <path d="M234,76 Q240,72 246,76" fill="none" stroke="#9a8878" strokeWidth="1.5" opacity="0.4"/>
                  {/* Flies */}
                  <g opacity="0.6">
                    <circle cx="100" cy="230" r="3" fill="#5a5040"/>
                    <ellipse cx="96" cy="228" rx="5" ry="2.5" fill="#7a7060" opacity="0.5" transform="rotate(-20,96,228)"/>
                    <ellipse cx="104" cy="228" rx="5" ry="2.5" fill="#7a7060" opacity="0.5" transform="rotate(20,104,228)"/>
                  </g>
                  <g opacity="0.5">
                    <circle cx="175" cy="215" r="2.5" fill="#5a5040"/>
                    <ellipse cx="171" cy="213" rx="4" ry="2" fill="#7a7060" opacity="0.5" transform="rotate(-20,171,213)"/>
                    <ellipse cx="179" cy="213" rx="4" ry="2" fill="#7a7060" opacity="0.5" transform="rotate(20,179,213)"/>
                  </g>
                </svg>
                {/* Label */}
                <div style={{ position:'relative', zIndex:2, padding:'16px 20px' }}>
                  <p style={{ fontFamily:"'Manrope',sans-serif", fontWeight:700, fontSize:'9px', letterSpacing:'0.4em', textTransform:'uppercase', color:'rgba(90,72,52,0.8)' }}>
                    {t.before_label}
                  </p>
                </div>
              </div>

              {/* AFTER — cartoon clean room */}
              <div className="flex-1 relative overflow-hidden flex items-end justify-end" style={{ background: '#f6f1e7' }}>
                <svg viewBox="0 0 300 320" xmlns="http://www.w3.org/2000/svg" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} aria-hidden="true">
                  {/* Room walls */}
                  <rect width="300" height="320" fill="#f6f1e7"/>
                  <rect y="240" width="300" height="80" fill="#ede7d8"/>
                  {/* Baseboard */}
                  <rect y="236" width="300" height="8" fill="#ddd7c8"/>
                  {/* Clean window with light */}
                  <rect x="110" y="40" width="80" height="70" rx="3" fill="#daeef5" stroke="#c9bea6" strokeWidth="2"/>
                  <line x1="150" y1="40" x2="150" y2="110" stroke="#c9bea6" strokeWidth="1.5"/>
                  <line x1="110" y1="75" x2="190" y2="75" stroke="#c9bea6" strokeWidth="1.5"/>
                  {/* Sunlight rays from window */}
                  <path d="M150,110 L110,200" stroke="#f0d080" strokeWidth="18" opacity="0.15"/>
                  <path d="M160,110 L200,200" stroke="#f0d080" strokeWidth="12" opacity="0.12"/>
                  {/* Plant in corner */}
                  <rect x="240" y="210" width="28" height="34" rx="4" fill="#b85c3c" opacity="0.8"/>
                  <rect x="244" y="207" width="20" height="6" rx="2" fill="#a04e30"/>
                  <ellipse cx="254" cy="195" rx="20" ry="22" fill="#5a8a4a"/>
                  <ellipse cx="242" cy="205" rx="14" ry="16" fill="#4e7a40"/>
                  <ellipse cx="266" cy="202" rx="13" ry="15" fill="#5e9050"/>
                  <ellipse cx="254" cy="183" rx="10" ry="14" fill="#6a9a58"/>
                  {/* Neatly folded towel stack */}
                  <rect x="20" y="230" width="50" height="12" rx="2" fill="#e8e0d0" stroke="#d0c8b8" strokeWidth="1"/>
                  <rect x="22" y="218" width="46" height="12" rx="2" fill="#f0e8d8" stroke="#d8d0c0" strokeWidth="1"/>
                  <rect x="24" y="206" width="42" height="12" rx="2" fill="#ece4d4" stroke="#d4ccbc" strokeWidth="1"/>
                  {/* Sparkles */}
                  <text x="68" y="95" fontSize="16" fill="#b85c3c" opacity="0.7">✦</text>
                  <text x="30" y="160" fontSize="11" fill="#b85c3c" opacity="0.5">✦</text>
                  <text x="255" y="145" fontSize="13" fill="#b85c3c" opacity="0.55">✦</text>
                  {/* Gleam on floor */}
                  <ellipse cx="150" cy="268" rx="60" ry="8" fill="white" opacity="0.3"/>
                  {/* Smiley face on wall */}
                  <circle cx="240" cy="70" r="18" fill="none" stroke="#b85c3c" strokeWidth="1.5" opacity="0.35"/>
                  <circle cx="234" cy="65" r="2" fill="#b85c3c" opacity="0.35"/>
                  <circle cx="246" cy="65" r="2" fill="#b85c3c" opacity="0.35"/>
                  <path d="M234,74 Q240,80 246,74" fill="none" stroke="#b85c3c" strokeWidth="1.5" opacity="0.35"/>
                  {/* Bubbles floating */}
                  <circle cx="80" cy="180" r="8" fill="none" stroke="#b85c3c" strokeWidth="1" opacity="0.3"/>
                  <circle cx="77" cy="177" r="2" fill="white" opacity="0.4"/>
                  <circle cx="200" cy="155" r="5" fill="none" stroke="#b85c3c" strokeWidth="1" opacity="0.25"/>
                  <circle cx="198" cy="153" r="1.5" fill="white" opacity="0.4"/>
                  <circle cx="120" cy="200" r="6" fill="none" stroke="#b85c3c" strokeWidth="1" opacity="0.2"/>
                </svg>
                {/* Label */}
                <div style={{ position:'relative', zIndex:2, padding:'16px 20px' }}>
                  <p style={{ fontFamily:"'Manrope',sans-serif", fontWeight:700, fontSize:'9px', letterSpacing:'0.4em', textTransform:'uppercase', color:'rgba(184,92,60,0.8)' }}>
                    {t.after_label}
                  </p>
                </div>
              </div>

            </div>

            {/* Caption */}
            <p className="font-sans text-muted text-sm mt-4 text-center px-6">
              {caption}
            </p>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-8 px-6" role="tablist" aria-label="Gallery navigation">
        {t.slides.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`transition-all duration-200 ${
              activeIdx === i
                ? 'w-6 h-1.5 bg-terra'
                : 'w-1.5 h-1.5 bg-line hover:bg-muted'
            }`}
            style={{ borderRadius: 1 }}
            role="tab"
            aria-selected={activeIdx === i}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
