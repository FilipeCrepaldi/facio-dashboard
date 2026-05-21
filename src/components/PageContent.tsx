import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string | null;
  actions?: ReactNode;
  children: ReactNode;
};

export function PageContent({ title, description, actions, children }: Props) {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text)]">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
        <div>{children}</div>
      </div>
    </main>
  );
}
