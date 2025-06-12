"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signIn } from "next-auth/react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { signUp } from "@/app/lib/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Function to fetch user ID from JSON data
// async function getUserId(email: string): Promise<string | null> {
async function getUserId(email: string) {
  try {
    const response = await fetch(`/api/users/email/${email}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const res = await response.json();

    return res.user;
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return null;
  }
}

const UserSignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleUserSignUp = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      // Call the signUp function with email and password
      const result = await signUp({
        email,
        password,
        name,
      });

      if (result.success) {
        // If signup is successful, you might want to redirect or show success message
        console.log("User sign up successful:", result.message);

        // Auto-login after successful signup
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false, // Don't redirect automatically
        });

        // Show success toast
        toast.success(`Successfully created an account for ${email}`, {
          duration: 2000,
        });

        // Wait briefly for toast to be visible before redirecting
        setTimeout(async () => {
          // Get user ID for redirect
          try {
            const user = await getUserId(email);
            if (user?._id) {
              router.push(`/profile/user/${user._id}`);
            } else {
              router.push("/events"); // Fallback route if userId isn't available
            }
          } catch (error) {
            console.error("Error fetching user ID after signup:", error);
            router.push("/events"); // Fallback route
          }
        }, 2000);
      } else {
        // Handle signup failure
        console.error("Sign up failed:", result.error);
        toast.error("Sign up failed", {
          description: "Please check your information and try again",
          duration: 2000,
        });

        // Redirect to home after showing error
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (error) {
      console.error("Error during sign up:", error);
      toast.error("Something went wrong", {
        description: "Unable to complete registration at this time",
        duration: 2000,
      });

      // Redirect to home after showing error
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  };

  return (
    <>
      <CardHeader className="py-4">
        <CardTitle>Welcome to EventConnect</CardTitle>
        <CardDescription>Create your account now!</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col py-6">
        <form onSubmit={handleUserSignUp}>
          <div className="grid w-full items-center gap-6">
            <div className="flex flex-col gap-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
              />
            </div>
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
            <Button type="submit" className="w-full" variant={"secondary"}>
              Sign Up
            </Button>
            <Separator />
            <p className="text-xs">
              or continue with your accounts through OAuth
            </p>
            <Button
              type="button"
              onClick={() => signIn("github")}
              className="w-full"
            >
              <GitHubLogoIcon className="mr-2" /> Sign Up with your GitHub
              Account
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </>
  );
};

export default function SignUpPage() {
  return (
    <>
      <Card className="w-full max-w-xl py-8 px-4 mt-20">
        <>
          <CardContent className="flex flex-col py-6">
            <UserSignUp />
          </CardContent>
          <CardFooter className="flex flex-col justify-between">
            <div className="pt-4">
              <p className="text-sm text-center text-gray-500">
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 hover:underline">
                  Sign in
                </a>
              </p>
            </div>
          </CardFooter>
        </>
      </Card>
    </>
  );
}
