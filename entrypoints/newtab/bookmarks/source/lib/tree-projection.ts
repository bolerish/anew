import type { BookmarkFolder, BookmarkSource, BookmarkTreeNode } from "../../lib/model";

const DEFAULT_BOOKMARK_SOURCE_TITLE = "Bookmarks";

export function deriveBookmarkSources(bookmarkTree: BookmarkTreeNode[]): BookmarkSource[] {
  return bookmarkTree.flatMap((node) => deriveRootBookmarkSources(node));
}

export function deriveBookmarkFolders(
  bookmarkTree: BookmarkTreeNode[],
  selectedSourceId: string | null,
): BookmarkFolder[] {
  const selectedSource = resolveBookmarkNode(bookmarkTree, selectedSourceId);

  if (!selectedSource) {
    return [];
  }

  return deriveFoldersFromSource(selectedSource);
}

export function resolveSelectedSourceId(sources: BookmarkSource[], storedSourceId: string | null): string | null {
  if (sources.some((source) => source.id === storedSourceId)) {
    return storedSourceId;
  }

  return sources[0]?.id ?? null;
}

function deriveRootBookmarkSources(node: BookmarkTreeNode): BookmarkSource[] {
  if (node.id !== "0") {
    return [];
  }

  return (node.children ?? []).filter(isFolderNode).map((child) => ({
    id: child.id,
    title: child.title.trim() || DEFAULT_BOOKMARK_SOURCE_TITLE,
  }));
}

function resolveBookmarkNode(bookmarkTree: BookmarkTreeNode[], nodeId: string | null): BookmarkTreeNode | null {
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
      ? [
          {
            bookmarkIndex: source.index,
            displayTitle: source.title.trim() || DEFAULT_BOOKMARK_SOURCE_TITLE,
            id: source.id,
            items: directItems,
            parentId: source.parentId,
            title: source.title.trim() || DEFAULT_BOOKMARK_SOURCE_TITLE,
          },
        ]
      : [];
  const nestedFolders = (source.children ?? []).flatMap((child) =>
    child.children ? deriveBookmarkFoldersFromNode(child, []) : [],
  );

  return [...sourceFolder, ...nestedFolders];
}

function deriveBookmarkFoldersFromNode(node: BookmarkTreeNode, parentTitles: string[]): BookmarkFolder[] {
  const children = node.children ?? [];
  const folderTitle = node.title.trim();
  const nextParentTitles = folderTitle ? [...parentTitles, folderTitle] : parentTitles;
  const displayTitle = nextParentTitles.length > 0 ? nextParentTitles.join(" / ") : DEFAULT_BOOKMARK_SOURCE_TITLE;
  const items = deriveBookmarkItems(node);
  const nestedFolders = children.flatMap((child) =>
    child.children ? deriveBookmarkFoldersFromNode(child, nextParentTitles) : [],
  );

  return [
    {
      bookmarkIndex: node.index,
      displayTitle,
      id: node.id,
      parentId: node.parentId,
      title: folderTitle || DEFAULT_BOOKMARK_SOURCE_TITLE,
      items,
    },
    ...nestedFolders,
  ];
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
