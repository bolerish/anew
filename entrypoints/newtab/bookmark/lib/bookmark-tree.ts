import type { BookmarkFolder, BookmarkLocation, BookmarkTreeNode } from "../model/bookmark-model";

const DEFAULT_BOOKMARK_SOURCE_TITLE = "Bookmarks";

export function deriveLocations(bookmarkTree: readonly BookmarkTreeNode[]): BookmarkLocation[] {
  return bookmarkTree.flatMap((node) => deriveRootBookmarkLocations(node));
}

export function deriveVisibleFolders(
  bookmarkTree: readonly BookmarkTreeNode[],
  selectedLocationId: string | null,
): BookmarkFolder[] {
  const selectedLocation = resolveBookmarkNode(bookmarkTree, selectedLocationId);

  if (!selectedLocation) {
    return [];
  }

  if (selectedLocation.parentId === "0") {
    return deriveFoldersFromSource(selectedLocation);
  }

  if (!isFolderNode(selectedLocation)) {
    return [];
  }

  return [deriveBookmarkFolder(selectedLocation)];
}

export function resolveLocationId(
  locations: readonly BookmarkLocation[],
  storedLocationId: string | null,
): string | null {
  if (locations.some((location) => location.id === storedLocationId)) {
    return storedLocationId;
  }

  return locations[0]?.id ?? null;
}

function deriveRootBookmarkLocations(node: BookmarkTreeNode): BookmarkLocation[] {
  if (node.id !== "0") {
    return [];
  }

  return (node.children ?? []).flatMap((child) =>
    isFolderNode(child) ? deriveFolderLocations(child, child.title.trim() || DEFAULT_BOOKMARK_SOURCE_TITLE, 0) : [],
  );
}

function deriveFolderLocations(node: BookmarkTreeNode, rootTitle: string, depth: number): BookmarkLocation[] {
  const title = node.title.trim() || DEFAULT_BOOKMARK_SOURCE_TITLE;

  return [
    {
      depth,
      id: node.id,
      rootTitle,
      title,
    },
    ...(node.children ?? []).flatMap((child) =>
      isFolderNode(child) ? deriveFolderLocations(child, rootTitle, depth + 1) : [],
    ),
  ];
}

function resolveBookmarkNode(
  bookmarkTree: readonly BookmarkTreeNode[],
  nodeId: string | null,
): BookmarkTreeNode | null {
  if (!nodeId) {
    return null;
  }

  for (const node of bookmarkTree) {
    const foundNode = resolveNodeInTree(node, nodeId);

    if (foundNode) {
      return foundNode;
    }
  }

  return null;
}

function resolveNodeInTree(node: BookmarkTreeNode, nodeId: string): BookmarkTreeNode | null {
  if (node.id === nodeId) {
    return node;
  }

  for (const child of node.children ?? []) {
    const foundNode = resolveNodeInTree(child, nodeId);

    if (foundNode) {
      return foundNode;
    }
  }

  return null;
}

function deriveFoldersFromSource(source: BookmarkTreeNode): BookmarkFolder[] {
  const directItems = deriveBookmarkItems(source);
  const sourceFolder =
    directItems.length > 0
      ? [createBookmarkFolder(source, source.title.trim() || DEFAULT_BOOKMARK_SOURCE_TITLE, directItems)]
      : [];
  const nestedFolders = (source.children ?? []).flatMap((child) =>
    child.children ? deriveBookmarkFoldersFromNode(child, []) : [],
  );

  return [...sourceFolder, ...nestedFolders];
}

function deriveBookmarkFoldersFromNode(node: BookmarkTreeNode, parentTitles: readonly string[]): BookmarkFolder[] {
  const children = node.children ?? [];
  const folderTitle = node.title.trim();
  const nextParentTitles = folderTitle ? [...parentTitles, folderTitle] : parentTitles;
  const displayTitle = nextParentTitles.length > 0 ? nextParentTitles.join(" / ") : DEFAULT_BOOKMARK_SOURCE_TITLE;
  const items = deriveBookmarkItems(node);
  const nestedFolders = children.flatMap((child) =>
    child.children ? deriveBookmarkFoldersFromNode(child, nextParentTitles) : [],
  );

  return [createBookmarkFolder(node, displayTitle, items), ...nestedFolders];
}

function deriveBookmarkFolder(node: BookmarkTreeNode): BookmarkFolder {
  const title = node.title.trim() || DEFAULT_BOOKMARK_SOURCE_TITLE;

  return createBookmarkFolder(node, title, deriveBookmarkItems(node));
}

function createBookmarkFolder(
  node: BookmarkTreeNode,
  displayTitle: string,
  items: BookmarkFolder["items"],
): BookmarkFolder {
  return {
    bookmarkIndex: node.index,
    displayTitle,
    id: node.id,
    parentId: node.parentId,
    title: node.title.trim() || DEFAULT_BOOKMARK_SOURCE_TITLE,
    items,
  };
}

function deriveBookmarkItems(node: BookmarkTreeNode) {
  return (node.children ?? []).filter(isItemNode).map((child) => ({
    bookmarkIndex: child.index,
    id: child.id,
    parentId: node.id,
    title: child.title,
    url: child.url,
  }));
}

function isItemNode(node: BookmarkTreeNode): node is BookmarkTreeNode & { url: string } {
  return typeof node.url === "string" && node.url.length > 0;
}

function isFolderNode(node: BookmarkTreeNode): node is BookmarkTreeNode & { children: BookmarkTreeNode[] } {
  return Array.isArray(node.children);
}
