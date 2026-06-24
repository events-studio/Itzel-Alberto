import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Color, DoubleSide, MathUtils, Object3D, Vector3 } from 'three'
import {
  CalendarHeart,
  Camera,
  Check,
  ChevronDown,
  Clock3,
  Gift,
  Heart,
  ImagePlus,
  MapPin,
  MessageCircleHeart,
  Music2,
  PartyPopper,
  PauseCircle,
  PlayCircle,
  UploadCloud,
  MailOpen
} from 'lucide-react'
import { wedding } from './data/wedding'
import { Clone, useGLTF } from '@react-three/drei'

const PISTACHE = '#94c573'
const PISTACHE_DARK = '#5f944a'
const GOLD = '#d7b56d'

const reveal = {
  hidden: { opacity: 0, y: 40, filter: 'blur(14px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

function useCountdown(targetDate) {
  const target = useMemo(() => new Date(targetDate).getTime(), [targetDate])
  const [timeLeft, setTimeLeft] = useState(() => Math.max(target - Date.now(), 0))

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft(Math.max(target - Date.now(), 0))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [target])

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60)
  const seconds = Math.floor((timeLeft / 1000) % 60)

  return { days, hours, minutes, seconds }
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setProgress(max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max)))
      })
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return progress
}

function usePointerParallax() {
  const pointer = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /*
      En celular lo apagamos.
      Así no se traba cuando el invitado toca o hace scroll.
    */
    if (isTouchDevice || reduceMotion) {
      pointer.current = { x: 0, y: 0 }
      target.current = { x: 0, y: 0 }
      return
    }

    let raf = 0

    const updateTarget = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2
      const y = (event.clientY / window.innerHeight - 0.5) * -2

      /*
        Bajamos la intensidad.
        Antes llegaba fácil a -1 / 1 y movía demasiado.
      */
      target.current.x = MathUtils.clamp(x * 0.45, -0.45, 0.45)
      target.current.y = MathUtils.clamp(y * 0.35, -0.35, 0.35)

      document.documentElement.style.setProperty('--mx', `${event.clientX}px`)
      document.documentElement.style.setProperty('--my', `${event.clientY}px`)
    }

    const smooth = () => {
      pointer.current.x += (target.current.x - pointer.current.x) * 0.075
      pointer.current.y += (target.current.y - pointer.current.y) * 0.075

      raf = requestAnimationFrame(smooth)
    }

    smooth()

    window.addEventListener('pointermove', updateTarget, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', updateTarget)
    }
  }, [])

  return pointer
}

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28 })

  return <motion.div className="scroll-progress" style={{ scaleX }} />
}

function MusicPlayer() {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [needsTap, setNeedsTap] = useState(true)

  const playMusic = useCallback(async ({ reset = false } = {}) => {
    const audio = audioRef.current
    if (!audio) return

    try {
      audio.volume = 0.38
      audio.loop = true

      if (reset) {
        audio.currentTime = 0
      }

      await audio.play()

      setIsPlaying(true)
      setNeedsTap(false)
    } catch (error) {
      setIsPlaying(false)
      setNeedsTap(true)
      console.log('El navegador bloqueó la música:', error)
    }
  }, [])

  const toggleMusic = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      await playMusic({ reset: false })
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  useEffect(() => {
    const startFromIntro = () => {
      playMusic({ reset: true })
    }

    window.addEventListener('wedding:start-music', startFromIntro)

    return () => {
      window.removeEventListener('wedding:start-music', startFromIntro)
    }
  }, [playMusic])

  return (
    <motion.div
      className="music-player"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.55 }}
    >
      <audio ref={audioRef} src={wedding.music.src} loop preload="auto" />

      <button
        type="button"
        className="music-button"
        onClick={toggleMusic}
        aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
      >
        {isPlaying ? <PauseCircle size={22} /> : <PlayCircle size={22} />}
        {/* <span>{isPlaying ? 'Pausar música' : needsTap ? 'Reproducir música' : 'Reproducir'}</span> */}
      </button>

      {/* <small>{wedding.music.note}</small> */}
    </motion.div>
  )
}

