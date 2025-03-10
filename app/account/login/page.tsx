"use client";

import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (session) {
      console.log({ session });
      // Optional: redirect after successful login
      // router.push("/");
    }
  }, [session, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <Button onClick={() => signIn("github")}>Login with GitHub</Button>
        
        {status === "loading" && <p>Loading...</p>}
      </div>
    </div>
  );
}