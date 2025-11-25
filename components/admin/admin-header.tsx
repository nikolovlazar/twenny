"use client";

import { User } from "@/server/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  user: User;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
      setIsSigningOut(false);
    }
  };

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-xl font-bold">
            Twenny Admin
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {user.name || user.email}
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/">View Site</Link>
          </Button>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            disabled={isSigningOut}
          >
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </Button>
        </div>
      </div>
    </header>
  );
}

