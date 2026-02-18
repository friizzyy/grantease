'use client'

import { useEffect, useRef, useState } from 'react'
import { useMotion } from '@/lib/motion/motion-context'
import { lerp, clamp } from '@/lib/motion/animations'

interface GlowState {
  x: number
  y: number
  targetX: number
  targetY: number
  intensity: number
}

export function PulseGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glowState = useRef<GlowState>({ x: 0.5, y: 0.4, targetX: 0.5, targetY: 0.4, intensity: 1 })
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile viewport on mount
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  // Use motion context for reactivity
  let motionState = {
    reducedMotion: false,
    scrollY: 0,
    scrollVelocity: 0,
    mousePosition: { x: 0, y: 0 },
  }

  try {
    const motion = useMotion()
    motionState = {
      reducedMotion: motion.reducedMotion,
      scrollY: motion.scrollY,
      scrollVelocity: motion.scrollVelocity,
      mousePosition: motion.mousePosition,
    }
  } catch {
    // MotionProvider not available yet, use defaults
  }

  const { reducedMotion, scrollY, scrollVelocity, mousePosition } = motionState


  useEffect(() => {
    if (reducedMotion || isMobile) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
    }

    const draw = () => {
      time += 0.005
      const width = window.innerWidth
      const height = window.innerHeight

      ctx.clearRect(0, 0, width, height)

      // Calculate scroll-based parallax offset
      const parallaxOffset = scrollY * 0.05

      // Calculate scroll velocity effect (grid fades at high velocity)
      const velocityFade = clamp(1 - scrollVelocity * 0.5, 0.3, 1)

      // Update glow position with smooth interpolation (follows mouse)
      const glow = glowState.current
      glow.targetX = 0.5 + mousePosition.x * 0.2
      glow.targetY = 0.4 + mousePosition.y * 0.15
      glow.x = lerp(glow.x, glow.targetX, 0.03)
      glow.y = lerp(glow.y, glow.targetY, 0.03)

      // Calculate edge intensity (increases near scroll boundaries)
      const scrollProgress = scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1)
      const edgeIntensity = 1 + Math.sin(scrollProgress * Math.PI) * 0.3


      // Draw subtle grid with parallax
      const gridSize = 60
      const gridOpacity = 0.02 * velocityFade
      ctx.strokeStyle = `rgba(255, 255, 255, ${gridOpacity})`
      ctx.lineWidth = 0.5

      // Vertical lines with wave effect
      for (let x = -gridSize; x <= width + gridSize; x += gridSize) {
        const waveOffset = Math.sin(time + x * 0.01) * 3
        ctx.beginPath()
        ctx.moveTo(x + waveOffset, -parallaxOffset % gridSize)
        ctx.lineTo(x + waveOffset, height + gridSize)
        ctx.stroke()
      }

      // Horizontal lines with wave effect
      for (let y = -gridSize; y <= height + gridSize; y += gridSize) {
        const waveOffset = Math.cos(time + y * 0.01) * 3
        const adjustedY = ((y - parallaxOffset) % gridSize + gridSize) % gridSize + Math.floor((y - parallaxOffset) / gridSize) * gridSize
        ctx.beginPath()
        ctx.moveTo(0, adjustedY + waveOffset)
        ctx.lineTo(width, adjustedY + waveOffset)
        ctx.stroke()
      }

      // Draw pulsing accent points at intersections
      const pulseBase = 0.03 + Math.sin(time * 2) * 0.02
      const pulseAlpha = pulseBase * velocityFade * edgeIntensity

      for (let x = gridSize; x < width; x += gridSize * 3) {
        for (let y = gridSize; y < height; y += gridSize * 3) {
          const offsetX = Math.sin(time + x * 0.01) * 2
          const offsetY = Math.cos(time + y * 0.01) * 2
          const adjustedY = y - (parallaxOffset % (gridSize * 3))

          // Distance from glow center affects point brightness
          const dx = (x / width) - glow.x
          const dy = (adjustedY / height) - glow.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const proximityBoost = Math.max(0, 1 - dist * 1.5) * 0.3

          ctx.beginPath()
          ctx.arc(x + offsetX, adjustedY + offsetY, 2 + proximityBoost * 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(64, 255, 170, ${pulseAlpha + proximityBoost})`
          ctx.fill()
        }
      }

      // Draw ambient glow that follows mouse
      const glowX = glow.x * width + Math.sin(time * 0.5) * 30
      const glowY = glow.y * height + Math.cos(time * 0.3) * 20

      const gradient = ctx.createRadialGradient(
        glowX, glowY, 0,
        width * 0.5, height * 0.4, width * 0.5
      )

      const glowIntensity = 0.04 * edgeIntensity * velocityFade
      gradient.addColorStop(0, `rgba(64, 255, 170, ${glowIntensity * 1.2})`)
      gradient.addColorStop(0.3, `rgba(64, 255, 170, ${glowIntensity * 0.6})`)
      gradient.addColorStop(0.6, `rgba(64, 255, 170, ${glowIntensity * 0.2})`)
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Secondary glow for depth
      const secondaryGlowX = width - glowX * 0.5
      const secondaryGlowY = height - glowY * 0.3

      const secondaryGradient = ctx.createRadialGradient(
        secondaryGlowX, secondaryGlowY, 0,
        secondaryGlowX, secondaryGlowY, width * 0.4
      )
      secondaryGradient.addColorStop(0, `rgba(64, 255, 170, ${glowIntensity * 0.3})`)
      secondaryGradient.addColorStop(0.5, `rgba(64, 255, 170, ${glowIntensity * 0.1})`)
      secondaryGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = secondaryGradient
      ctx.fillRect(0, 0, width, height)

      animationId = requestAnimationFrame(draw)
    }

    resize()
    draw()

    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [reducedMotion, isMobile, scrollY, scrollVelocity, mousePosition])

  if (reducedMotion || isMobile) {
    // Fallback for reduced motion - static gradient
    return (
      <>
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at 50% 40%, rgba(64, 255, 170, 0.04) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 80%, rgba(64, 255, 170, 0.02) 0%, transparent 40%)
              `
            }}
          />
          {/* Static grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
        </div>
        <div className="noise-overlay" />
      </>
    )
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ opacity: 0.9 }}
      />
      <div className="noise-overlay" />
    </>
  )
}
