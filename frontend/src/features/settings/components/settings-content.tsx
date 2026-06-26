"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/providers/auth-provider";
import * as authApi from "@/lib/api/auth";
import { format } from "date-fns";

export function SettingsContent() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    username: user?.username ?? "",
    email: user?.email ?? "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({ username: user.username, email: user.email });
    }
  }, [user]);

  async function saveProfile() {
    setSaving(true);
    try {
      await authApi.updateProfile(profile);
      await refreshUser();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile."
      />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProfileAvatar
            userId={user.id}
            username={user.username}
            profilePicture={user.profilePicture}
            onUpdated={() => void refreshUser()}
          />
          <div>
            <p className="font-semibold">{user.username}</p>
            <p className="text-sm capitalize text-muted-foreground">
              {user.role.replace("_", " ")}
            </p>
            {user.lastLoginAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                Last login: {format(new Date(user.lastLoginAt), "MMM d, yyyy HH:mm")}
              </p>
            )}
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
          <Button onClick={() => void saveProfile()} disabled={saving}>
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
