import { SectionItem } from "~newtab/settings/ui/SettingsSection";
import { Slider } from "~shared/ui/slider";

import { CORNER_RADIUS } from "../model/constants";
import type { AppearanceSettings } from "../model/types";
import { updateAppearanceSetting } from "../model/update";

const CORNER_RADIUS_SLIDER_STEP = 0.5;
const CORNER_RADIUS_PREVIEW_INSET = 2;

type CornerRadiusProps = { cornerRadius: AppearanceSettings["cornerRadius"] };

export function CornerRadius({ cornerRadius }: CornerRadiusProps) {
  return (
    <SectionItem label="Corner radius">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <Slider
          aria-label="Corner radius"
          className="mx-auto w-full max-w-xs"
          indicatorClassName="bg-primary"
          max={CORNER_RADIUS.max}
          min={CORNER_RADIUS.min}
          step={CORNER_RADIUS_SLIDER_STEP}
          value={cornerRadius}
          onValueChange={(value) => void updateAppearanceSetting("cornerRadius", value)}
        />
        <div
          aria-hidden="true"
          className="border-border bg-muted grid size-5 place-items-center border"
          style={{ borderRadius: `${cornerRadius}px` }}
        >
          <div
            className="bg-primary size-3"
            style={{ borderRadius: `${Math.max(0, cornerRadius - CORNER_RADIUS_PREVIEW_INSET)}px` }}
          />
        </div>
      </div>
    </SectionItem>
  );
}
