type SectionHeadingProps = {
  title: string;
  tagline?: string;
  className?: string;
  as?: "h1" | "h2";
};

export function SectionHeading({
  title,
  tagline,
  className = "",
  as: Tag = "h2",
}: SectionHeadingProps) {
  const first = title.charAt(0);
  const rest = title.slice(1);

  return (
    <div className="mb-8 sm:mb-10">
      <Tag
        className={`break-words font-bold ${Tag === "h1" ? "text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05]" : "text-2xl sm:text-3xl md:text-4xl"} ${className}`}
      >
        <span className="ribbon-first-letter" aria-hidden={false}>
          <span className="ribbon-first-letter__char">{first}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/textures/lenta.png"
            alt=""
            className="ribbon-first-letter__img"
            draggable={false}
          />
        </span>
        {rest}
      </Tag>
      {tagline ? (
        <p className="mt-3 text-white/55 text-base sm:text-lg max-w-3xl italic tracking-wide">
          {tagline}
        </p>
      ) : null}
    </div>
  );
}
