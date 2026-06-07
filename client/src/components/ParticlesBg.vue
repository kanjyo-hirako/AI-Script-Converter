<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  quantity?: number
  color?: string
  staticity?: number
  ease?: number
  refresh?: boolean
}>(), {
  quantity: 100,
  color: '#000',
  staticity: 50,
  ease: 50,
  refresh: false,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

interface Particle {
  x: number
  y: number
  translateX: number
  translateY: number
  size: number
  alpha: number
  targetAlpha: number
  dx: number
  dy: number
  magnetism: number
}

let animationFrame = 0
let particles: Particle[] = []
let mouse = { x: 0, y: 0 }
let canvasSize = { w: 0, h: 0 }
let ctx: CanvasRenderingContext2D | null = null

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  hex = hex.replace('#', '')
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  }
}

function createParticle(): Particle {
  const x = Math.random() * canvasSize.w
  const y = Math.random() * canvasSize.h
  return {
    x,
    y,
    translateX: 0,
    translateY: 0,
    size: Math.random() * 2 + 0.5,
    alpha: 0,
    targetAlpha: Math.random() * 0.6 + 0.1,
    dx: (Math.random() - 0.5) * 0.3,
    dy: (Math.random() - 0.5) * 0.3,
    magnetism: 0.1 + Math.random() * 4,
  }
}

function initParticles() {
  particles = Array.from({ length: props.quantity }, createParticle)
}

function drawParticle(p: Particle) {
  if (!ctx) return
  const rgb = hexToRgb(props.color)
  ctx.save()
  ctx.translate(p.translateX, p.translateY)
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.alpha})`
  ctx.fill()
  ctx.restore()
}

function animate() {
  if (!ctx) return
  ctx.clearRect(0, 0, canvasSize.w, canvasSize.h)

  for (const p of particles) {
    // fade in
    p.alpha += (p.targetAlpha - p.alpha) * 0.02

    // mouse interaction
    const mx = mouse.x
    const my = mouse.y
    const dx = mx - (p.x + p.translateX)
    const dy = my - (p.y + p.translateY)
    const dist = Math.sqrt(dx * dx + dy * dy)
    const force = (props.staticity / 100) * p.magnetism

    if (dist < 150) {
      p.translateX += (dx / dist) * force * -0.5
      p.translateY += (dy / dist) * force * -0.5
    } else {
      p.translateX *= 1 - props.ease / 2000
      p.translateY *= 1 - props.ease / 2000
    }

    // drift
    p.x += p.dx
    p.y += p.dy

    // wrap around
    if (p.x < -10) p.x = canvasSize.w + 10
    if (p.x > canvasSize.w + 10) p.x = -10
    if (p.y < -10) p.y = canvasSize.h + 10
    if (p.y > canvasSize.h + 10) p.y = -10

    drawParticle(p)
  }

  animationFrame = requestAnimationFrame(animate)
}

function handleResize() {
  if (!canvasRef.value) return
  canvasSize.w = window.innerWidth
  canvasSize.h = window.innerHeight
  canvasRef.value.width = canvasSize.w
  canvasRef.value.height = canvasSize.h
}

function handleMouseMove(e: MouseEvent) {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
}

onMounted(() => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  handleResize()
  initParticles()
  animate()

  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
})

watch(() => props.quantity, () => initParticles())
watch(() => props.color, () => {})

watch(() => props.refresh, () => {
  handleResize()
  initParticles()
})
</script>

<template>
  <canvas ref="canvasRef" class="pointer-events-none" />
</template>
