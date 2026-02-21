// TYPES
import { DatabaseViewType } from "./page";

export type Template = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  emoji: string;
  isDatabase: boolean;
  databaseType?: DatabaseViewType;
  content?: string; // JSON BlockNote blocks
};
