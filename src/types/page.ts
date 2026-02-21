export type DatabaseViewType =
  | "table"
  | "board"
  | "gallery"
  | "calendar"
  | "list"
  | "timeline";

export interface Page {
  id: string;
  workspaceId: string;
  parentId: string | null;
  title: string;
  icon: string | null;
  coverUrl: string | null;
  isDatabase: boolean;
  databaseType: DatabaseViewType | null;
  sortOrder: number;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreatePageParams {
  workspaceId: string;
  parentId?: string | null;
  title: string;
  isDatabase: boolean;
  databaseType?: DatabaseViewType | null;
}

export interface UpdatePageParams {
  title?: string;
  icon?: string | null;
  coverUrl?: string | null;
  isFavorite?: boolean;
  databaseType?: DatabaseViewType | null;
}

export interface PageTreeNode {
  page: Page;
  children: PageTreeNode[];
}
