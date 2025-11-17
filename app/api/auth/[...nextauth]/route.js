import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        await connectDB();
        const user = await User.findOne({ email: credentials.email }).lean();
        if (!user || !user.password) {
          return null;
        }
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }
        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          image: user.image || null,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth (Google): ensure a local user exists
      if (account?.provider === 'google') {
        await connectDB();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          await User.create({
            name: user.name || profile?.name || 'User',
            email: user.email,
            role: 'user',
            // image is optional in our schema; add if supported
            image: user.image || profile?.picture || undefined,
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
        token.name = user.name || token.name;
        token.email = user.email || token.email;
        token.image = user.image || token.image;
      } else if (token?.email) {
        // Ensure role/id present on subsequent calls
        await connectDB();
        const dbUser = await User.findOne({ email: token.email }).lean();
        if (dbUser) {
          token.id = String(dbUser._id);
          token.role = dbUser.role || token.role || 'user';
          token.name = dbUser.name || token.name;
          token.image = dbUser.image || token.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id;
        session.user.role = token.role || 'user';
        session.user.name = token.name || session.user.name;
        session.user.image = token.image || session.user.image;
      }
      return session;
    },
  },
  pages: {
    // We will handle locale manually on the pages
    signIn: '/en/sign-in',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const authHandler = NextAuth(authOptions);

export const GET = authHandler;
export const POST = authHandler;


