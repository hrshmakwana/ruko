interface IconProps {
  className?: string;
}

/** Risk is never carried by colour alone — each level has its own shape too. */
export function ScamIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M8.6 2.5h6.8L21.5 8.6v6.8L15.4 21.5H8.6L2.5 15.4V8.6z"
        fill="currentColor"
        opacity="0.16"
      />
      <path
        d="M8.6 2.5h6.8L21.5 8.6v6.8L15.4 21.5H8.6L2.5 15.4V8.6z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 7.3v6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="16.6" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function SuspiciousIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 3.2 22 20.3H2z" fill="currentColor" opacity="0.16" />
      <path d="M12 3.2 22 20.3H2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 9.2v4.6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="17.1" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function OkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.3" fill="currentColor" opacity="0.16" />
      <circle cx="12" cy="12" r="9.3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m7.8 12.3 2.9 2.9 5.5-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UploadIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m4.5 16.5 4.2-4.2a1.6 1.6 0 0 1 2.3 0l3.1 3.1m0 0 1.6-1.6a1.6 1.6 0 0 1 2.3 0l1.5 1.5m-5.4.1.1.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 2.7l7.2 2.6v6c0 4.4-3 8.2-7.2 9.9-4.2-1.7-7.2-5.5-7.2-9.9v-6z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M12 2.7l7.2 2.6v6c0 4.4-3 8.2-7.2 9.9-4.2-1.7-7.2-5.5-7.2-9.9v-6z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 8.2v4.1"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15.4" r="1.15" fill="currentColor" />
    </svg>
  );
}

export function CrossIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m8.6 8.6 6.8 6.8m0-6.8-6.8 6.8"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M19 12H5m0 0 6-6m-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
