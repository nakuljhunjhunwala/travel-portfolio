interface Props { size?: number; className?: string }

export default function AutoIcon({ size = 16, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 18v1a1 1 0 001 1h1a1 1 0 001-1v-1m10 0v1a1 1 0 001 1h1a1 1 0 001-1v-1"/>
      <path d="M5 18H3V12l2.5-5H18l2.5 5v6h-2"/>
      <path d="M5 18h14"/>
      <circle cx="7" cy="15" r="1.5"/>
      <circle cx="17" cy="15" r="1.5"/>
      <path d="M5.5 7L4 12h16l-1.5-5"/>
    </svg>
  );
}
