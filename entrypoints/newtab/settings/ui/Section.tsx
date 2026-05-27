import { type ReactNode } from "react";

import { cn } from "../../shared/lib/utils";

type SectionProps = {
  children?: ReactNode;
  className?: string;
};

export function Section({ className, children }: SectionProps) {
  return <div className={cn("grid gap-2.5 px-4", className)}>{children}</div>;
}

type SectionHeaderProps = {
  title: string;
  children?: ReactNode;
};

export function SectionHeader({ title, children }: SectionHeaderProps) {
  return (
    <div className="flex min-h-6 min-w-0 items-center justify-between gap-3">
      <p className="text-muted-foreground/80 text-mds-setting-section min-w-0 truncate font-medium tracking-wide uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}

type SectionContentProps = {
  children?: ReactNode;
};

export function SectionContent({ children }: SectionContentProps) {
  return <div className="grid gap-2.5">{children}</div>;
}

type SectionItemProps = {
  label: string;
  description?: string;
  disabled?: boolean;
  children?: ReactNode;
};

export function SectionItem({ label, description, disabled, children }: SectionItemProps) {
  return (
    <div className="-mx-2 grid gap-1.5 px-2 py-1">
      <p className={cn("text-foreground/65 text-mds-setting-group", disabled && "text-muted-foreground/70")}>{label}</p>
      {description ? <p className="text-muted-foreground/75 text-mds-setting-group">{description}</p> : null}
      {children}
    </div>
  );
}
