"use client";
import * as React from "react";
import { useSession, signIn } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeClosed } from "lucide-react";
import { toast } from "sonner";

// Function to fetch user ID from JSON data
// async function getUserId(email: string): Promise<string | null> {
async function getUserId(email: string) {
  try {
    const response = await fetch(`/api/users/email/${email}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const res = await response.json();
    
    return res.user;
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return null;
  }
}

export default function LoginCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const toastShownRef = useRef(false);

  // Redirect if user is already logged in
  useEffect(() => {
    const redirectUser = async () => {
      console.log("Session:", session);
      if (session?.user?.email) {
        console.log("User is already logged in");
        const user = await getUserId(session.user.email);
        // Redirect to user profile page
        router.push(`/profile/user/${user._id}`);
      }
    };
    
    redirectUser();
  }, [session, router]);

  useEffect(() => {
    if (session?.user && !toastShownRef.current) {
      toast(`Logged in as ${session.user.email}`, {
        action: {
          label: "Browse events",
          onClick: () => router.push("/events"),
        },
        duration: Infinity,
        dismissible: true,
      });
      toastShownRef.current = true;
    }
    // Reset the ref when session changes to null (user logs out)
    if (!session) {
      toastShownRef.current = false;
    }
  }, [session, router]);

  const handleCredentialsLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.warning("Login failed", {
          description: result.error,
        });
        console.error("Login failed:", result.error);
      }
    } catch (error) {
      toast.error("Login error", {
        description: "An unexpected error occurred",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // If loading or already authenticated, show loading state
  if (status === "loading" || session?.user) {
    return (
      <Card className="w-full max-w-lg py-8 px-4">
        <CardContent className="flex justify-center items-center py-8">
          <p>Redirecting...</p>
        </CardContent>
      </Card>
    );
  }

  // Show login form if not authenticated
  return (
    <Card className="w-full max-w-lg py-8 px-4">
      <CardHeader className="py-4">
        <CardTitle>Login</CardTitle>
        <CardDescription>Great to see you back!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCredentialsLogin}>
          <div className="grid w-full items-center gap-6">
            <div className="flex flex-col gap-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
              />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={16} /> : <EyeClosed size={16} />}
                </button>
              </div>
            </div>
          </div>
          <CardFooter className="flex flex-col justify-between pt-8 gap-4 px-0">
            <Button
              type="submit"
              className="w-full"
              variant={"secondary"}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <Separator />
            <Button
              type="button"
              onClick={() => signIn("github")}
              className="w-full"
            >
              <GitHubLogoIcon className="mr-2" /> Login with GitHub
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
