import { cn } from "@/lib/cn";

type AvatarProps = {
  name: string;
  src?: string | null;
  className?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ name, src, className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={`${name} avatar`}
        className={cn(
          "h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-slate-200/80",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-primary",
        className,
      )}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
