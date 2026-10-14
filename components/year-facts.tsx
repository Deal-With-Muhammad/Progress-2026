import type { ReactNode } from "react";
import type { Faq, YearContent } from "@/lib/year-content";

import { Link } from "@heroui/link";

/** Replace the first occurrence of `needle` in `text` with `node`. */
function withNode(text: string, needle: string, node: ReactNode): ReactNode {
  const index = text.indexOf(needle);

  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      {node}
      {text.slice(index + needle.length)}
    </>
  );
}

function FaqAnswer({ faq }: { faq: Faq }) {
  if (!faq.link) return <>{faq.answer}</>;

  return (
    <>
      {withNode(
        faq.answer,
        faq.link.text,
        <Link
          className="text-base"
          href={faq.link.href}
          rel="noopener"
          target="_blank"
          underline="hover"
        >
          {faq.link.text}
        </Link>,
      )}
    </>
  );
}

/**
 * Server-rendered summary and FAQ below the live counter, so crawlers and
 * answer engines get real numbers without running JavaScript.
 */
export default function YearFacts({ content }: { content: YearContent }) {
  const { stats, asOfIso, asOfLabel, summary, facts, faqs } = content;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-16">
      <section
        aria-labelledby="year-today"
        className="rounded-2xl bg-default-50 p-6 md:p-8"
      >
        <h2
          className="text-xl md:text-2xl font-bold text-default-900"
          id="year-today"
        >
          {stats.year} progress today
        </h2>
        <p className="mt-3 text-default-600 leading-relaxed">
          {withNode(
            summary,
            asOfLabel,
            <time dateTime={asOfIso}>{asOfLabel}</time>,
          )}
        </p>
        <dl className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="rounded-xl bg-background p-4 text-center"
            >
              <dt className="text-xs md:text-sm text-default-500">
                {fact.label}
              </dt>
              <dd className="mt-1 text-xl md:text-2xl font-bold text-default-900">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="faq" className="mt-12">
        <h2 className="text-xl md:text-2xl font-bold text-default-900" id="faq">
          Frequently asked questions
        </h2>
        <div className="mt-4 divide-y divide-default-100">
          {faqs.map((faq) => (
            <div key={faq.question} className="py-5">
              <h3 className="font-semibold text-default-900">{faq.question}</h3>
              <p className="mt-2 text-default-600 leading-relaxed">
                <FaqAnswer faq={faq} />
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
