import type {
  Page,
  Workspace,
  UpdatePageParams,
  Block,
  BlockReorder,
  DatabaseProperty,
  DatabaseRow,
  DatabaseCell,
  DatabaseView,
  SearchResult,
  DatabaseViewType,
  PropertyType,
} from "@/types";

// Guard for SSG build — Tauri APIs only available in Tauri runtime
function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauri()) {
    throw new Error(`Tauri not available — cannot invoke "${cmd}"`);
  }
  const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
  return tauriInvoke<T>(cmd, args);
}

// --- Workspaces ---

export async function getWorkspaces(): Promise<Workspace[]> {
  return invoke<Workspace[]>("get_workspaces");
}

export async function createWorkspace(
  name: string,
  icon?: string | null,
): Promise<Workspace> {
  return invoke<Workspace>("create_workspace", { name, icon: icon ?? null });
}

export async function updateWorkspace(
  id: string,
  name?: string | null,
  icon?: string | null,
): Promise<Workspace> {
  return invoke<Workspace>("update_workspace", {
    id,
    name: name ?? null,
    icon: icon ?? null,
  });
}

export async function saveWorkspaceIcon(
  workspaceId: string,
  sourcePath: string,
): Promise<Workspace> {
  return invoke<Workspace>("save_workspace_icon", { workspaceId, sourcePath });
}

// --- Pages ---

export async function getPages(workspaceId: string): Promise<Page[]> {
  return invoke<Page[]>("get_pages", { workspaceId });
}

export async function getPage(id: string): Promise<Page> {
  return invoke<Page>("get_page", { id });
}

export async function createPage(params: {
  workspaceId: string;
  parentId?: string | null;
  title: string;
  isDatabase: boolean;
  databaseType?: DatabaseViewType | null;
}): Promise<Page> {
  return invoke<Page>("create_page", {
    workspaceId: params.workspaceId,
    parentId: params.parentId ?? null,
    title: params.title,
    isDatabase: params.isDatabase,
    databaseType: params.databaseType ?? null,
  });
}

export async function updatePage(
  id: string,
  fields: UpdatePageParams,
): Promise<Page> {
  return invoke<Page>("update_page", { id, fields });
}

export async function deletePage(id: string): Promise<void> {
  return invoke<void>("delete_page", { id });
}

export async function restorePage(id: string): Promise<void> {
  return invoke<void>("restore_page", { id });
}

export async function getDeletedPages(workspaceId: string): Promise<Page[]> {
  return invoke<Page[]>("get_deleted_pages", { workspaceId });
}

export async function permanentlyDeletePage(id: string): Promise<void> {
  return invoke<void>("permanently_delete_page", { id });
}

export async function movePage(
  id: string,
  newParentId: string | null,
  newSortOrder: number,
): Promise<void> {
  return invoke<void>("move_page", { id, newParentId, newSortOrder });
}

// --- Blocks ---

export async function getBlocks(pageId: string): Promise<Block[]> {
  return invoke<Block[]>("get_blocks", { pageId });
}

export async function createBlock(params: {
  pageId: string;
  type: string;
  content: string;
  sortOrder: number;
  parentBlockId?: string | null;
}): Promise<Block> {
  return invoke<Block>("create_block", {
    pageId: params.pageId,
    type: params.type,
    content: params.content,
    sortOrder: params.sortOrder,
    parentBlockId: params.parentBlockId ?? null,
  });
}

export async function updateBlock(id: string, content: string): Promise<Block> {
  return invoke<Block>("update_block", { id, content });
}

export async function deleteBlock(id: string): Promise<void> {
  return invoke<void>("delete_block", { id });
}

export async function reorderBlocks(updates: BlockReorder[]): Promise<void> {
  return invoke<void>("reorder_blocks", { updates });
}

export async function getPageContent(pageId: string): Promise<string | null> {
  return invoke<string | null>("get_page_content", { pageId });
}

export async function savePageContent(pageId: string, content: string): Promise<void> {
  return invoke<void>("save_page_content", { pageId, content });
}

// --- Database Properties ---