function IntroReveal({ onEnter }) {
  const handleEnter = () => {
    window.dispatchEvent(new Event('wedding:start-music'))
    onEnter()
  }

  return (
    <motion.div
      className="intro-minimal"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        filter: 'blur(18px)',
        transition: { duration: 0.65, ease: 'easeInOut' },
      }}
    >
      <motion.div
        className="intro-envelope-wrap"
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg
          className="intro-envelope-svg"
          viewBox="0 0 720 560"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fffdf7" />
              <stop offset="100%" stopColor="#efe3cf" />
            </linearGradient>

            <linearGradient id="fold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbf3e5" />
              <stop offset="100%" stopColor="#e8d6b9" />
            </linearGradient>

            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="24"
                stdDeviation="22"
                floodColor="#5b3f1d"
                floodOpacity="0.18"
              />
            </filter>
          </defs>

          <rect width="720" height="560" fill="transparent" />

          <g filter="url(#softShadow)">
            <rect
              x="96"
              y="222"
              width="528"
              height="276"
              rx="34"
              fill="url(#paper)"
              stroke="rgba(155, 121, 62, 0.32)"
            />

            <path
              d="M96 226 L360 380 L624 226"
              fill="none"
              stroke="rgba(155, 121, 62, 0.24)"
              strokeWidth="2"
            />

            <path
              d="M98 496 L360 330 L622 496 Z"
              fill="url(#fold)"
              stroke="rgba(155, 121, 62, 0.18)"
            />

            <path
              d="M96 226 L360 384 L96 496 Z"
              fill="#f8ecda"
              opacity="0.9"
            />

            <path
              d="M624 226 L360 384 L624 496 Z"
              fill="#f3e3cb"
              opacity="0.92"
            />

            <motion.path
              d="M96 222 L360 64 L624 222 L360 380 Z"
              fill="#fff8eb"
              stroke="rgba(155, 121, 62, 0.26)"
              strokeWidth="2"
              style={{ transformOrigin: '360px 222px' }}
              initial={{ rotateX: 0 }}
              animate={{ rotateX: -10 }}
              transition={{ delay: 0.45, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />

            <circle
              cx="360"
              cy="352"
              r="34"
              fill="#c9a45a"
              opacity="0.96"
            />

            <path
              d="M348 348 C348 340 360 339 360 350 C360 339 372 340 372 348 C372 358 360 365 360 365 C360 365 348 358 348 348 Z"
              fill="#fffaf0"
            />
          </g>
        </svg>

        <motion.div
          className="intro-invite-card"
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <span>Nuestra boda</span>

          <strong>{wedding.couple.initials}</strong>

          <div className="intro-line" />

          <p className="intro-couple">
            {wedding.couple.bride}
            <i>&</i>
            {wedding.couple.groom}
          </p>

          <p className="intro-date">{wedding.date.pretty}</p>

          <button type="button" onClick={handleEnter}>
            <MailOpen size={18} />
            Abrir invitación
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function CameraRig({ pointer }) {
  const target = useMemo(() => new Vector3(), [])

  useFrame(({ camera }) => {
    const p = pointer.current

    target.set(
      p.x * 0.28,
      0.35 + p.y * 0.08,
      8.2
    )

    camera.position.lerp(target, 0.035)
    camera.lookAt(p.x * 0.05, 0.1, 0)
  })

  return null
}

function WeddingRings() {
  const { scene } = useGLTF(import.meta.env.BASE_URL + "models/ring.glb")
  const group = useRef(null)
  const leftRing = useRef(null)
  const rightRing = useRef(null)

  const leftBase = useMemo(() => ({
    x: 0,
    y: 10.5,
    z: 0.72,
  }), [])

  const rightBase = useMemo(() => ({
    x: 4,
    y: 24.9,
    z: -0.72,
  }), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    /*
      Movimiento suave general.
      No toca position ni scale.
    */
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.35) * 0.045
      group.current.rotation.x = Math.cos(t * 0.3) * 0.025
      group.current.rotation.z = Math.sin(t * 0.25) * 0.018
    }

    /*
      Movimiento individual del anillo izquierdo.
      Respeta tu rotación base.
    */
    if (leftRing.current) {
      leftRing.current.rotation.x = leftBase.x + Math.sin(t * 0.9) * 0.035
      leftRing.current.rotation.y = leftBase.y + Math.cos(t * 0.75) * 0.035
      leftRing.current.rotation.z = leftBase.z + Math.sin(t * 1.05) * 0.035
    }

    /*
      Movimiento individual del anillo derecho.
      Respeta tu rotación base.
    */
    if (rightRing.current) {
      rightRing.current.rotation.x = rightBase.x + Math.cos(t * 0.85) * 0.035
      rightRing.current.rotation.y = rightBase.y + Math.sin(t * 0.7) * 0.035
      rightRing.current.rotation.z = rightBase.z - Math.cos(t * 1.05) * 0.035
    }
  })

  return (
    <group ref={group} position={[0, 0.1, 0]} scale={1}>
      <Clone
        ref={leftRing}
        object={scene}
        position={[-0.30, 0, 0]}
        rotation={[leftBase.x, leftBase.y, leftBase.z]}
        scale={0.75}
      />

      <Clone
        ref={rightRing}
        object={scene}
        position={[0.30, 0, 0.05]}
        rotation={[rightBase.x, rightBase.y, rightBase.z]}
        scale={0.75}
      />
    </group>
  )
}

