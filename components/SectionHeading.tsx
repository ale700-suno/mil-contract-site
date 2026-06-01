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
  return (
    <div className={`mb-6 sm:mb-8 md:mb-10 ${className}`}>
      <Tag
        className={`section-title-with-ribbon break-words font-bold ${
          Tag === "h1"
            ? "text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08]"
            : "text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-snug"
        }`}
      >
        <span className="section-title-with-ribbon__ribbon" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/textures/lenta.png"
            alt=""
            className="section-title-with-ribbon__img"
            draggable={false}
          />
        </span>
        <span className="section-title-with-ribbon__text">{title}</span>
      </Tag>
      {tagline ? (
        <p className="mt-3 text-white/55 text-sm sm:text-base md:text-lg max-w-3xl italic tracking-wide">
          {tagline}
        </p>
      ) : null}
    </div>
  );
}
