import clsx from "clsx";
import { hasFlag } from "country-flag-icons";

/**
 * A country flag from /flags/XX.svg (see app/flags), so only the flags on
 * screen are downloaded instead of every flag being bundled into the page.
 */
export function Flag({
  code,
  title,
  className,
}: {
  code: string;
  title: string;
  className?: string;
}) {
  if (!/^[A-Z]{2}$/.test(code) || !hasFlag(code)) {
    return (
      <span
        aria-hidden="true"
        className={clsx("inline-block bg-default-100", className)}
      />
    );
  }

  return (
    // A tiny static SVG: next/image's optimiser adds nothing here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={title}
      className={clsx("object-cover", className)}
      decoding="async"
      height={20}
      loading="lazy"
      src={`/flags/${code}.svg`}
      width={30}
    />
  );
}