useGLTF.preload(import.meta.env.BASE_URL + "models/ring.glb")

function InfinityRibbon({ pointer }) {
  const ref = useRef(null)

  useFrame(({ clock }) => {
    if (!ref.current) return

    const t = clock.getElapsedTime()
    const p = pointer.current

    ref.current.rotation.x = 0.62 + p.y * 0.04
    ref.current.rotation.y = t * 0.055 + p.x * 0.05
    ref.current.rotation.z = Math.sin(t * 0.22) * 0.11
    ref.current.position.y = -0.2
  })

  return (
    <mesh ref={ref} position={[0, -0.2, -0.6]}>
      <torusKnotGeometry args={[1.58, 0.018, 320, 12, 3, 8]} />
      <meshStandardMaterial color={PISTACHE} metalness={0.35} roughness={0.18} emissive={PISTACHE_DARK} emissiveIntensity={0.18} />
    </mesh>
  )
}

function PetalCloud({ progress, pointer }) {
  const { scene } = useGLTF('/models/petalo.glb')
  const petalRefs = useRef([])

  const petals = useMemo(
    () =>
      Array.from({ length: 20 }, () => ({
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 8,
        z: -Math.random() * 9,
        s: 0.18 + Math.random() * 0.35,
        r: Math.random() * Math.PI,
        speed: 0.35 + Math.random() * 1.15,
        phase: Math.random() * Math.PI * 2,
      })),
    [],
  )

  useFrame(({ clock }) => {
    const p = pointer.current
    const t = clock.getElapsedTime()

    petals.forEach((petal, index) => {
      const item = petalRefs.current[index]
      if (!item) return

      const wave = Math.sin(t * petal.speed + petal.phase)

      item.position.set(
        petal.x + wave * 0.28 + p.x * (0.12 + petal.s * 0.04),
        MathUtils.euclideanModulo(petal.y - progress * 9 + t * 0.08 * petal.speed, 8) - 4,
        petal.z + Math.sin(progress * Math.PI * 2 + index) * 0.5,
      )

      item.rotation.set(
        t * 0.2 + petal.r + progress * 2.4,
        petal.r + wave * 0.32,
        petal.r + t * 0.14,
      )

      item.scale.setScalar(petal.s)
    })
  })

  return (
    <group>
      {petals.map((_, index) => (
        <Clone
          key={index}
          object={scene}
          ref={(el) => {
            petalRefs.current[index] = el
          }}
        />
      ))}
    </group>
  )
}

useGLTF.preload('/models/petalo.glb')

function FloatingLayers({ pointer }) {
  const one = useRef(null)
  const two = useRef(null)
  const three = useRef(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const p = pointer.current
    const refs = [one, two, three]

    refs.forEach((item, index) => {
      if (!item.current) return

      item.current.rotation.z = t * (0.055 + index * 0.018)
      item.current.rotation.x = Math.sin(t * 0.18 + index) * 0.07 + p.y * 0.035
      item.current.rotation.y = Math.cos(t * 0.2 + index) * 0.075 + p.x * 0.035
    })
  })

  return (
    <>
      <mesh ref={one} position={[-3.2, 1.6, -1.6]}>
        <torusGeometry args={[0.78, 0.01, 12, 120]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.32} />
      </mesh>

      <mesh ref={two} position={[3.25, -0.9, -2.1]}>
        <torusGeometry args={[1.12, 0.012, 12, 120]} />
        <meshStandardMaterial color={PISTACHE} transparent opacity={0.28} />
      </mesh>

      <mesh ref={three} position={[0.2, 2.25, -3.4]}>
        <torusGeometry args={[1.6, 0.008, 12, 140]} />
        <meshStandardMaterial color={GOLD} transparent opacity={0.24} />
      </mesh>
    </>
  )
}