export async function getDatabaseProperties(
  pageId: string,
): Promise<DatabaseProperty[]> {
  return invoke<DatabaseProperty[]>("get_database_properties", { pageId });
}

export async function createProperty(params: {
  pageId: string;
  name: string;
  type: PropertyType;
  options: string;
}): Promise<DatabaseProperty> {
  return invoke<DatabaseProperty>("create_property", {
    pageId: params.pageId,
    name: params.name,
    type: params.type,
    options: params.options,
  });
}

export async function updateProperty(params: {
  id: string;
  name?: string;
  type?: PropertyType;
  options?: string;
  sortOrder?: number;
}): Promise<DatabaseProperty> {
  return invoke<DatabaseProperty>("update_property", {
    id: params.id,
    name: params.name ?? null,
    type: params.type ?? null,
    options: params.options ?? null,
    sortOrder: params.sortOrder ?? null,
  });
}

export async function deleteProperty(id: string): Promise<void> {
  return invoke<void>("delete_property", { id });
}

// --- Database Rows ---

export async function getDatabaseRows(pageId: string): Promise<DatabaseRow[]> {
  return invoke<DatabaseRow[]>("get_database_rows", { pageId });
}

export async function createRow(pageId: string): Promise<DatabaseRow> {
  return invoke<DatabaseRow>("create_row", { pageId });
}

export async function deleteRow(id: string): Promise<void> {
  return invoke<void>("delete_row", { id });
}

// --- Database Cells ---

export async function getCells(rowId: string): Promise<DatabaseCell[]> {
  return invoke<DatabaseCell[]>("get_cells", { rowId });
}

export async function updateCell(
  rowId: string,
  propertyId: string,
  value: string,
): Promise<DatabaseCell> {
  return invoke<DatabaseCell>("update_cell", { rowId, propertyId, value });
}

// --- Database Views ---

export async function getDatabaseViews(
  pageId: string,
): Promise<DatabaseView[]> {
  return invoke<DatabaseView[]>("get_database_views", { pageId });
}

export async function createView(params: {
  pageId: string;
  name: string;
  type: DatabaseViewType;
}): Promise<DatabaseView> {
  return invoke<DatabaseView>("create_view", {
    pageId: params.pageId,
    name: params.name,
    type: params.type,
  });
}

export async function updateView(params: {
  id: string;
  name?: string;
  config?: string;
  sortOrder?: number;
}): Promise<DatabaseView> {
  return invoke<DatabaseView>("update_view", {
    id: params.id,
    name: params.name ?? null,
    config: params.config ?? null,
    sortOrder: params.sortOrder ?? null,
  });
}

export async function deleteView(id: string): Promise<void> {
  return invoke<void>("delete_view", { id });
}

// --- Trash ---

export async function purgeOldTrash(): Promise<number> {
  return invoke<number>("purge_old_trash");
}

// --- Search ---

export async function search(
  workspaceId: string,
  query: string,
): Promise<SearchResult[]> {
  return invoke<SearchResult[]>("search", { workspaceId, query });
}

// --- Settings ---

export async function getSetting(key: string): Promise<string | null> {
  return invoke<string | null>("get_setting", { key });
}

export async function setSetting(key: string, value: string): Promise<void> {
  return invoke<void>("set_setting", { key, value });
}

export async function getAllSettings(): Promise<Record<string, string>> {
  return invoke<Record<string, string>>("get_all_settings");
}

// --- AI ---

export async function fetchOllamaModels(): Promise<string[]> {
  return invoke<string[]>("fetch_ollama_models");
}

// --- Misc ---

export interface UrlMetadata {
  url: string;
  title: string | null;
  description: string | null;
  favicon: string | null;
}

export async function fetchUrlMetadata(url: string): Promise<UrlMetadata> {
  return invoke<UrlMetadata>("fetch_url_metadata", { url });
}

export async function printPage(): Promise<void> {
  return invoke<void>("print_page");
}

export async function saveEditorImage(sourcePath: string): Promise<string> {
  return invoke<string>("save_editor_image", { sourcePath });
}

export async function saveEditorImageBytes(dataBase64: string, filename: string): Promise<string> {
  return invoke<string>("save_editor_image_bytes", { dataBase64, filename });
}
