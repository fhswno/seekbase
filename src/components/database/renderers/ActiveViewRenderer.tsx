// COMPONENTS
import TableView from "../views/TableView";
import BoardView from "../views/BoardView";
import GalleryView from "../views/GalleryView";
import CalendarView from "../views/CalendarView";
import ListView from "../views/ListView";
import TimelineView from "../views/TimelineView";

// TYPES
import type { DatabaseViewType } from "@/types";

const ActiveViewRenderer = ({ viewType }: { viewType: DatabaseViewType }) => {
  switch (viewType) {
    case "table":
      return <TableView />;
    case "board":
      return <BoardView />;
    case "gallery":
      return <GalleryView />;
    case "calendar":
      return <CalendarView />;
    case "list":
      return <ListView />;
    case "timeline":
      return <TimelineView />;
    default:
      return <TableView />;
  }
};

export default ActiveViewRenderer;
