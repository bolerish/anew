import { CaretDownIcon, CaretUpIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import { useCallback, type MouseEvent } from "react";
import { stopInteraction } from "~newtab/shared/lib/event";
import { cn } from "~newtab/shared/lib/utils";
import { Button } from "~newtab/shared/ui/button";

type MoveButtonProps = {
  disabled?: boolean;
  direction: "down" | "up";
  label: string;
  onMove: () => void;
};

export function MoveButton({ disabled, direction, label, onMove }: MoveButtonProps) {
  const handleMove = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      stopInteraction(event);
      onMove();
    },
    [onMove],
  );
  const Icon = direction === "up" ? CaretUpIcon : CaretDownIcon;

  return (
    <Button
      aria-label={label}
      className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent disabled:border-transparent disabled:bg-transparent disabled:text-transparent"
      disabled={disabled}
      size="icon-sm"
      title={label}
      variant="ghost"
      onMouseDown={stopInteraction}
      onClick={handleMove}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

type RemoveButtonProps = {
  className?: string;
  disabled?: boolean;
  label: string;
  onRemove: () => void;
};

export function RemoveButton({ className, disabled, label, onRemove }: RemoveButtonProps) {
  const handleRemove = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      stopInteraction(event);
      onRemove();
    },
    [onRemove],
  );

  return (
    <Button
      aria-label={label}
      className={cn("text-muted-foreground hover:text-muted-foreground hover:bg-transparent", className)}
      disabled={disabled}
      size="icon-sm"
      title={label}
      variant="ghost"
      onMouseDown={stopInteraction}
      onClick={handleRemove}
    >
      <XIcon className="h-4 w-4" />
    </Button>
  );
}

type SaveButtonProps = {
  disabled?: boolean;
  label: string;
  onSave: () => void;
};

export function SaveButton({ disabled, label, onSave }: SaveButtonProps) {
  const handleSave = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      stopInteraction(event);
      onSave();
    },
    [onSave],
  );

  return (
    <Button
      aria-label={label}
      className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent"
      disabled={disabled}
      size="icon-sm"
      title={label}
      variant="ghost"
      onMouseDown={stopInteraction}
      onClick={handleSave}
    >
      <CheckIcon className="h-4 w-4" />
    </Button>
  );
}
