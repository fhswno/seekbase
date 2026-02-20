// TYPESCRIPT
type Props = {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
};

const AppEmpty = ({ onToggleSidebar, sidebarCollapsed }: Props) => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-text-muted">
          Seekbase
        </h2>
        <p className="mt-2 text-sm text-text-faint">
          Select a page from the sidebar to get started
        </p>
        {sidebarCollapsed && (
          <button
            onClick={onToggleSidebar}
            className="mt-4 rounded-md bg-surface-2 px-3 py-1.5 text-sm text-text-muted transition-colors duration-[80ms] hover:text-text"
          >
            Show sidebar (&#8984;\)
          </button>
        )}
      </div>
    </div>
  );
};

export default AppEmpty;