function GlowOrbs({ pointer }) {
  const group = useRef(null)

  const orbs = useMemo(
    () => [
      [-2.9, -1.2, -2.7, 0.22, '#f8ead1'],
      [2.8, 1.6, -2.2, 0.18, '#d8edc9'],
      [-1.5, 2.2, -3.2, 0.12, '#ffffff'],
      [1.5, -2.0, -2.8, 0.16, '#94c573'],
      [0.2, 2.9, -4.1, 0.12, '#d7b56d'],
    ],
    [],
  )

  useFrame(({ clock }) => {
    if (!group.current) return

    const t = clock.getElapsedTime()
    const p = pointer.current

    group.current.position.x = p.x * 0.06
    group.current.position.y = p.y * 0.04
    group.current.rotation.z = Math.sin(t * 0.08) * 0.05
  })

  return (
    <group ref={group}>
      {orbs.map(([x, y, z, size, color], index) => (
        <mesh key={`${x}-${y}-${z}`} position={[x, y, z]}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55 + index * 0.04} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

function ScrollScene3D({ progress, pointer }) {
  return (
    <div className="scene-3d" aria-hidden="true">
      <Canvas camera={{ position: [0, 0.35, 8.2], fov: 42 }} dpr={[1, 1.25]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <color attach="background" args={['#fffaf0']} />

        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 6, 4]} intensity={2.2} />
        <pointLight position={[-3, 2, 4]} intensity={2.5} color={PISTACHE} />
        <pointLight position={[3, -1, 4]} intensity={1.7} color={GOLD} />

        <CameraRig pointer={pointer} />
        <GlowOrbs pointer={pointer} />
        <FloatingLayers pointer={pointer} />
        {/* <InfinityRibbon pointer={pointer} /> */}
        <Suspense fallback={null}>
          <WeddingRings />
          <PetalCloud progress={progress} pointer={pointer} />
        </Suspense>
      </Canvas>
    </div>
  )
}

function ParallaxSection({ id, className = '', children }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [70, -70])
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [6, 0, -4])
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.5, 1, 1, 0.72])

  return (
    <motion.section ref={ref} id={id} className={`story-section ${className}`} style={{ opacity }}>
      <motion.div className="section-depth" style={{ y, rotateX }}>
        {children}
      </motion.div>
    </motion.section>
  )
}

function SectionHeader({ eyebrow, title, text }) {
  return (
    <motion.div className="section-header" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }}>
      <motion.span variants={reveal} className="eyebrow">
        {eyebrow}
      </motion.span>

      <motion.h2 variants={reveal}>{title}</motion.h2>

      {text && <motion.p variants={reveal}>{text}</motion.p>}
    </motion.div>
  )
}

function Hero() {
  const heroImage = wedding.hero?.image || wedding.photos[0]

  return (
    <section className="hero-shell" id="inicio">
      <div className="hero-grid-overlay" aria-hidden="true" />

      <motion.div
        className="start-hero-content hero-content"
        style={{ '--hero-image': `url(${heroImage})` }}
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="hero-copy" variants={stagger}>
          <motion.p className="hero-overline" variants={reveal}>
            Nuestra boda
          </motion.p>

          <motion.h1 variants={reveal}>
            {wedding.couple.bride}
            <span>&</span>
            {wedding.couple.groom}
          </motion.h1>

          <motion.p className="hero-phrase" variants={reveal}>
            {wedding.couple.phrase}
          </motion.p>

          <motion.div className="hero-date" variants={reveal}>
            <CalendarHeart size={19} />
            <strong>{wedding.date.pretty}</strong>
            <span>{wedding.date.short}</span>
          </motion.div>

          <motion.div className="hero-actions" variants={reveal}>
            

            <a className="btn btn-glass" href="#historia">
              Ver invitación
            </a>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="scroll-cue"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.7 }}
      >
        <span>Desliza</span>
        <ChevronDown size={22} />
      </motion.div>
    </section>
  )
}


