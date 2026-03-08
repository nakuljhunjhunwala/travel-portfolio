interface Props { size?: number; className?: string }

export default function WalkIcon({ size = 16, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="14" cy="4" r="2"/>
      <path d="M10 22l4-12"/>
      <path d="M13.5 10L17 22"/>
      <path d="M10 22l-2-4"/>
      <path d="M7 12l3-2 2.5 2"/>
    </svg>
  );
}
