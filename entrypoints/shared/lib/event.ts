type StoppableInteractionEvent = {
  preventDefault: () => void;
  stopPropagation: () => void;
};

export function stopInteraction(e: StoppableInteractionEvent): void {
  e.preventDefault();
  e.stopPropagation();
}
