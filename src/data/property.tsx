// TYPES
import { PropertyType } from "@/types";

// LUCIDE
import {
  Type,
  Hash,
  ListChecks,
  Calendar,
  CheckSquare,
  Link,
  Mail,
  ArrowRight,
  Calculator,
  Clock,
} from "lucide-react";

//* Used in PropertyEditor.tsx to render property type options in the "Add Property" menu. Also used in DatabaseView.tsx to render the correct icon for each property type in the database table view.
export const PROPERTY_TYPES: Array<{
  value: PropertyType;
  label: string;
  icon: React.ReactNode;
}> = [
  { value: "text", label: "Text", icon: <Type size={14} /> },
  { value: "number", label: "Number", icon: <Hash size={14} /> },
  { value: "select", label: "Select", icon: <ListChecks size={14} /> },
  {
    value: "multi_select",
    label: "Multi-select",
    icon: <ListChecks size={14} />,
  },
  { value: "date", label: "Date", icon: <Calendar size={14} /> },
  { value: "checkbox", label: "Checkbox", icon: <CheckSquare size={14} /> },
  { value: "url", label: "URL", icon: <Link size={14} /> },
  { value: "email", label: "Email", icon: <Mail size={14} /> },
  { value: "relation", label: "Relation", icon: <ArrowRight size={14} /> },
  { value: "formula", label: "Formula", icon: <Calculator size={14} /> },
  { value: "created_at", label: "Created At", icon: <Clock size={14} /> },
  { value: "updated_at", label: "Updated At", icon: <Clock size={14} /> },
];
