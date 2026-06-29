import { Factory, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PageLoaderProps = {
  message?: string;
  variant?: "fullscreen" | "inline";
  className?: string;
};

export function PageLoader({
  message = "Loading...",
  variant = "fullscreen",
  className,
}: PageLoaderProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Loader2 className="size-4 animate-spin" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center gap-4 bg-background",
        className
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Factory className="size-7" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="text-sm font-medium text-foreground">Factory Flow</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
