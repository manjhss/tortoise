"use client";

import { Icon } from "@/src/components/custom/icon";
import { Button } from "@/src/components/ui/button";
import { useSignIn } from "@clerk/nextjs";
import GithubIcon from "@hugeicons/core-free-icons/GithubIcon";

export default function Page() {
  const { signIn } = useSignIn();

  const handleGitHubSignIn = () => {
    signIn?.authenticateWithRedirect({
      strategy: "oauth_github",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: process.env
        .NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL as string,
    });
  };

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading font-semibold text-xl">sign in</h1>
          <p className="font-mono text-muted-foreground">
            welcome back, let’s start reviewing
          </p>
        </div>
        <Button onClick={handleGitHubSignIn}>
          <Icon icon={GithubIcon} />
          continue
        </Button>
      </div>
    </div>
  );
}
