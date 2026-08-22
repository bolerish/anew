type StoppableInteractionEvent = {
  preventDefault: () => void;
  stopPropagation: () => void;
};

export function stopInteraction(event: StoppableInteractionEvent): void {
  event.preventDefault();
  event.stopPropagation();
}
