type FolderPosition = { id: string; top: number };

/** Match folders against reachable scroll positions, including the bottom limit. */
export function resolveActiveFolder(
  folders: readonly FolderPosition[],
  scrollTop: number,
  maxScrollTop: number,
  selectedId: string | undefined,
): string | undefined {
  let active: string | undefined;
  let nearestDistance = Infinity;
  for (const folder of folders) {
    const target = Math.min(Math.max(folder.top, 0), Math.max(maxScrollTop, 0));
    const distance = Math.abs(target - scrollTop);
    if (distance < nearestDistance || (distance === nearestDistance && active !== selectedId)) {
      active = folder.id;
      nearestDistance = distance;
    }
  }
  return active;
}
