export type BlockType =
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "bulleted_list"
  | "numbered_list"
  | "todo"
  | "toggle"
  | "quote"
  | "divider"
  | "code"
  | "image"
  | "callout"
  | "bookmark";

export interface Block {
  id: string;
  pageId: string;
  parentBlockId: string | null;
  type: BlockType;
  content: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateBlockParams {
  pageId: string;
  type: BlockType;
  content: string;
  sortOrder: number;
  parentBlockId?: string | null;
}

export interface BlockReorder {
  id: string;
  sortOrder: number;
}
