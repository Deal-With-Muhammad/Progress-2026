"use client";

import { useEffect, useState } from "react";
import { FiEye } from "react-icons/fi";
import { Link } from "@heroui/link";

import { siteConfig } from "@/config/site";

const VIEWS_API = "https://www.dealwithmuhammad.com/api/views?site=progress";

interface ViewsResponse {
  ready: boolean;
  site: string;
  visitors: number;
  pageviews: number;
  today: { visitors: number; pageviews: number };
}

const numberFormat = new Intl.NumberFormat("en-US");

/**
 * Public visitor count from the shared analytics. Renders nothing until the
 * stats are ready (or if the request fails); the fixed-height wrapper keeps the
 * footer from shifting when the count appears.
 */
export function VisitorCounter() {
  const [visitors, setVisitors] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(VIEWS_API, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: ViewsResponse | null) => {
        if (data?.ready && Number.isFinite(data.visitors)) {
          setVisitors(data.visitors);
        }
      })
      .catch(() => {
        // Blocked, offline or not deployed yet: show nothing.
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="flex h-5 items-center justify-center gap-1.5 text-xs text-default-500">
      {visitors !== null && (
        <>
          <FiEye aria-hidden="true" className="h-3.5 w-3.5" />
          <span>
            {numberFormat.format(visitors)}{" "}
            {visitors === 1 ? "visitor" : "visitors"}
          </span>
          <span aria-hidden="true">·</span>
          <Link
            className="text-xs text-default-500 hover:text-primary"
            href={siteConfig.links.stats}
            rel="noopener"
            target="_blank"
          >
            Live stats
          </Link>
        </>
      )}
    </div>
  );
}
