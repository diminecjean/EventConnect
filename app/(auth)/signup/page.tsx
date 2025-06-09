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
import { signIn } from "next-auth/react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Building,
  Calendar,
  Eye,
  EyeClosed,
  UserCircle,
  Users,
} from "lucide-react";
import { SignUpType } from "@/app/typings/profile/typings";
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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contactEmail: "",
    website: "",
    location: "",
    instagram: "",
    facebook: "",
    tags: "",
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleOrgSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Transform tags from comma-separated string to array
    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    // Create social links object
    const socialLinks = {
      instagram: formData.instagram,
      facebook: formData.facebook,
    };

    console.log("Creating organization with:", {
      ...formData,
      tags: tagsArray,
      social_links: socialLinks,
    });

    // Here you would handle image upload (e.g., to Cloudinary)
    // and then submit the complete data to your API
  };

  return (
    <>
      <CardHeader className="py-4">
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Create an account for your organization!
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col py-6">
        <form onSubmit={handleOrgSignUp}>
          <div className="grid w-full items-center gap-6">
            {/* Organization Logo */}
            <div className="flex flex-col gap-4">
              <Label htmlFor="logo">Organization Logo</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      width={80}
                      height={80}
                      objectFit="cover"
                    />
                  ) : (
                    <Building size={32} className="text-gray-400" />
                  )}
                </div>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="max-w-xs"
                />
              </div>
            </div>

            {/* Organization Name */}
            <div className="flex flex-col gap-4">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. GDG Kuala Lumpur"
                required
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-4">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of your organization"
                className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            {/* Email & Password */}
            <div className="flex flex-col gap-4">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleInputChange}
                placeholder="Official email address"
                required
              />
            </div>

            <div className="flex flex-col gap-4">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
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

            {/* Website */}
            <div className="flex flex-col gap-4">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://yourorganization.com"
              />
            </div>

            {/* Location */}
            <div className="flex flex-col gap-4">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, Country"
              />
            </div>

            {/* Social Links */}
            <div className="flex flex-col gap-4">
              <Label>Social Media Links</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="instagram" className="text-xs">
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    placeholder="https://instagram.com/youraccount"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="facebook" className="text-xs">
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-4">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Tech, Education, Community (comma separated)"
              />
              <p className="text-xs text-gray-500">
                Add comma-separated tags that describe your organization
              </p>
            </div>
          </div>

          <CardFooter className="flex flex-col justify-between pt-8 gap-4 px-0">
            <Button type="submit" className="w-full" variant={"secondary"}>
              Create Organization
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </>
  );
};
export default function SignUpPage() {
  const [signUpType, setSignUpType] = useState<SignUpType>("");
  return (
    <>
      <Card className="w-full max-w-xl py-8 px-4 mt-20">
        {signUpType === "" && (
          <>
            <CardContent className="flex flex-col py-6">
              <UserSignUp />
              {/* <div className="flex flex-col space-y-4">
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
              </div> */}
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
        )}
        {/* {signUpType === ACCOUNT_TYPE.USER && (
          <>
          <div
          className="flex flex-row items-center text-xs gap-1 pl-4 text-stone-500 cursor-pointer pb-4"
          onClick={() => setSignUpType("")}
          >
          <ArrowLeft size={14} /> Back
          </div>
            <UserSignUp />
          </>
        )}
        {signUpType === ACCOUNT_TYPE.ORGANIZATION && (
          <>
            <div
              className="flex flex-row items-center text-xs gap-1 pl-4 text-stone-500 cursor-pointer pb-4"
              onClick={() => setSignUpType("")}
            >
              <ArrowLeft size={14} /> Back
            </div>
            <OrgSignUp />
          </>
        )} */}
      </Card>
    </>
  );
}
