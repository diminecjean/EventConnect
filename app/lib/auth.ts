import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

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
            // TODO: Implement actual authentication and data fetching from db
            const email = "looi.weien02@gmail.com";
            const password = "something";
            
            if (credentials.email === email && credentials.password === password) {
                return {email, password};
            } else {
                throw new Error("Invalid credentials");
            }
        },
    })
],
});
