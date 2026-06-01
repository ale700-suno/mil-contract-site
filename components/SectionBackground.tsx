type SectionBackgroundProps = {
  src: string;
  variant?: "hero" | "conditions" | "positions";
};

export function SectionBackground({
  src,
  variant = "hero",
}: SectionBackgroundProps) {
  return (
    <>
      <div
        className={`mil-section-bg mil-section-bg--${variant} absolute inset-0 z-0 pointer-events-none`}
        style={{ backgroundImage: `url("${src}")` }}
        aria-hidden
      />
      <div
        className={`mil-section-bg-overlay mil-section-bg-overlay--${variant} absolute inset-0 z-[1] pointer-events-none`}
        aria-hidden
      />
    </>
  );
}
