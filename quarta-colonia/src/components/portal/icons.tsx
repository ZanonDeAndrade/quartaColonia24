import type { ReactNode } from "react";

export type IconProps = {
  className?: string;
};

function IconBase({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </IconBase>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="11" cy="11" r="7" />
      <line x1="16.7" y1="16.7" x2="21" y2="21" />
    </IconBase>
  );
}

export function IconAlert({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <circle cx="12" cy="15.5" r="0.8" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function IconHome({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M6 9.5V20h12V9.5" />
    </IconBase>
  );
}

export function IconNewspaper({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <rect x="4" y="3.5" width="16" height="17" rx="1.5" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="11.5" x2="16" y2="11.5" />
      <line x1="8" y1="15" x2="14" y2="15" />
      <rect x="6.5" y="7.5" width="1" height="8" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function IconLandmark({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M3 9l9-4 9 4" />
      <line x1="5.5" y1="9.5" x2="5.5" y2="17" />
      <line x1="9.5" y1="9.5" x2="9.5" y2="17" />
      <line x1="14.5" y1="9.5" x2="14.5" y2="17" />
      <line x1="18.5" y1="9.5" x2="18.5" y2="17" />
      <line x1="3" y1="19" x2="21" y2="19" />
    </IconBase>
  );
}

export function IconTrophy({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M8 4h8v4a4 4 0 1 1-8 0V4z" />
      <path d="M8 6H5a2 2 0 0 0 0 4h2" />
      <path d="M16 6h3a2 2 0 0 1 0 4h-2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <path d="M9 20h6" />
    </IconBase>
  );
}

export function IconGlobe({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="8" />
      <ellipse cx="12" cy="12" rx="3.5" ry="8" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </IconBase>
  );
}

export function IconTrendingUp({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <polyline points="4 16 10 10 14 14 20 8" />
      <polyline points="14 8 20 8 20 14" />
    </IconBase>
  );
}

export function IconPalette({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 4a8 8 0 1 0 0 16h1a2.5 2.5 0 0 0 0-5h-2a2 2 0 0 1-2-2v-.2A2.8 2.8 0 0 1 11.8 10H12a6 6 0 1 0 0-6z" />
      <circle cx="8" cy="10" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="10" cy="7.5" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="14" cy="7.5" r="0.7" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function IconMessageSquare({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-7z" />
    </IconBase>
  );
}

export function IconRadio({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="1.2" />
      <path d="M8.7 8.7a4.7 4.7 0 0 0 0 6.6" />
      <path d="M15.3 8.7a4.7 4.7 0 0 1 0 6.6" />
      <path d="M6.2 6.2a8.2 8.2 0 0 0 0 11.6" />
      <path d="M17.8 6.2a8.2 8.2 0 0 1 0 11.6" />
    </IconBase>
  );
}

export function IconPodcast({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="8.5" r="2.2" />
      <path d="M8.5 13a5 5 0 0 1 7 0" />
      <path d="M9.7 15.8a3.4 3.4 0 0 1 4.6 0" />
      <line x1="12" y1="12.5" x2="12" y2="20" />
    </IconBase>
  );
}

export function IconImage({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <rect x="4" y="5" width="16" height="14" rx="1.5" />
      <circle cx="9" cy="10" r="1.2" />
      <path d="M20 16l-5-5-4 4-2-2-5 5" />
    </IconBase>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="7.8" x2="12" y2="12" />
      <line x1="12" y1="12" x2="14.8" y2="13.6" />
    </IconBase>
  );
}
