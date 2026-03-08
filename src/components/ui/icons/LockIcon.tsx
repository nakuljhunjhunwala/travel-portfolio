interface LockIconProps {
  size?: number;
  className?: string;
}

export default function LockIcon({ size = 16, className }: LockIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor" />
      <path
        d="M5 7V5a3 3 0 1 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
