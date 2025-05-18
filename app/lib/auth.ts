import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { User } from "next-auth";
import { hashPassword, passwordMatch } from "../utils/password";
import { BASE_URL } from "../api/constants";

/**
 * Note: credentials only includes email and password, 
 * will need to generate fields for id. The other fields
 * should be filled in by user by editing their profile.
 * 
 * GitHub OAuth has the following information in the userSession:
 * {
        session: {
            user: {
                name: 'Looi Wei En',
                email: 'looi.weien02@student.usm.my',
                image: 'https://avatars.githubusercontent.com/u/93825624?v=4'
            },
            expires: '2025-04-08T15:54:54.286Z'
        }
    }
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        // Check if user exists in db
        // For logins, user should exist
        const encodedEmail = encodeURIComponent(credentials.email as string);
        const res = await fetch(`${BASE_URL}/api/users/email/${encodedEmail}`);

        if (res.status === 404) {
          console.log({ res });
          throw new Error("User not found");
        }

        const jsonRes = await res.json();
        const existingUser = jsonRes.user;
        console.log({ existingUser });

        // Check if credentials match
        const credentials_match = await passwordMatch(
          credentials.password,
          existingUser.password,
        );

        if (!credentials_match) {
          throw new Error("Invalid credentials");
        } else {
          // Convert MongoDB document to User object
          return {
            id: existingUser._id.toString(),
            email: existingUser.email,
            name: existingUser.name || null,
            image: existingUser.image || null,
          } as User;
        }
      },
    }),
  ],
});

export async function signUp({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name?: string;
}) {
  // Check if user exists
  // For signups, user should not exist
  const res = await fetch(`${BASE_URL}/api/users/email/${email}`);

  if (res.status != 404) {
    console.log({ res });
    throw new Error("User already exists with this email");
  }

  // Hash the password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = {
    email,
    password: hashedPassword,
    name: name || "",
    createdAt: new Date(),
  };

  // Insert the user document
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || ""}/api/users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password: hashedPassword,
        name,
        createdAt: new Date().toISOString(),
      }),
    },
  );

  console.log({ response });

  // Implementation:
  if (!response.ok) {
    const errorData = await response.json();
    return {
      success: false,
      error: errorData.error || "Failed to create user",
    };
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return {
    success: true,
    data: userWithoutPassword,
    message: "User created successfully",
  };
}
