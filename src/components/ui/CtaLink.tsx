import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "ghost";

const base =
  "group inline-flex min-h-12 items-center justify-center gap-2 rounded-control px-6 text-body font-semibold transition duration-100 ease-out active:scale-97 motion-reduce:active:scale-100";

const variants: Record<Variant, string> = {
  primary: "bg-teal-400 text-night-950 shadow-cta hover:bg-teal-300",
  ghost: "border border-night-600 text-mist-100 hover:border-mist-400 hover:bg-night-800",
};

type CtaLinkProps = ComponentProps<typeof Link> & { variant?: Variant };

export function CtaLink({ variant = "primary", className, children, ...props }: CtaLinkProps) {
  return (
    <Link {...props} className={`${base} ${variants[variant]} ${className ?? ""}`}>
      {children}
      {variant === "primary" ? <Arrow /> : null}
    </Link>
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`size-4 transition-transform duration-200 ease-out group-hover:-translate-x-1 ${className ?? ""}`}
      aria-hidden="true"
    >
      <path d="M12.5 4.5 7 10l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
