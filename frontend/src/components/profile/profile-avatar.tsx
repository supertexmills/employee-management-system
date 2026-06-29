"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import * as authApi from "@/lib/api/auth";

type ProfileAvatarProps = {
  userId: string;
  username: string;
  profilePicture?: string | null;
  onUpdated?: () => void;
};

export function ProfileAvatar({
  userId,
  username,
  profilePicture,
  onUpdated,
}: ProfileAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const avatarSrc = profilePicture
    ? authApi.avatarUrl(userId)
    : authApi.avatarUrl(userId);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      await authApi.uploadAvatar(file);
      toast.success("Avatar updated");
      onUpdated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setUploading(true);
    try {
      await authApi.deleteAvatar();
      toast.success("Avatar removed");
      onUpdated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="size-16">
          <AvatarImage src={avatarSrc} alt={username} />
          <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
            {username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="mr-2 size-4" />
          Upload photo
        </Button>
        {profilePicture && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive"
            disabled={uploading}
            onClick={() => void handleRemove()}
          >
            <Trash2 className="mr-2 size-4" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
