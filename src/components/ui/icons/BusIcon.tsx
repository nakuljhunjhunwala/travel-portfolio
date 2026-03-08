interface Props { size?: number; className?: string }

export default function BusIcon({ size = 16, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="16" rx="3"/>
      <path d="M3 11h18"/>
      <path d="M3 7h18"/>
      <circle cx="7" cy="15" r="1"/>
      <circle cx="17" cy="15" r="1"/>
      <path d="M5 19v2"/>
      <path d="M19 19v2"/>
    </svg>
  );
}
