import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
  name: string;
  photoUri?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PlayerAvatar({ name, photoUri, size = "md", className }: PlayerAvatarProps) {
  const sizeClasses = {
    sm: "player-avatar-sm",
    md: "player-avatar",
    lg: "player-avatar-lg",
  };

  const initials = getInitials(name);

  if (photoUri) {
    return (
      <div className={cn(sizeClasses[size], className)}>
        <img src={photoUri} alt={name} />
      </div>
    );
  }

  return (
    <div className={cn(sizeClasses[size], className)}>
      {initials}
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
