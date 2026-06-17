import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export const EmptyState = ({ title, description, ctaLabel, ctaHref }: EmptyStateProps) => {
  return (
    <section className="clearit-card py-10 text-center">
      <h2 className="font-display text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm text-slate-600">{description}</p>
      {ctaLabel && ctaHref ? (
        <Link href={ctaHref} className="clearit-primary-btn mx-auto mt-5 inline-flex">
          {ctaLabel}
        </Link>
      ) : null}
    </section>
  );
};
