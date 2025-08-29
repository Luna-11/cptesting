import NextAuth, { type AuthOptions, type DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

// Database user interface
interface DatabaseUser {
  user_id: number;
  name: string;
  email: string;
  password: string;
  role_id: number;
}

// Map numeric role_id → string role
function mapRole(roleId: number): "user" | "pro" | "admin" {
  switch (roleId) {
    case 1: return "admin";
    case 3: return "pro";
    default: return "user"; // BASIC (2) or unknown
  }
}

// Custom user type
interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "pro" | "admin";
}

// Extend NextAuth types
declare module 'next-auth' {
  interface User extends AppUser {}
  interface Session extends DefaultSession {
    user: AppUser;
  }
}

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'studywithme'
});

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<AppUser | null> {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const [users] = await pool.query<(DatabaseUser & mysql.RowDataPacket)[]>(
            'SELECT user_id, name, email, password, role_id FROM users WHERE email = ?',
            [credentials.email]
          );

          const user = Array.isArray(users) ? users[0] : null;
          if (!user) return null;

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          return {
            id: user.user_id.toString(),
            name: user.name,
            email: user.email,
            role: mapRole(user.role_id)  
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; 
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && token.role) {
        session.user = {
          ...session.user,
          id: token.sub,
          role: token.role as "user" | "pro" | "admin"
        };
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