function SaveTheDate() {
  const celebrate = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.68 },
      colors: [PISTACHE, GOLD, '#ffffff'],
    })
  }

  return (
    <ParallaxSection id="save-the-date" className="save-date-section">
      <SectionHeader
        eyebrow="Save the date"
        title="Aparta esta fecha"
        text=""
      />

      <motion.article
        className="save-date-card depth-card"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        whileHover={{ y: -10, rotateX: 4, rotateY: -4 }}
      >
        <motion.div className="save-date-icon" variants={reveal}>
          <CalendarHeart />
        </motion.div>

        <motion.span className="save-date-label" variants={reveal}>
          Reserva el día
        </motion.span>

        <motion.h2 variants={reveal}>{wedding.date.pretty}</motion.h2>

        <motion.p className="save-date-short" variants={reveal}>
          {wedding.date.short}
        </motion.p>

        <motion.div className="save-date-details" variants={stagger}>
          <motion.div className="save-date-mini" variants={reveal}>
            <Clock3 size={17} />
            <span>{wedding.ceremony.time}</span>
          </motion.div>

          <motion.div className="save-date-mini" variants={reveal}>
            <MapPin size={17} />
            <span>{wedding.ceremony.place}</span>
          </motion.div>
        </motion.div>

        <motion.div className="hero-actions save-date-actions" variants={reveal}>

          <a className="btn btn-glass" href="#evento">
            Ver detalles
          </a>
        </motion.div>
      </motion.article>
    </ParallaxSection>
  )
}

function Countdown() {
  const time = useCountdown(wedding.date.iso)

  const units = [
    ['Días', time.days],
    ['Horas', time.hours],
    ['Min', time.minutes],
    ['Seg', time.seconds],
  ]

  return (
    <ParallaxSection id="contador" className="countdown-section">
      <SectionHeader
        eyebrow="La cuenta regresiva"
        title="Nuestro momento especial se acerca."
        text="Pronto celebraremos el amor que nos une."
      />

      <motion.div className="countdown-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }}>
        {units.map(([label, value]) => (
          <motion.div className="count-card depth-card" key={label} variants={reveal} whileHover={{ y: -8, rotateX: 7, rotateY: -7 }}>
            <strong>{String(value).padStart(2, '0')}</strong>
            <span>{label}</span>
          </motion.div>
        ))}
      </motion.div>
    </ParallaxSection>
  )
}

function Story() {
  return (
    <ParallaxSection id="historia" className="story-romance">
      <div className="two-column">
        <SectionHeader
          eyebrow="El comienzo de una nueva historia"
          title="Queridos invitados"
          text=""
        />

        <motion.div className="vow-card depth-card" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} variants={stagger}>
          <motion.div className="vow-icon" variants={reveal}>
            <Heart />
          </motion.div>

          <motion.p variants={reveal}>
            “Para nosotros es fundamental compartir la ilusión de nuestro matrimonio y queremos que lo importante sea su compañia y buenos deseos celebrando con alegria y amor nuestra unión.”
          </motion.p>

          <motion.div className="signature-line" variants={reveal}>
            <span>{wedding.couple.bride}</span>
            <i />
            <span>{wedding.couple.groom}</span>
          </motion.div>
        </motion.div>
      </div>

      <motion.div className="floating-stats" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
        {wedding.highlights.map((item, index) => (
          <motion.div className="stat-chip" key={item} variants={reveal} style={{ '--delay': index }}>
            <Check size={16} />
            {item}
          </motion.div>
        ))}
      </motion.div>
    </ParallaxSection>
  )
}

function EventCard({ icon: Icon, event, label }) {
  return (
    <motion.article className="event-card depth-card event-card-with-photo" variants={reveal} whileHover={{ y: -10, rotateY: 5 }}>
      {event.image && (
        <figure className="event-photo">
          <img src={event.image} alt={`${event.title}: ${event.place}`} loading="lazy" />
          <figcaption>{event.photoLabel}</figcaption>
        </figure>
      )}

      <div className="event-topline">
        <span>{label}</span>
        <Icon size={24} />
      </div>

      <h3>{event.title}</h3>

      <p className="event-time">
        <Clock3 size={17} /> {event.time}
      </p>

      <p className="event-place">{event.place}</p>
      <p className="event-address">{event.address}</p>

      <a href={event.mapUrl} target="_blank" rel="noreferrer" className="map-link">
        <MapPin size={17} /> Ver ubicación
      </a>
    </motion.article>
  )
}

