"use client";

import { useState, useEffect } from "react";

// DATA
import { LUCIDE_ICON_MAP } from "@/data/icon";

// TYPESCRIPT
type Props = {
  icon: string | null;
  size?: number;
  className?: string;
};

const WorkspaceIcon = ({ icon, size = 20, className = "" }: Props) => {
  // States
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Effect - Resolve Image Path
  useEffect(() => {
    if (!icon?.startsWith("image:")) {
      setImageSrc(null);
      return;
    }

    async function resolveImage() {
      try {
        const { convertFileSrc } = await import("@tauri-apps/api/core");
        const { appDataDir, join } = await import("@tauri-apps/api/path");
        const dataDir = await appDataDir();
        const relativePath = icon!.replace("image:", "");
        const fullPath = await join(dataDir, relativePath);
        setImageSrc(convertFileSrc(fullPath));
      } catch {
        setImageSrc(null);
      }
    }

    resolveImage();
  }, [icon]);

  // Case - No Icon
  if (!icon) {
    return (
      <span className={className} style={{ fontSize: size }}>
        🏠
      </span>
    );
  }

  // Case - Lucide Icon
  if (icon.startsWith("lucide:")) {
    const iconName: string = icon.replace("lucide:", "");
    const IconComponent = LUCIDE_ICON_MAP[iconName];
    if (IconComponent) {
      return (
        <IconComponent size={size} className={`text-accent ${className}`} />
      );
    }
    return (
      <span className={className} style={{ fontSize: size }}>
        🏠
      </span>
    );
  }

  // Case - Custom Image
  if (icon.startsWith("image:")) {
    if (imageSrc) {
      return (
        <img
          src={imageSrc}
          alt="Workspace icon"
          className={`rounded object-cover ${className}`}
          style={{ width: size, height: size }}
        />
      );
    }
    return (
      <span className={className} style={{ fontSize: size }}>
        🏠
      </span>
    );
  }

  // Emoji (Default)
  return (
    <span className={className} style={{ fontSize: size }}>
      {icon}
    </span>
  );
};

export default WorkspaceIcon;
