"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Github } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    try {
      const callbackURL = new URLSearchParams(window.location.search).get("callbackURL") || "/admin";
      await authClient.signIn.social({
        provider: "github",
        callbackURL,
      });
    } catch (error) {
      console.error("Sign in failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Sign in to Twenny</h1>
          <p className="text-muted-foreground">
            Sign in with your GitHub account to continue
          </p>
        </div>

        <Button onClick={handleGitHubSignIn} className="w-full" size="lg" disabled={isLoading}>
          <Github className="mr-2 h-5 w-5" />
          {isLoading ? "Redirecting..." : "Continue with GitHub"}
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Admin access requires approval
        </p>
      </Card>
    </div>
  );
}

