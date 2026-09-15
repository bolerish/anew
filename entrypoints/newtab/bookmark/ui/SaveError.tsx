import * as stylex from "@stylexjs/stylex";
import { useLanguage } from "~shared/lib/preferences";
import { Field, FieldError } from "~shared/ui/field";

const styles = stylex.create({
  root: { gridColumn: "1 / -1" },
});

export function SaveError() {
  const copy = useLanguage().bookmark;
  return (
    <Field xstyle={styles.root}>
      <FieldError match={true} role="alert">
        {copy.formSaveError}
      </FieldError>
    </Field>
  );
}
