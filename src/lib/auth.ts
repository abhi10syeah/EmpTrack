import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// This secret is used to sign and verify JWTs.
// In a real application, this should be a long, complex string stored securely in environment variables.
const secretKey = process.env.JWT_SECRET || 'a-very-secure-secret-key-that-is-at-least-32-bytes-long';
const key = new TextEncoder().encode(secretKey);

// Define the shape of the user session payload.
export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer';
}

// Encrypts the session payload into a JWT.
export async function encrypt(payload: UserSession) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // Token expires in 1 day.
    .sign(key);
}

// Decrypts the JWT from the session cookie to get the user payload.
export async function decrypt(input: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as UserSession;
  } catch (error) {
    // This can happen if the token is expired or invalid.
    console.error('Failed to verify session:', error);
    return null;
  }
}

// Creates a session by setting a secure, HTTP-only cookie.
export async function createSession(user: UserSession) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now
  const session = await encrypt(user);

  cookies().set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

// Retrieves the current user session from the cookie.
export async function getSession(): Promise<UserSession | null> {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return null;
  }
  return await decrypt(sessionCookie);
}

// Deletes the session cookie to log the user out.
export async function deleteSession() {
  cookies().set('session', '', { expires: new Date(0) });
}

// A helper function to protect routes by checking for a valid session.
// If no session is found, it redirects the user to the login page.
export async function protectedRoute() {
  const session = await getSession();
  if (!session) {
    redirect('/');
  }
  return session;
}
