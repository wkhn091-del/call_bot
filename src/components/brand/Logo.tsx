type LogoProps = { className?: string };

export function LogoMark({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <path d="M8 18a12 12 0 0 1 24 0" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" opacity="0.55" />
      <rect x="5" y="16" width="5" height="9" rx="2.5" fill="currentColor" opacity="0.55" />
      <rect x="30" y="16" width="5" height="9" rx="2.5" fill="currentColor" opacity="0.55" />
      <path
        d="M20 9.5c-6.4 0-10.5 4.3-10.5 10.2 0 5.7 3.9 9.6 9.4 10.1l-2.6 4.7 7.4-4.9c4.6-1.3 6.8-5 6.8-9.9C30.5 13.8 26.4 9.5 20 9.5Z"
        fill="var(--color-teal-400)"
      />
      <rect x="13.5" y="16" width="13" height="7" rx="3.5" fill="var(--color-night-950)" />
      <circle cx="17.3" cy="19.5" r="1.4" fill="var(--color-teal-300)" />
      <circle cx="22.7" cy="19.5" r="1.4" fill="var(--color-teal-300)" />
    </svg>
  );
}

export function Logo({ className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`} dir="ltr">
      <LogoMark className="size-8 text-mist-100" />
      <span className="font-latin text-body font-extrabold tracking-widest text-mist-100">
        CALL<span className="text-teal-400">BOT</span>
      </span>
    </span>
  );
}