function Events() {
  return (
    <ParallaxSection id="evento" className="events-section">
      <SectionHeader
        eyebrow="El día"
        title="Ceremonia y recepción"
        text=""
      />

      <motion.div className="events-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
        <EventCard icon={Heart} event={wedding.ceremony} label="Primero" />
        <EventCard icon={PartyPopper} event={wedding.reception} label="Después" />
      </motion.div>
    </ParallaxSection>
  )
}

function Timeline() {
  return (
    <ParallaxSection id="itinerario" className="timeline-section">
      <SectionHeader
        eyebrow="Itinerario"
        title="El gran día paso a paso"
        text="Cada momento tiene su lugar."
      />

      <div className="timeline-track">
        {wedding.timeline.map((item, index) => (
          <motion.article
            key={`${item.time}-${item.title}`}
            className="timeline-item depth-card"
            initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60, rotateY: index % 2 === 0 ? -12 : 12 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>{item.time}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </motion.article>
        ))}
      </div>
    </ParallaxSection>
  )
}

function Gallery() {
  const shown = wedding.photos.slice(0, 6)

  return (
    <ParallaxSection id="galeria" className="gallery-section">
      <SectionHeader
        eyebrow="Galería"
        title="Galeria de fotos"
        text=""
      />

      <motion.div className="photo-stage" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
        {shown.map((src, index) => (
          <motion.figure
            className={`photo-card photo-${index + 1}`}
            key={src}
            variants={reveal}
            whileHover={{ scale: 1.035, rotate: 0, zIndex: 9 }}
          >
            <img src={src} alt={`Foto ${index + 1} de ${wedding.couple.bride} y ${wedding.couple.groom}`} loading="lazy" />

            {/* <figcaption>{index === 0 ? 'Nuestra historia' : index === 1 ? 'El sí' : index === 2 ? 'El camino' : 'Para siempre'}</figcaption> */}
          </motion.figure>
        ))}
      </motion.div>
    </ParallaxSection>
  )
}

