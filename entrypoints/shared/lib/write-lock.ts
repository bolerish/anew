/** Serialize Min writes across new tabs sharing this extension origin. */
export async function withMinWriteLock<T>(action: () => Promise<T>): Promise<T> {
  return navigator.locks.request("min:writes", action);
}

/** Read the latest stored value and apply a patch while holding the write lock. */
export function updateStoredValue<T>(
  item: { getValue(): Promise<T>; setValue(value: T): Promise<void> },
  update: (current: T) => T,
): Promise<T> {
  return withMinWriteLock(async () => {
    const next = update(await item.getValue());
    await item.setValue(next);
    return next;
  });
}
