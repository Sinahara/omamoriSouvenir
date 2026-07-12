'use client'

import { useRef, useCallback, useSyncExternalStore } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'

interface Product3D {
  src: string
  alt: string
  x: number
  y: number
  z: number
  rotateY: number
  rotateX: number
  scale: number
  floatDelay: number
  floatDuration: number
  floatAmplitude: number
}

const products: Product3D[] = [
  {
    src: '/products/3d-hero/gift-set.png',
    alt: 'Gift Set',
    x: -10,
    y: 15,
    z: 40,
    rotateY: -12,
    rotateX: 5,
    scale: 1.15,
    floatDelay: 0,
    floatDuration: 5,
    floatAmplitude: 12,
  },
  {
    src: '/products/3d-hero/tumbler.png',
    alt: 'Tumbler',
    x: 180,
    y: -20,
    z: 80,
    rotateY: 15,
    rotateX: -3,
    scale: 0.95,
    floatDelay: 0.8,
    floatDuration: 4.5,
    floatAmplitude: 10,
  },
  {
    src: '/products/3d-hero/stationery-set.png',
    alt: 'Stationery Set',
    x: -160,
    y: 70,
    z: -20,
    rotateY: 8,
    rotateX: 8,
    scale: 0.7,
    floatDelay: 1.5,
    floatDuration: 5.5,
    floatAmplitude: 8,
  },
  {
    src: '/products/3d-hero/plakat.png',
    alt: 'Plakat',
    x: 100,
    y: 100,
    z: -40,
    rotateY: -5,
    rotateX: -6,
    scale: 0.6,
    floatDelay: 2.2,
    floatDuration: 6,
    floatAmplitude: 7,
  },
  {
    src: '/products/3d-hero/ballpoint.png',
    alt: 'Ballpoint',
    x: -60,
    y: -50,
    z: 120,
    rotateY: 20,
    rotateX: -10,
    scale: 0.85,
    floatDelay: 0.4,
    floatDuration: 4,
    floatAmplitude: 14,
  },
]

function FloatingProduct({ product, mouseX, mouseY }: {
  product: Product3D
  mouseX: ReturnType<typeof useMotionValue<number>>
  mouseY: ReturnType<typeof useMotionValue<number>>
}) {
  // Parallax: mouse position affects rotation
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [product.rotateY - 8, product.rotateY + 8]),
    { stiffness: 80, damping: 30 }
  )
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [product.rotateX + 6, product.rotateX - 6]),
    { stiffness: 80, damping: 30 }
  )
  const translateX = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [product.x - 15, product.x + 15]),
    { stiffness: 60, damping: 25 }
  )
  const translateY = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [product.y + 10, product.y - 10]),
    { stiffness: 60, damping: 25 }
  )

  // Shadow opacity based on Y position (higher = lighter shadow)
  const shadowOpacity = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [0.15, 0.08]),
    { stiffness: 80, damping: 30 }
  )
  const shadowScale = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [1.1, 0.9]),
    { stiffness: 80, damping: 30 }
  )

  return (
    <motion.div
      className="absolute"
      style={{
        left: '50%',
        top: '50%',
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      <motion.div
        animate={{
          y: [0, -product.floatAmplitude, 0],
        }}
        transition={{
          duration: product.floatDuration,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: product.floatDelay,
        }}
        style={{
          x: translateX,
          y: translateY,
          z: product.z,
          rotateY: rotateY,
          rotateX: rotateX,
          scale: product.scale,
          transformStyle: 'preserve-3d',
        }}
        className="relative"
      >
        {/* Product Image */}
        <div
          className="relative"
          style={{
            width: 200,
            height: 200,
          }}
        >
          <Image
            src={product.src}
            alt={product.alt}
            fill
            className="object-contain drop-shadow-2xl"
            sizes="200px"
            priority
          />
        </div>

        {/* 3D Shadow beneath product */}
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2"
          style={{
            width: 120 * product.scale,
            height: 16 * product.scale,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            opacity: shadowOpacity,
            scale: shadowScale,
            filter: 'blur(4px)',
          }}
        />
      </motion.div>
    </motion.div>
  )
}

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { navigate } = useAppStore()

  // Hydration-safe: only render 3D scene on client
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring values for the entire scene
  const sceneRotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [5, -5]),
    { stiffness: 50, damping: 30 }
  )
  const sceneRotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [-5, 5]),
    { stiffness: 50, damping: 30 }
  )

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }, [mouseX, mouseY])

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
  }, [mouseX, mouseY])

  return (
    <section className="relative overflow-hidden bg-white" ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Subtle background gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0fdf4] via-white to-[#f8f8f8] opacity-60" />

      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center min-h-[500px] lg:min-h-[600px]">
          {/* Left: Text Content */}
          <motion.div
            className="relative z-10 text-center lg:text-left space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Badge
              variant="outline"
              className="text-sm px-4 py-1 border-[#00a651] text-[#00a651] bg-[#e8f5ee]/50"
            >
              Corporate Gift Terpercaya
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-[3.4rem] font-bold text-[#333333] leading-tight tracking-tight">
              Solusi Corporate Gift{' '}
              <span className="text-[#00a651]">Premium</span>{' '}
              untuk Bisnis Anda
            </h1>
            <p className="text-base md:text-lg text-[#666666] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Dari tumbler custom hingga employee onboarding kit lengkap.
              Zero inventory, mockup premium, dokumen lengkap.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <Button
                size="lg"
                className="bg-[#00a651] hover:bg-[#008a40] text-white text-base px-8 h-12 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                onClick={() => navigate('request-quote')}
              >
                Minta Penawaran
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 h-12 rounded-lg font-semibold border-[#e0e0e0] text-[#333333] hover:bg-[#f8f8f8]"
                onClick={() => navigate('catalog')}
              >
                Lihat Katalog
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4 justify-center lg:justify-start">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#333333]">500+</p>
                <p className="text-xs text-[#999999]">Perusahaan</p>
              </div>
              <div className="w-px h-10 bg-[#e0e0e0]" />
              <div className="text-center">
                <p className="text-2xl font-bold text-[#333333]">10K+</p>
                <p className="text-xs text-[#999999]">Pesanan</p>
              </div>
              <div className="w-px h-10 bg-[#e0e0e0]" />
              <div className="text-center">
                <p className="text-2xl font-bold text-[#333333]">99%</p>
                <p className="text-xs text-[#999999]">Kepuasan</p>
              </div>
            </div>
          </motion.div>

          {/* Right: 3D Product Scene */}
          <div className="relative h-[400px] md:h-[500px] lg:h-[550px]">
            {mounted && (
              <motion.div
                className="absolute inset-0"
                style={{
                  perspective: 1200,
                  perspectiveOrigin: '50% 50%',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              >
                <motion.div
                  className="w-full h-full"
                  style={{
                    transformStyle: 'preserve-3d',
                    rotateY: sceneRotateY,
                    rotateX: sceneRotateX,
                  }}
                >
                  {products.map((product, i) => (
                    <FloatingProduct
                      key={i}
                      product={product}
                      mouseX={mouseX}
                      mouseY={mouseY}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Decorative ring behind products */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[420px] md:h-[420px] rounded-full border border-[#00a651]/10 pointer-events-none"
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[340px] md:h-[340px] rounded-full border border-dashed border-[#00a651]/8 pointer-events-none"
              style={{ animation: 'spin 60s linear infinite' }}
            />
          </div>
        </div>
      </div>

      {/* CSS for spin animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </section>
  )
}