interface Props { size?: number; className?: string }

export default function TrainIcon({ size = 16, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="3" width="16" height="16" rx="3"/>
      <path d="M4 11h16"/>
      <path d="M12 3v8"/>
      <circle cx="8" cy="15" r="1"/>
      <circle cx="16" cy="15" r="1"/>
      <path d="M6 19l-2 3"/>
      <path d="M18 19l2 3"/>
    </svg>
  );
}
