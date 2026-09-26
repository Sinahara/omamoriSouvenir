import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  badge: string
  title: string
  subtitle?: string
  /** h1 when the header is the page title (Katalog, Penawaran, Lacak) */
  as?: 'h1' | 'h2'
  align?: 'center' | 'left'
  className?: string
}

/* ── Section Header ─────────────────────────── */
export default function SectionHeader({ badge, title, subtitle, as: Heading = 'h2', align = 'center', className }: SectionHeaderProps) {
  const centered = align === 'center'
  return (
    <div className={cn('mb-10 md:mb-12', centered && 'text-center', className)}>
      <span className="inline-block eyebrow text-primary border border-primary/20 px-4 py-1 rounded-sm mb-4">{badge}</span>
      <Heading className="text-2xl md:text-3xl font-bold text-ink tracking-tight">{title}</Heading>
      {subtitle && <p className={cn('text-ink-muted mt-3 max-w-md', centered && 'mx-auto')}>{subtitle}</p>}
    </div>
  )
}
