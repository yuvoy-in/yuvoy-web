import Link from "next/link";

export interface Crumb {
  label: string;
  /** Omit on the final crumb — the current page is not a link to itself. */
  href?: string;
}

/**
 * Breadcrumb trail for nested routes.
 *
 * Rendering only. The `BreadcrumbList` structured-data version is a separate
 * concern and belongs with the rest of the JSON-LD, not inline here.
 */
export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={crumb.label} className="flex items-center gap-3">
              {crumb.href && !last ? (
                <Link
                  href={crumb.href}
                  className="label tap-target text-teal/75 hover:text-teal transition-colors duration-200"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="label text-terra-deep" aria-current="page">
                  {crumb.label}
                </span>
              )}
              {!last && (
                <span aria-hidden className="text-teal/75 text-xs">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
