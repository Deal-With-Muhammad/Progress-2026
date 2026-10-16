import type { ReactNode } from "react";
import type { Faq, PageContent } from "@/lib/year-content";

import { Link } from "@heroui/link";
import clsx from "clsx";

import {
  CONTENT_UPDATED,
  CONTENT_UPDATED_LABEL,
  yearPages,
} from "@/config/site";

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
  const external = faq.link.href.startsWith("http");

  return (
    <>
      {withNode(
        faq.answer,
        faq.link.text,
        <Link
          className="text-base"
          href={faq.link.href}
          rel={external ? "noopener" : undefined}
          target={external ? "_blank" : undefined}
          underline="hover"
        >
          {faq.link.text}
        </Link>,
      )}
    </>
  );
}

const reasons = [
  {
    title: "Free, with no sign-up and no ads",
    text: "Open the page and the numbers are there. There is no account, no paywall and nothing to dismiss first.",
  },
  {
    title: "Live, in your own time zone",
    text: "Everything updates every second and is measured from midnight where you are. Pick any city with the Location button to see somewhere else.",
  },
  {
    title: "Nothing to install",
    text: "Many year progress tools are phone widgets or browser extensions. This one is a web page that works in any modern browser, on any device.",
  },
  {
    title: "Numbers you can read and quote",
    text: "Below the live display, the key figures are written out as plain text, dated, and refreshed every hour.",
  },
];

const sectionTitle = "text-xl md:text-2xl font-bold text-default-900";

/**
 * Server-rendered answers below the live display (summary, how-to, table,
 * reasons, related pages and FAQ), so people, crawlers and answer engines get
 * real numbers without running JavaScript.
 */
export default function YearFacts({
  content,
  path,
}: {
  content: PageContent;
  /** This page's path, so the related links skip it. */
  path: string;
}) {
  const {
    asOfIso,
    asOfLabel,
    summaryTitle,
    summary,
    facts,
    stepsTitle,
    steps,
    table,
    faqs,
  } = content;
  const related = [
    {
      path: "/",
      label: "Year progress bar",
      blurb: "The live percentage of the year that has passed.",
    },
    ...yearPages,
  ].filter((page) => page.path !== path);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-16">
      <section
        aria-labelledby="year-today"
        className="rounded-2xl bg-default-50 p-6 md:p-8"
      >
        <h2 className={sectionTitle} id="year-today">
          {summaryTitle}
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

      <section aria-labelledby="how-to" className="mt-12">
        <h2 className={sectionTitle} id="how-to">
          {stepsTitle}
        </h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-2">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-xl bg-default-50 p-4"
            >
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold text-default-900">{step.title}</h3>
                <p className="mt-1 text-default-600 leading-relaxed">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {table ? (
        <section aria-labelledby="table" className="mt-12">
          <h2 className={sectionTitle} id="table">
            {table.caption}
          </h2>
          <div className="mt-4 max-h-[32rem] overflow-auto rounded-xl border border-default-100">
            <table className="w-full text-left text-sm md:text-base">
              <thead className="sticky top-0 bg-default-100 text-default-700">
                <tr>
                  {table.columns.map((column) => (
                    <th
                      key={column}
                      className="px-4 py-2 font-semibold"
                      scope="col"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-default-100">
                {table.rows.map((row) => (
                  <tr
                    key={row.cells[0]}
                    aria-current={row.current ? "true" : undefined}
                    className={clsx(
                      "tabular-nums",
                      row.current
                        ? "bg-primary/10 font-semibold text-default-900"
                        : "text-default-600",
                    )}
                  >
                    {row.cells.map((cell, i) =>
                      i === 0 ? (
                        <th
                          key={i}
                          className="px-4 py-2 font-medium"
                          scope="row"
                        >
                          {cell}
                          {row.current ? (
                            <span className="ml-2 text-xs text-primary">
                              now
                            </span>
                          ) : null}
                        </th>
                      ) : (
                        <td key={i} className="px-4 py-2">
                          {cell}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="why" className="mt-12">
        <h2 className={sectionTitle} id="why">
          Why use this one
        </h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {reasons.map((reason) => (
            <li key={reason.title} className="rounded-xl bg-default-50 p-4">
              <h3 className="font-semibold text-default-900">{reason.title}</h3>
              <p className="mt-1 text-default-600 leading-relaxed">
                {reason.text}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <nav aria-labelledby="more-views" className="mt-12">
        <h2 className={sectionTitle} id="more-views">
          More ways to see the year
        </h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {related.map((page) => (
            <li key={page.path}>
              <Link
                className="flex h-full flex-col items-start rounded-xl border border-default-100 p-4 transition-colors hover:border-primary"
                href={page.path}
              >
                <span className="font-semibold text-default-900">
                  {page.label}
                </span>
                <span className="mt-1 text-sm text-default-600">
                  {page.blurb}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="faq" className="mt-12">
        <h2 className={sectionTitle} id="faq">
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
        <p className="mt-6 text-sm text-default-500">
          Updated{" "}
          <time dateTime={CONTENT_UPDATED}>{CONTENT_UPDATED_LABEL}</time>. The
          figures on this page are recalculated every hour.
        </p>
      </section>
    </div>
  );
}
