import { useEffect, useRef, useState, type RefObject, type ChangeEvent } from 'react'

const asset = (name: string) => new URL(`../assets/${name}`, import.meta.url).href

const heroVideo = asset('IMG_5973.MP4')

// Dynamically load all photo_2026-08-15 memories for the collage
const memoriesGlob = import.meta.glob<{ default: string }>(
  '../assets/photo_2026-08-15_*.jpg',
  { eager: true }
)
const memoryPhotos: string[] = Object.values(memoriesGlob)
  .map((m) => m.default)
  .sort()

const albumMusic = asset('Album Page.mp3')
import imgBouquet from '@/imports/061576612878c47a4262f1fa76214ab6.jpg'
import imgMyOnlyLove from '@/imports/05a0f047f03e9a78346ac78e922c4543.jpg'
import imgDefinition from '@/imports/964276ba446619ccd25674ae91bff98e.jpg'
import imgIFoundYou from '@/imports/bdd8b6daabe3c5b06e8843ec7f562ffb.jpg'
import imgCameras from '@/imports/1932e3ee226fd9bf28a923c9a1e56d75.jpg'

// Personal timeline photos
const mAug15  = asset('August 15.jpg')
const mSep15  = asset('September 15.jpg')
const mOct15  = asset('October 15.jpg')
const mNov15  = asset('November 15.jpg')
const mDec16  = asset('December 16.jpg')
const mJan15  = asset('January 15.jpg')
const mFeb14  = asset('February 14.jpg')
const mFeb15  = asset('February 15.jpg')
const mMar16  = asset('March 16.jpg')
const mApr10  = asset('April 10.jpg')
const mMay23  = asset('May 23.jpg')
const mJun20  = asset('June 20.jpg')
const mJul15  = asset('July 15.jpg')

// Supplemental Unsplash imagery — all treated as B&W via CSS
const U = {
  kiss: 'https://images.unsplash.com/photo-1496429946712-acb085074b51?w=900&h=620&fit=crop&auto=format',
  field: 'https://images.unsplash.com/photo-1693129551108-c1e0ab10f10e?w=900&h=620&fit=crop&auto=format',
  hug:   'https://images.unsplash.com/photo-1726766406089-0308c800b6b2?w=900&h=620&fit=crop&auto=format',
  kiss2: 'https://images.unsplash.com/photo-1618806338489-4ede060592f3?w=700&h=950&fit=crop&auto=format',
  laugh: 'https://images.unsplash.com/photo-1546418608-3cf6027ffeac?w=700&h=480&fit=crop&auto=format',
  grass: 'https://images.unsplash.com/photo-1694393974535-f6593880e138?w=700&h=900&fit=crop&auto=format',
  lake:  'https://images.unsplash.com/photo-1655640061626-c1b0e4f81b1f?w=700&h=500&fit=crop&auto=format',
  close: 'https://images.unsplash.com/photo-1611570672550-218b8c8df93c?w=700&h=500&fit=crop&auto=format',
}

// ─── Scroll-fade hook ────────────────────────────────────────────────────────
function useInView(threshold = 0.12): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return [ref, inView]
}

