"use client";
import * as React from "react";
import Image from "next/image";
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
import { useSession, signIn } from "next-auth/react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ArrowLeft, Building, Calendar, Eye, EyeClosed, UserCircle, Users } from "lucide-react";
import { ACCOUNT_TYPE, SignUpType } from "@/app/typings/profile/typings";

const UserSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleUserSignUp = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log("Signing up with email:", email);
  };

  return (
    <>
      <CardHeader className="py-4">
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create your account!</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col py-6">
        <form onSubmit={handleUserSignUp}>
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
            <Button type="submit" className="w-full" variant={"secondary"}>
              Sign Up
            </Button>
            <Separator />
            <p className="text-xs">or continue with your accounts through OAuth</p>
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

const AccountSelectionIllustration = () => {
  return (
    <div className="flex justify-center mb-8">
      <div className="relative h-40 w-full max-w-xs">
        <div className="absolute left-1/4 transform -translate-x-1/3 top-0">
          <div className="bg-blue-100 rounded-full p-4 border-white border-2">
            <UserCircle size={40} className="text-blue-500" />
          </div>
        </div>
        <div className="absolute right-1/4 transform translate-x-1/3 top-0">
          <div className="bg-purple-100 rounded-full p-4 border-white border-2">
            <Building size={40} className="text-purple-500" />
          </div>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0">
          <div className="bg-green-100 rounded-full p-4 border-white border-2">
            <Calendar size={40} className="text-green-500" />
          </div>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 top-1/3 -translate-y-1/2">
          <div className="bg-amber-100 rounded-full p-6 border-white border-4">
            <Users size={48} className="text-amber-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

const OrgSignUp = () => {
  return (
    <>
      <CardHeader className="py-4">
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Create an account for your organization!
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col py-6">
        <CardFooter></CardFooter>
      </CardContent>
    </>
  );
};

export default function SignUpPage() {
  const [signUpType, setSignUpType] = useState<SignUpType>("");
  return (
    <>
      <Card className="w-full max-w-xl py-8 px-4">
        {signUpType === "" && (
          <>
            
              <CardHeader>
                <AccountSelectionIllustration />
                <CardTitle className="text-center">
                  Welcome to EventConnect
                </CardTitle>
                <CardDescription className="text-center">
                  Choose how you want to sign up
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col py-6">
                <div className="flex flex-col space-y-4">
                  <Button
                    onClick={() => setSignUpType(ACCOUNT_TYPE.USER)}
                    variant="outline"
                    className="w-full p-6"
                  >
                    Sign up as an Individual User
                  </Button>
                  <Button
                    onClick={() => setSignUpType(ACCOUNT_TYPE.ORGANIZATION)}
                    variant="outline"
                    className="w-full p-6"
                  >
                    Sign up as an Organization
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col justify-between">
                <div className="pt-4">
                  <p className="text-sm text-center text-gray-500">
                    Already have an account?{" "}
                    <a href="/signin" className="text-blue-600 hover:underline">
                      Sign in
                    </a>
                  </p>
                </div>
              </CardFooter>
            </>
        )}
        {signUpType === ACCOUNT_TYPE.USER && (
          <>
            <div className="flex flex-row items-center text-xs gap-1 pl-4 text-stone-500 cursor-pointer pb-4" onClick={() => setSignUpType("")}>
              <ArrowLeft size={14}/> Back
            </div>
            <UserSignUp/>
          </>
        )}
        {signUpType === ACCOUNT_TYPE.ORGANIZATION && (
          <>
            <div className="flex flex-row items-center text-xs gap-1 pl-4 text-stone-500 cursor-pointer pb-4" onClick={() => setSignUpType("")}>
              <ArrowLeft size={14}/> Back
            </div>
            <OrgSignUp/>
          </>
        )}
      </Card>
    </>
  );
}
