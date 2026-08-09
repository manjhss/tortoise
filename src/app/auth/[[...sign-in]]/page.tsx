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
      redirectUrlComplete:
        process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL as string,
    });
  };

  return (
    <div className="h-screen flex justify-center items-center">
      <Button onClick={handleGitHubSignIn}>
        <Icon icon={GithubIcon} />
        continue with github
      </Button>
    </div>
  );
}