function MemoriesUpload() {
  const fileInput = useRef(null)
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const hasDirectUpload = Boolean(wedding.memories.appsScriptUrl)

  const encodeFile = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        const result = String(reader.result || '')

        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          data: result.split(',')[1],
        })
      }

      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const uploadFiles = async () => {
    if (!hasDirectUpload) {
      window.open(wedding.memories.uploadUrl, '_blank', 'noreferrer')
      return
    }

    if (!files.length) {
      setMessage('Elige al menos una foto o video primero.')
      return
    }

    try {
      setStatus('uploading')
      setMessage('Subiendo recuerdos...')

      const payload = await Promise.all(files.map(encodeFile))

      const response = await fetch(wedding.memories.appsScriptUrl, {
        method: 'POST',
        body: JSON.stringify({ files: payload }),
      })

      const data = await response.json()

      if (!data.ok) throw new Error(data.message || 'No se pudo subir. Intenta otra vez.')

      setStatus('success')
      setMessage('Listo. Los recuerdos ya están guardados para los novios.')
      setFiles([])

      if (fileInput.current) fileInput.current.value = ''

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.75 },
        colors: [PISTACHE, GOLD, '#ffffff'],
      })
    } catch (error) {
      setStatus('error')
      setMessage(error.message)
    }
  }

  return (
    <ParallaxSection id="recuerdos" className="memories-section">
      <div className="memories-grid">
        <SectionHeader
          eyebrow="Recuerdos compartidos"
          title="Sube tus fotos y videos de la boda"
          text="La idea es que todos puedan regalarles a los novios los momentos que capturaron desde su celular."
        />

        <motion.div className="upload-panel depth-card" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <motion.div className="upload-icon" variants={reveal}>
            <UploadCloud />
          </motion.div>

          <motion.h3 variants={reveal}>Álbum de invitados</motion.h3>

          <motion.p variants={reveal}>
            {hasDirectUpload
              ? 'Selecciona archivos y se enviarán directo a la carpeta de Drive configurada.'
              : 'Para máxima seguridad, este botón abre el formulario o carpeta compartida de Drive de los novios.'}
          </motion.p>

          {hasDirectUpload && (
            <motion.label className="file-drop" variants={reveal}>
              <ImagePlus size={26} />
              <span>{files.length ? `${files.length} archivo(s) listo(s)` : 'Elegir fotos o videos'}</span>

              <input
                ref={fileInput}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(event) => setFiles(Array.from(event.target.files || []))}
              />
            </motion.label>
          )}

          <motion.button className="btn btn-primary full" variants={reveal} onClick={uploadFiles} disabled={status === 'uploading'}>
            <Camera size={18} />
            {hasDirectUpload ? 'Subir recuerdos' : 'Abrir Drive / formulario'}
          </motion.button>

          {message && (
            <motion.p className={`upload-status ${status}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {message}
            </motion.p>
          )}
        </motion.div>
      </div>
    </ParallaxSection>
  )
}

function GiftAndRsvp() {
  const whatsappUrl = `https://wa.me/${wedding.rsvp.whatsappNumber}?text=${encodeURIComponent(wedding.rsvp.message)}`

  const celebrate = () => {
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.62 },
      colors: [PISTACHE, GOLD, '#ffffff'],
    })
  }

  return (
    <ParallaxSection id="confirmar" className="rsvp-section">
      <SectionHeader
        eyebrow="Confirmación"
        title="Ahora sí, aparta la fecha"
        text="Un toque y mandas mensaje por WhatsApp. Fácil, bonito y sin vueltas."
      />

      <div className="rsvp-grid">
        <motion.article className="rsvp-card depth-card" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
          <motion.div className="rsvp-icon" variants={reveal}>
            <MessageCircleHeart />
          </motion.div>

          <motion.h3 variants={reveal}>Confirma tu asistencia</motion.h3>
          <motion.p variants={reveal}>{wedding.rsvp.deadline}</motion.p>

          <motion.a className="btn btn-primary full" href={whatsappUrl} target="_blank" rel="noreferrer" variants={reveal} onClick={celebrate}>
            Confirmar por WhatsApp
          </motion.a>
        </motion.article>

        <motion.article className="rsvp-card depth-card" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
          <motion.div className="rsvp-icon" variants={reveal}>
            <Gift />
          </motion.div>

          <motion.h3 variants={reveal}>{wedding.gift.title}</motion.h3>
          <motion.p variants={reveal}>{wedding.gift.text}</motion.p>

          <motion.a className="btn btn-glass full" href={wedding.gift.url} target="_blank" rel="noreferrer" variants={reveal}>
            Ver mesa de regalos
          </motion.a>
        </motion.article>
      </div>
    </ParallaxSection>
  )
}

function Footer() {
  return (
    <footer className="wedding-footer">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
        <span>{wedding.date.short}</span>
        <h2>
          {wedding.couple.bride} & {wedding.couple.groom}
        </h2>
        <p>Gracias por formar parte de esta historia.</p>
      </motion.div>
    </footer>
  )
}

function NavigationDots() {
  const items = [
    ['Inicio', '#inicio'],
    ['Save the date', '#save-the-date'],
    ['Contador', '#contador'],
    ['Historia', '#historia'],
    ['Evento', '#evento'],
    ['Galería', '#galeria'],
    ['Recuerdos', '#recuerdos'],
    ['Confirmar', '#confirmar'],
  ]

  return (
    <nav className="nav-dots" aria-label="Navegación por secciones">
      {items.map(([label, href]) => (
        <a key={href} href={href} aria-label={label} title={label} />
      ))}
    </nav>
  )
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true)
  const progress = useScrollProgress()
  const pointer = usePointerParallax()

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--scroll-progress', progress.toFixed(4))
  }, [progress])

  return (
    <>
      <AnimatePresence>
        {showIntro && <IntroReveal onEnter={() => setShowIntro(false)} />}
      </AnimatePresence>

      <ScrollScene3D progress={progress} pointer={pointer} />
      <ScrollProgressBar />
      <MusicPlayer />
      <NavigationDots />

      <main className="app-shell">
        <Hero />
        <SaveTheDate />
        <Countdown />
        <Story />
        <Events />
        <Timeline />
        <Gallery />
        <MemoriesUpload />
        {/* <GiftAndRsvp /> */}
      </main>

      <Footer />
    </>
  )
}
