"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

type AvatarUploadProps = {
  username: string;
  profilePicture: string | null;
};

export function AvatarUpload({ username, profilePicture }: AvatarUploadProps) {
  const { refreshUser } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleFile = async (file: File | null) => {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Use a JPEG, PNG, or WebP image");
      return;
    }

    if (file.size > MAX_BYTES) {
      toast.error("Image must be 2MB or smaller");
      return;
    }

    setIsUploading(true);
    try {
      await authApi.uploadAvatar(file);
      await refreshUser();
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await authApi.removeAvatar();
      await refreshUser();
      toast.success("Profile photo removed");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Remove failed");
    } finally {
      setIsRemoving(false);
    }
  };

  const busy = isUploading || isRemoving;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative">
        <Avatar
          name={username}
          src={profilePicture}
          className="h-20 w-20 text-base"
        />
        <button
          type="button"
          className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-slate-700 shadow-sm hover:bg-surface-alt disabled:opacity-50"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label="Change profile photo"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-900">Profile photo</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Upload a square image up to 2MB. It is optimized and stored securely in
          your organization database.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? "Uploading..." : "Upload photo"}
          </Button>
          {profilePicture ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => void handleRemove()}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
      />
    </div>
  );
}
