import { FileNode } from "../types/chat.js";

export const buildTree = (files: string[]): FileNode[] => {
  const root: FileNode[] = [];
  for (const file of files) {
    const parts = file.split("/");
    let currentLevel = root;
    let currentPath = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isDir = i < parts.length - 1;
      let existingNode = currentLevel.find((node) => node.name === part);
      if (!existingNode) {
        existingNode = {
          name: part,
          path: currentPath,
          isDir: isDir,
          children: [],
        };
        currentLevel.push(existingNode);
      }
      currentLevel = existingNode.children;
    }
  }

  const sortTree = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.isDir) {
        sortTree(node.children);
      }
    }
  };
  sortTree(root);
  return root;
};
