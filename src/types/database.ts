import type { DatabaseViewType } from "./page";

export type PropertyType =
  | "text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "checkbox"
  | "url"
  | "email"
  | "relation"
  | "formula"
  | "created_at"
  | "updated_at";

export interface DatabaseProperty {
  id: string;
  pageId: string;
  name: string;
  type: PropertyType;
  options: string;
  sortOrder: number;
}

export interface DatabaseRow {
  id: string;
  pageId: string;
  rowPageId: string | null;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface DatabaseCell {
  id: string;
  rowId: string;
  propertyId: string;
  value: string;
}

export interface DatabaseView {
  id: string;
  pageId: string;
  name: string;
  type: DatabaseViewType;
  config: string;
  sortOrder: number;
}
