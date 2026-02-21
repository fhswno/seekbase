export type DatabaseViewType =
  | "table"
  | "board"
  | "gallery"
  | "calendar"
  | "list"
  | "timeline";

export type Page = {
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
};

export type CreatePageParams = {
  workspaceId: string;
  parentId?: string | null;
  title: string;
  isDatabase: boolean;
  databaseType?: DatabaseViewType | null;
};

export type UpdatePageParams = {
  title?: string;
  icon?: string | null;
  coverUrl?: string | null;
  isFavorite?: boolean;
  databaseType?: DatabaseViewType | null;
};

export type PageTreeNode = {
  page: Page;
  children: PageTreeNode[];
};
