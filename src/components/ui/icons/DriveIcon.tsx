interface Props { size?: number; className?: string }

export default function DriveIcon({ size = 16, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17v2m14-2v2"/>
      <circle cx="7.5" cy="14" r="1.5"/>
      <circle cx="16.5" cy="14" r="1.5"/>
    </svg>
  );
}
