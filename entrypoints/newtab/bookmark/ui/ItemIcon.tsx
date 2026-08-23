import { useEffect, useState } from "react";
import { cn } from "~shared/lib/utils";

import { getIconAppearance } from "../lib/icon-appearance";

type ItemIconProps = {
  icon: string | undefined;
  label: string;
  marker?: "dash" | "square";
};

export function ItemIcon({ icon, label, marker }: ItemIconProps) {
  const [hasLoadError, setHasLoadError] = useState(false);
  const [appearance, setAppearance] = useState<ReturnType<typeof getIconAppearance>>("normal");

  useEffect(() => {
    setHasLoadError(false);
  }, [icon]);

  if (marker) {
    return (
      <span className="text-muted-foreground text-mds-shortcut-label grid size-4.5 shrink-0 place-items-center leading-none">
        {marker === "square" ? "▪" : "—"}
      </span>
    );
  }

  if (!icon || hasLoadError) {
    return (
      <span className="text-mds-caption bg-muted text-muted-foreground grid size-4.5 shrink-0 place-items-center rounded font-semibold">
        {label.trim().charAt(0).toUpperCase() || "?"}
      </span>
    );
  }

  return (
    <span className="grid size-4.5 place-items-center">
      <img
        alt=""
        className={cn(
          "size-3.5 object-contain",
          appearance === "dark" && "dark:invert",
          appearance === "light" && "dark:brightness-90",
        )}
        src={icon}
        onError={() => setHasLoadError(true)}
        onLoad={(event) => setAppearance(getIconAppearance(event.currentTarget))}
      />
    </span>
  );
}
