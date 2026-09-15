import * as stylex from "@stylexjs/stylex";
import { useLanguage } from "~shared/lib/preferences";
import { colorVars, spacingVars, sizeVars, layerVars, radiusVars, motionVars } from "~shared/styles/semantic.stylex";
import { Button } from "~shared/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "~shared/ui/tooltip";

import type { BookmarkFolder } from "../model/types";
import { useFolderNavigation } from "../model/useFolderNavigation";

const styles = stylex.create({
  folderName: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    transform: {
      default: "translateX(0)",
      ":is([data-starting-style], [data-ending-style])": `translateX(calc(${spacingVars.space2} * -1))`,
      ':is([data-motion-reduced="true"] *)': "none",
    },
    transitionDuration: {
      default: motionVars.durationNormal,
      ':is([data-motion-reduced="true"] *)': motionVars.durationInstant,
    },
  },
  contents: {
    display: { default: "none", "@media (min-width: 900px)": "grid" },
    backgroundColor: { default: colorVars.bgRaised, ":is(.dark *)": "transparent" },
    border: `1px solid ${colorVars.strokeDefault}`,
    borderRadius: radiusVars.md,
    padding: spacingVars.space1,
    position: "fixed",
    left: "calc(anchor(--bookmark-content right) + 2.5rem)",
    top: `calc(anchor(--bookmark-content top) + ${spacingVars.space6})`,
    maxHeight: `calc(100dvh - anchor(--bookmark-content top) - ${spacingVars.space6} * 2)`,
    overflowY: "auto",
    scrollbarWidth: "none",
    zIndex: layerVars.modalBackdrop,
  },
  contentsItems: { display: "grid", justifyItems: "start" },
  contentsButton: { justifyContent: "flex-start" },
  contentsLine: {
    color: colorVars.fgSecondary,
    transition: "width 160ms ease",
    ':is([data-motion-reduced="true"] *)': { transition: "none" },
    width: spacingVars.space3,
    height: sizeVars.stroke,
    backgroundColor: "currentColor",
  },
  currentLine: { width: spacingVars.space6, backgroundColor: colorVars.fgPrimary },
});
export function FolderContents({ folders }: { folders: readonly BookmarkFolder[] }) {
  const labels = useLanguage().settings;
  const { active, focusFolder } = useFolderNavigation(folders);

  return (
    <TooltipProvider delay={0}>
      <nav aria-label={labels.contents} {...stylex.props(styles.contents)}>
        <div {...stylex.props(styles.contentsItems)}>
          {folders.map((folder) => (
            <Tooltip key={folder.id}>
              <TooltipTrigger
                render={
                  <Button
                    render={<button type="button" {...stylex.props(styles.contentsButton)} />}
                    variant="ghost"
                    size="icon-xs"
                    type="button"
                    aria-label={folder.displayTitle}
                    aria-current={active === folder.id ? "location" : undefined}
                    onClick={() => focusFolder(folder.id)}
                  >
                    <span
                      aria-hidden="true"
                      {...stylex.props(styles.contentsLine, active === folder.id && styles.currentLine)}
                    />
                  </Button>
                }
              />
              <TooltipContent side="right" xstyle={styles.folderName}>
                {folder.displayTitle}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </nav>
    </TooltipProvider>
  );
}
