import { spacingVars, typo } from "@bolerish/tokens/semantic.stylex";
import { Heading } from "@bolerish/ui/heading";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
const styles = stylex.create({
  title: { fontSize: `calc(${typo.fontSizeSm} / var(--mds-content-scale, 1) * var(--mds-heading-scale, 1))` },
  root: { display: "grid", gap: spacingVars.space4 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacingVars.space3 },
});
export function Section({ children }: { children?: ReactNode }) {
  return <section {...stylex.props(styles.root)}>{children}</section>;
}
export function SectionHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div {...stylex.props(styles.header)}>
      <Heading level={2} size="subsection">
        <span {...stylex.props(styles.title)}>{title}</span>
      </Heading>
      {children}
    </div>
  );
}
export function SectionContent({ children }: { children?: ReactNode }) {
  return <div {...stylex.props(styles.root)}>{children}</div>;
}
