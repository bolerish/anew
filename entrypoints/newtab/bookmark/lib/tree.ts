import { ROOT_BOOKMARK_ID, type BookmarkFolder, type BookmarkLocation, type BookmarkTreeNode } from "../model/types";

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

  if (selectedLocation.parentId === ROOT_BOOKMARK_ID) {
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
  if (node.id !== ROOT_BOOKMARK_ID) {
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
  const nestedFolders = (source.children ?? []).filter(isFolderNode).map(deriveBookmarkFolder);

  return [...sourceFolder, ...nestedFolders];
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