function Reveal({ children, delay = 0, className = '' }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 1s ease ${delay}ms, transform 1s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ─── Pill caption tag ────────────────────────────────────────────────────────
function Tag({ text }: { text: string }) {
  return (
    <span
      className="font-sans inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]"
      style={{ borderColor: 'var(--border-fine)', color: 'var(--muted)' }}
    >
      {text}
    </span>
  )
}

// ─── Timeline entry ──────────────────────────────────────────────────────────
function TimelineEntry({
  date, label, memory, imgSrc, imgAlt, side, isImported, objectPosition,
}: {
  date: string
  label: string
  memory: string
  imgSrc: string
  imgAlt: string
  side: 'left' | 'right'
  isImported?: boolean
  objectPosition?: string
}) {
  const [ref, inView] = useInView(0.1)
  return (
    <div
      ref={ref}
      className={`flex flex-col md:flex-row items-center gap-10 md:gap-16 ${side === 'right' ? 'md:flex-row-reverse' : ''}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 1.1s ease, transform 1.1s ease',
      }}
    >
      {/* Image */}
      <div className="w-full md:w-1/2 relative">
        <div
          className="overflow-hidden bg-gray-200"
          style={{ aspectRatio: '4/3' }}
        >
          <img
            src={imgSrc}
            alt={imgAlt}
            className="w-full h-full object-cover grayscale-photo"
            style={{ objectPosition: objectPosition ?? (isImported ? 'center top' : 'center') }}
          />
        </div>
        {/* Floating tag */}
        <div
          className={`absolute -bottom-3 ${side === 'left' ? '-right-3' : '-left-3'} bg-[var(--paper)] border px-3 py-1.5`}
          style={{ borderColor: 'var(--border-fine)' }}
        >
          <Tag text={label} />
        </div>
      </div>

      {/* Text */}
      <div className="w-full md:w-1/2 flex flex-col gap-3">
        <p
          className="font-sans text-[11px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--muted)' }}
        >
          {date}
        </p>
        <p
          className="font-serif text-xl md:text-2xl leading-relaxed"
          style={{ color: 'var(--ink-soft)' }}
        >
          {memory}
        </p>
      </div>
    </div>
  )
}

// ─── Intro Overlay ───────────────────────────────────────────────────────────
function IntroOverlay({ onDone }: { onDone: () => void }) {
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setHiding(true)
      setTimeout(onDone, 900)
    }, 2800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-[100]"
      style={{
        background: 'var(--ink)',
        animation: hiding ? 'introFadeOut 0.9s ease forwards' : 'none',
        pointerEvents: hiding ? 'none' : 'all',
      }}
    >
      {/* Top line */}
      <div
        className="w-12 h-px mb-10 origin-left"
        style={{
          background: 'rgba(245,243,238,0.25)',
          animation: 'introLineGrow 0.6s ease 0.3s forwards',
          transform: 'scaleX(0)',
        }}
      />

      <p
        className="font-sans text-[10px] uppercase tracking-[0.35em] mb-6"
        style={{
          color: 'rgba(245,243,238,0.4)',
          animation: 'introSubIn 0.7s ease 0.5s forwards',
          opacity: 0,
        }}
      >
        August 14, 2024 — August 14, 2025
      </p>

      <h1
        className="font-script text-center"
        style={{
          fontSize: 'clamp(3rem, 10vw, 6.5rem)',
          color: '#F5F3EE',
          lineHeight: 1.1,
          animation: 'introScriptIn 1s ease 0.4s forwards',
          opacity: 0,
        }}
      >
        365 Days With You
      </h1>

      <p
        className="font-serif italic mt-5 text-lg"
        style={{
          color: 'rgba(245,243,238,0.45)',
          animation: 'introSubIn 0.8s ease 1.1s forwards',
          opacity: 0,
        }}
      >
        a love story in photographs
      </p>

      {/* Bottom line */}
      <div
        className="w-12 h-px mt-10 origin-left"
        style={{
          background: 'rgba(245,243,238,0.25)',
          animation: 'introLineGrow 0.6s ease 0.3s forwards',
          transform: 'scaleX(0)',
        }}
      />
    </div>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({
  photos,
  index,
  onClose,
}: {
  photos: string[]
  index: number
  onClose: () => void
}) {
  const [current, setCurrent] = useState(index)

  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length)
  const next = () => setCurrent((c) => (c + 1) % photos.length)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center"
      style={{ animation: 'lbBgIn 0.3s ease forwards' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Image */}
      <div
        key={current}
        className="relative z-10 flex items-center justify-center"
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          animation: 'lbIn 0.25s ease forwards',
        }}
      >
        <img
          src={photos[current]}
          alt={`Memory ${current + 1}`}
          className="max-w-full max-h-[85vh] object-contain"
          style={{ boxShadow: '0 8px 60px rgba(0,0,0,0.6)' }}
        />
      </div>

      {/* Counter */}
      <p
        className="absolute bottom-6 left-1/2 -translate-x-1/2 font-sans text-[10px] uppercase tracking-[0.25em] z-10"
        style={{ color: 'rgba(245,243,238,0.4)' }}
      >
        {current + 1} / {photos.length}
      </p>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); prev() }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 transition-opacity hover:opacity-100 opacity-60"
        aria-label="Previous photo"
        style={{ background: 'rgba(245,243,238,0.08)', border: '1px solid rgba(245,243,238,0.15)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5F3EE" strokeWidth="1.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); next() }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 transition-opacity hover:opacity-100 opacity-60"
        aria-label="Next photo"
        style={{ background: 'rgba(245,243,238,0.08)', border: '1px solid rgba(245,243,238,0.15)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5F3EE" strokeWidth="1.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 flex items-center justify-center w-9 h-9 transition-opacity hover:opacity-100 opacity-60"
        aria-label="Close"
        style={{ background: 'rgba(245,243,238,0.08)', border: '1px solid rgba(245,243,238,0.15)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5F3EE" strokeWidth="1.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState<number | null>(null)

  const sections = [
    { id: 'hero',     label: 'Home' },
    { id: 'story',    label: 'Our Story' },
    { id: 'moments',  label: 'Moments' },
    { id: 'memories', label: 'Memories' },
    { id: 'closing',  label: 'Closing' },
  ]

  useEffect(() => {
    if (showIntro) return
    function updateActive() {
      const mid = window.scrollY + window.innerHeight / 2
      let closest: number | null = null
      let closestDist = Infinity
      sections.forEach(({ id }, i) => {
        const el = document.getElementById(id)
        if (!el) return
        const rect = el.getBoundingClientRect()
        const top = rect.top + window.scrollY
        const dist = Math.abs(top + rect.height / 2 - mid)
        if (dist < closestDist) { closestDist = dist; closest = i }
      })
      setActiveSection(closest)
    }
    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    return () => window.removeEventListener('scroll', updateActive)
  }, [showIntro])

  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  function toggleMusic() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play()
      setPlaying(true)
    }
  }

  const [futureMessage, setFutureMessage] = useState(
    'Write your message for August 15, 2026 here…'
  )
  const [futureImgSrc, setFutureImgSrc] = useState<string | null>(null)

  function handleFutureImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setFutureImgSrc(url)
  }

  const timeline = [
    {
      date: 'August 15',
      label: 'day 001',
      memory: "August 15 — My birthday, and somehow you ended up being the best gift I got that year. Didn't expect that when the day started, but I'm glad it turned out that way.",
      imgSrc: mAug15,
      imgAlt: 'August 15 — day one',
      isImported: true,
    },
    {
      date: 'September 15',
      label: 'day 031',
      memory: "September 15 — Our first month date. I remember not really having a plan, just going with whatever, and it still turned out to be one of those days I didn't want to end. Proof that it doesn't take much when it's with the right person.",
      imgSrc: mSep15,
      imgAlt: 'September 15 — first month date',
      isImported: true,
    },
    {
      date: 'October 15',
      label: 'day 061',
      memory: "October 15 — We always end up ordering like we're feeding four people, even if it's just the two of us. I don't even know how that became our thing, but I'm not complaining.",
      imgSrc: mOct15,
      imgAlt: 'October 15 — our thing',
      isImported: true,
    },
    {
      date: 'November 15',
      label: 'day 092',
      memory: "November 15 — Movie and food at home, no need to go anywhere. Still one of our favorite combos, honestly one of the easiest ways to spend time together.",
      imgSrc: mNov15,
      imgAlt: 'November 15 — movie and food at home',
      isImported: true,
    },
    {
      date: 'December 16',
      label: 'day 123',
      memory: "December 16 — Got to spend the whole holiday season with you this year, and that already felt like enough. Simple celebrations, but it made the year end on a good note.",
      imgSrc: mDec16,
      imgAlt: 'December 16 — holiday season',
      isImported: true,
    },
    {
      date: 'January 15 · 2026',
      label: 'day 153',
      memory: "January 15 — Random outdoor eat-out with no real plan. We just decided last minute and went, and it turned into one of those spontaneous days that ended up being fun anyway.",
      imgSrc: mJan15,
      imgAlt: 'January 15 — spontaneous eat-out',
      isImported: true,
    },
    {
      date: 'February 14 · 2026',
      label: 'day 183',
      memory: "February 14 — I was never really the flowers type before, kind of awkward with that stuff actually, but with you I found myself wanting to try, even just once.",
      imgSrc: mFeb14,
      imgAlt: "February 14 — flowers",
      isImported: true,
    },
    {
      date: 'February 15 · 2026',
      label: 'day 184',
      memory: "February 15 — Somewhere along the way, 15 became our lucky number. Feels like it keeps showing up on the days that matter to us.",
      imgSrc: mFeb15,
      imgAlt: 'February 15 — our lucky number',
      isImported: true,
    },
    {
      date: 'March 16 · 2026',
      label: 'day 213',
      memory: "March 16 — You didn't hesitate to meet my friends and just be part of my world, and that meant more to me than I probably said out loud at the time.",
      imgSrc: mMar16,
      imgAlt: 'March 16 — meeting friends',
      isImported: true,
      objectPosition: 'center 10%',
    },
    {
      date: 'April 10 · 2026',
      label: 'day 238',
      memory: "April 10 — We're really out here trying every cuisine except our own, Korean, Japanese, American, you name it. Feels like our own little food adventure every time.",
      imgSrc: mApr10,
      imgAlt: 'April 10 — food adventure',
      isImported: true,
    },
    {
      date: 'May 23 · 2026',
      label: 'day 281',
      memory: "May 23 — Bought something together using what we saved up. Small thing maybe, but it felt like a step, like we were actually building something.",
      imgSrc: mMay23,
      imgAlt: 'May 23 — building something together',
      isImported: true,
    },
    {
      date: 'June 20 · 2026',
      label: 'day 309',
      memory: "June 20 — Volunteering together was a different kind of date, not the usual dinner-and-movie type, but I liked seeing that side of us.",
      imgSrc: mJun20,
      imgAlt: 'June 20 — volunteering together',
      isImported: true,
      objectPosition: 'center 10%',
    },
    {
      date: 'July 15 · 2026',
      label: 'day 334',
      memory: "July 15 — Wasn't even with you that day, but you were still on my mind the whole time. Guess that's just how it is now.",
      imgSrc: mJul15,
      imgAlt: 'July 15 — on my mind',
      isImported: true,
    },
  ]


  return (
    <div style={{ background: 'var(--paper)', color: 'var(--ink)', overflowX: 'hidden' }}>

      {/* ── Intro overlay ── */}
      {showIntro && <IntroOverlay onDone={() => setShowIntro(false)} />}

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <Lightbox
          photos={memoryPhotos}
          index={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* ── Dot navigation ── */}
      <nav
        className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-5"
        aria-label="Section navigation"
      >
        {sections.map((sec, i) => {
          const isActive = activeSection === i && activeSection !== null
          return (
            <button
              key={sec.id}
              onClick={() => document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' })}
              aria-label={sec.label}
              className="group flex items-center gap-3"
            >
              {/* Label — slides in when active; also appears on group hover */}
              <span
                className="nav-label font-sans text-[9px] uppercase tracking-[0.22em] whitespace-nowrap pointer-events-none select-none"
                style={{
                  color: 'var(--muted)',
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateX(0)' : 'translateX(6px)',
                  transition: 'opacity 0.35s ease, transform 0.35s ease',
                }}
              >
                {sec.label}
              </span>

              {/* Dot — fixed container keeps all dots vertically centred */}
              <span className="relative flex items-center justify-center" style={{ width: 14, height: 14 }}>
                {/* Pulse ring — only on active */}
                <span
                  className="absolute rounded-full"
                  style={{
                    width: 14, height: 14,
                    border: '1px solid var(--ink)',
                    opacity: isActive ? 0.3 : 0,
                    animation: isActive ? 'dotPulse 1.8s ease-out infinite' : 'none',
                    transition: 'opacity 0.3s ease',
                  }}
                />
                {/* Dot itself */}
                <span
                  className="block rounded-full"
                  style={{
                    width:      isActive ? 9 : 5,
                    height:     isActive ? 9 : 5,
                    background: isActive ? 'var(--ink)' : 'rgba(42,42,42,0.35)',
                    transition: 'width 0.4s cubic-bezier(.34,1.56,.64,1), height 0.4s cubic-bezier(.34,1.56,.64,1), background 0.3s ease',
                  }}
                />
              </span>
            </button>
          )
        })}
      </nav>

      {/* Hidden audio element — preserves playback position */}
      <audio ref={audioRef} src={albumMusic} loop />

      {/* ── Music toggle button ── */}
      <button
        onClick={toggleMusic}
        aria-label={playing ? 'Pause music' : 'Play music'}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 transition-all"
        style={{
          background: 'rgba(13,13,13,0.55)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(245,243,238,0.18)',
          color: '#F5F3EE',
        }}
      >
        {/* Animated bars when playing, static icon when paused */}
        {playing ? (
          <span className="flex items-end gap-[3px] h-4" aria-hidden>
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className="w-[3px] rounded-full"
                style={{
                  background: '#F5F3EE',
                  height: '100%',
                  animation: `musicBar${i} 0.8s ease-in-out infinite alternate`,
                  animationDelay: `${(i - 1) * 0.15}s`,
                }}
              />
            ))}
          </span>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
        <span className="font-sans text-[10px] uppercase tracking-[0.2em]">
          {playing ? 'pause' : 'play'}
        </span>
      </button>

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section id="hero" className="relative w-full" style={{ height: '100svh', minHeight: 600 }}>
        {/* Video background */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ zIndex: 0 }}
        >
          <video
            src={heroVideo}
            autoPlay
            muted
            loop
            playsInline
            className="absolute w-full h-full"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              filter: 'grayscale(100%) brightness(0.6) contrast(1.1)',
            }}
            ref={(el) => { if (el) el.muted = true }}
          />
          {/* Dark overlay gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(13,13,13,0.2) 0%, rgba(13,13,13,0.55) 60%, rgba(13,13,13,0.82) 100%)',
            }}
          />
        </div>

        {/* Hero text */}
        <div
          className="relative flex flex-col items-center justify-center text-center h-full px-6"
          style={{ zIndex: 1 }}
        >
          <p
            className="font-sans text-[11px] uppercase tracking-[0.3em] mb-6"
            style={{ color: 'rgba(245,243,238,0.6)' }}
          >
            August 14, 2024 — August 14, 2025
          </p>
          <h1
            className="font-script leading-none mb-5"
            style={{
              fontSize: 'clamp(3.5rem, 10vw, 8rem)',
              color: '#F5F3EE',
              textShadow: '0 2px 32px rgba(0,0,0,0.3)',
            }}
          >
            365 Days With You
          </h1>
          <p
            className="font-serif italic text-lg md:text-xl max-w-sm"
            style={{ color: 'rgba(245,243,238,0.72)' }}
          >
            a year in photographs, letters, and the spaces between words
          </p>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 scroll-bounce">
            <div
              className="w-px h-10"
              style={{ background: 'linear-gradient(to bottom, rgba(245,243,238,0.6), transparent)' }}
            />
            <p
              className="font-sans text-[9px] uppercase tracking-[0.3em]"
              style={{ color: 'rgba(245,243,238,0.45)' }}
            >
              scroll
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. STORY INTRO ──────────────────────────────────────────────── */}
      <section
        id="story"
        className="px-6 md:px-16 lg:px-32 py-24 md:py-36 max-w-3xl mx-auto"
      >
        <Reveal>
          <p
            className="font-sans text-[10px] uppercase tracking-[0.25em] mb-8"
            style={{ color: 'var(--muted)' }}
          >
            our story
          </p>
        </Reveal>
        <Reveal delay={100}>
          <p
            className="font-serif text-xl md:text-2xl leading-[1.85] mb-8"
            style={{ color: 'var(--ink-soft)' }}
          >
            Happy Anniversary, Langga.
          </p>
        </Reveal>
        <Reveal delay={150}>
          <p
            className="font-serif text-xl md:text-2xl leading-[1.85] mb-8"
            style={{ color: 'var(--ink-soft)' }}
          >
            I'm really happy and thankful to God for blessing us to make it this far.
            One year may sound small to other people, but for me it's the first time
            I've made it this far without either of us destroying one another in a
            relationship. That alone shows how much we've grown as a couple, and how
            much we respect each other's lives. You are such a wonderful partner, a
            lovely one, and you always take care of me. You never miss a chance to make
            me smile, and to be honest, I may not be that showy when it comes to
            expressing my love for you, but I love you more than you can imagine, and
            I know you feel that.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <p
            className="font-serif text-xl md:text-2xl leading-[1.85] mb-8"
            style={{ color: 'var(--ink-soft)' }}
          >
            One thing I really love about us is that we love going out together, we love
            exploring new places, trying new things, and just being present with each
            other wherever we go. I feel like every trip, every random errand, every
            simple hangout became something more just because I was with you. You're
            also someone who genuinely cares, in the little things and in the big things,
            and I notice it even when I don't say it out loud. I hope we get to keep
            discovering more things together, more places, more experiences, more reasons
            to grow closer as a couple.
          </p>
        </Reveal>
        <Reveal delay={250}>
          <p
            className="font-serif text-xl md:text-2xl leading-[1.85] mb-8"
            style={{ color: 'var(--ink-soft)' }}
          >
            None of it has to be perfect for it to mean something. We were tired
            sometimes, silly most of the time, but we were patient with each other,
            and that's what mattered. One year may look small on paper, but it's not
            small to me — it's proof that we're actually trying, actually choosing each
            other even on the harder days.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <p
            className="font-serif italic text-xl md:text-2xl leading-[1.85]"
            style={{ color: 'var(--muted)' }}
          >
            I'm really thankful to always have you by my side, through everything,
            big or small. I really hope we could grow more as a couple, explore more
            of life together, and I hope you know that even if I'm not always the type
            to say it out loud, every little thing I do is me loving you in my own way.
            Happy 1 year, Langga. I love you.
          </p>
        </Reveal>

        {/* Thin rule */}
        <Reveal delay={400}>
          <div
            className="mt-16 mb-0 mx-auto w-16 h-px"
            style={{ background: 'var(--border-fine)' }}
          />
        </Reveal>
      </section>

      {/* ── 3. TIMELINE ─────────────────────────────────────────────────── */}
      <section
        id="moments"
        className="px-6 md:px-16 lg:px-24 py-12 md:py-20 max-w-6xl mx-auto"
        style={{ borderTop: '1px solid var(--border-fine)' }}
      >
        <Reveal>
          <div className="flex items-center gap-6 mb-20">
            <div className="h-px flex-1" style={{ background: 'var(--border-fine)' }} />
            <h2
              className="font-script text-4xl md:text-5xl"
              style={{ color: 'var(--ink)' }}
            >
              Moments
            </h2>
            <div className="h-px flex-1" style={{ background: 'var(--border-fine)' }} />
          </div>
        </Reveal>

        <div className="flex flex-col gap-24 md:gap-32">
          {timeline.map((entry, i) => (
            <TimelineEntry
              key={i}
              date={entry.date}
              label={entry.label}
              memory={entry.memory}
              imgSrc={entry.imgSrc}
              imgAlt={entry.imgAlt}
              side={i % 2 === 0 ? 'left' : 'right'}
              isImported={entry.isImported}
            />
          ))}

          {/* ── Special: August 15, 2026 — tomorrow ── */}
          <Reveal>
            <div
              className="flex flex-col md:flex-row items-center gap-10 md:gap-16"
            >
              {/* Photo upload slot */}
              <div className="w-full md:w-1/2 relative">
                <label
                  htmlFor="future-photo"
                  className="block cursor-pointer"
                  title="Click to insert your photo"
                >
                  <div
                    className="overflow-hidden flex flex-col items-center justify-center gap-3 transition-colors"
                    style={{
                      aspectRatio: '4/3',
                      border: '1.5px dashed var(--muted)',
                      background: futureImgSrc ? 'transparent' : 'rgba(138,134,128,0.06)',
                    }}
                  >
                    {futureImgSrc ? (
                      <img
                        src={futureImgSrc}
                        alt="August 15 — your photo"
                        className="w-full h-full object-cover grayscale-photo"
                      />
                    ) : (
                      <>
                        <svg
                          width="28" height="28" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="1.2"
                          style={{ color: 'var(--muted)' }}
                        >
                          <rect x="3" y="3" width="18" height="18" rx="1" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span
                          className="font-sans text-[10px] uppercase tracking-[0.22em]"
                          style={{ color: 'var(--muted)' }}
                        >
                          insert photo
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    id="future-photo"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFutureImageUpload}
                  />
                </label>

                {/* Floating "coming tomorrow" pill */}
                <div
                  className="absolute -bottom-3 -right-3 px-3 py-1.5"
                  style={{
                    background: 'var(--accent)',
                  }}
                >
                  <span
                    className="font-sans text-[10px] uppercase tracking-[0.18em]"
                    style={{ color: '#F5F3EE' }}
                  >
                    day 366
                  </span>
                </div>
              </div>

              {/* Text / editable message */}
              <div className="w-full md:w-1/2 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <p
                    className="font-sans text-[11px] uppercase tracking-[0.2em]"
                    style={{ color: 'var(--muted)' }}
                  >
                    August 15 · 2026
                  </p>
                  <span
                    className="font-sans text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 border"
                    style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                  >
                    tomorrow
                  </span>
                </div>

                <textarea
                  value={futureMessage}
                  onChange={(e) => setFutureMessage(e.target.value)}
                  rows={5}
                  className="font-serif text-xl md:text-2xl leading-relaxed resize-none bg-transparent outline-none w-full"
                  style={{
                    color: 'var(--ink-soft)',
                    border: 'none',
                    borderBottom: '1px solid var(--border-fine)',
                    paddingBottom: '8px',
                    fontFamily: "'EB Garamond', Georgia, serif",
                  }}
                  placeholder="Write your message for August 15, 2026 here…"
                />

                <p
                  className="font-sans text-[9px] uppercase tracking-[0.2em]"
                  style={{ color: 'rgba(138,134,128,0.5)' }}
                >
                  click to edit · photo uploads when you click the frame
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 4. MEMORIES ─────────────────────────────────────────────────── */}
      <section
        id="memories"
        className="py-20 md:py-28 px-4 md:px-8"
        style={{ background: 'var(--paper-dark)' }}
      >
        <Reveal>
          <div className="flex items-center gap-6 mb-14 max-w-6xl mx-auto">
            <div className="h-px flex-1" style={{ background: 'var(--border-fine)' }} />
            <h2
              className="font-script text-4xl md:text-5xl"
              style={{ color: 'var(--ink)' }}
            >
              Memories
            </h2>
            <div className="h-px flex-1" style={{ background: 'var(--border-fine)' }} />
          </div>
        </Reveal>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-2 md:gap-3 max-w-7xl mx-auto">
          {memoryPhotos.map((src, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className="break-inside-avoid mb-2 md:mb-3 overflow-hidden bg-gray-200 block w-full text-left group"
              style={{
                opacity: 0,
                animation: `fadeUp 0.7s ease forwards`,
                animationDelay: `${Math.min(i * 30, 800)}ms`,
                cursor: 'zoom-in',
              }}
              aria-label={`Open memory ${i + 1}`}
            >
              <img
                src={src}
                alt={`Memory ${i + 1}`}
                className="w-full h-auto object-cover grayscale-photo transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        <Reveal delay={200}>
          <p
            className="font-sans text-[9px] uppercase tracking-[0.3em] text-center mt-14"
            style={{ color: 'var(--muted)' }}
          >
            {memoryPhotos.length} memories · one year
          </p>
        </Reveal>
      </section>

      {/* ── 5. CLOSING / FOOTER ─────────────────────────────────────────── */}
      <footer
        id="closing"
        className="px-6 py-24 md:py-36 text-center"
        style={{ background: 'var(--paper)' }}
      >
        {/* Thin top rule */}
        <div
          className="w-16 h-px mx-auto mb-16"
          style={{ background: 'var(--border-fine)' }}
        />

        <Reveal>
          <h2
            className="font-script mb-6"
            style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              color: 'var(--ink)',
              lineHeight: 1.1,
            }}
          >
            to be continued…
          </h2>
        </Reveal>

        {/* Bottom thin rule */}
        <div
          className="w-16 h-px mx-auto mt-16"
          style={{ background: 'var(--border-fine)' }}
        />
      </footer>

    </div>
  )
}
