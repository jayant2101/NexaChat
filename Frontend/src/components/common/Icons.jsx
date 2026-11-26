import { useId } from 'react'

function SvgBase({ children, size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function BotIcon({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </SvgBase>
  )
}

export function UserIcon({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </SvgBase>
  )
}

export function PlusIcon({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </SvgBase>
  )
}

export function TrashIcon({ size = 16, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </SvgBase>
  )
}

export function SendIcon({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </SvgBase>
  )
}

export function StopIcon({ size = 16, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
    </SvgBase>
  )
}

export function MenuIcon({ size = 20, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </SvgBase>
  )
}

export function CloseIcon({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </SvgBase>
  )
}

export function SunIcon({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </SvgBase>
  )
}

export function MoonIcon({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </SvgBase>
  )
}

export function CopyIcon({ size = 15, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </SvgBase>
  )
}

export function CheckIcon({ size = 15, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M20 6 9 17l-5-5" />
    </SvgBase>
  )
}

export function MessageSquareIcon({ size = 16, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </SvgBase>
  )
}

export function SparklesIcon({ size = 20, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </SvgBase>
  )
}

export function NexaLogo({ size = 18, variant = 'mark', className = '' }) {
  const gradientId = useId()
  const isBadge = variant === 'badge'

  return (
    <svg
      width={size}
      height={size}
      viewBox={isBadge ? '0 0 32 32' : '0 0 24 24'}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1={isBadge ? '5' : '4'}
          y1={isBadge ? '6' : '5'}
          x2={isBadge ? '27' : '20'}
          y2={isBadge ? '26' : '19'}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="55%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      {isBadge && (
        <>
          <rect width="32" height="32" rx="8" fill="#0f172a" />
          <rect
            x="0.75"
            y="0.75"
            width="30.5"
            height="30.5"
            rx="7.25"
            stroke={`url(#${gradientId})`}
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />
        </>
      )}

      <g transform={isBadge ? 'translate(4 4)' : undefined}>
        <path
          d="M19.5 7.8C19.5 5.6 16.9 5.4 15.5 7.3L13.7 9.7M10.3 14.3L8.5 16.7C7.1 18.6 4.5 18.4 4.5 16.2"
          stroke={`url(#${gradientId})`}
          strokeOpacity="0.62"
          strokeWidth={isBadge ? '2' : '1.85'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.5 16.2V7.8C4.5 5.6 7.1 5.4 8.5 7.3L15.5 16.7C16.9 18.6 19.5 18.4 19.5 16.2V7.8"
          stroke={`url(#${gradientId})`}
          strokeWidth={isBadge ? '2.4' : '2.25'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
