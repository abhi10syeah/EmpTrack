import { protectedRoute } from '@/lib/auth';
import Header from '@/components/dashboard/header';

// This layout component serves as a protected route for the dashboard area.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // `protectedRoute` checks for a valid session. If none exists, it redirects to the login page.
  // If a session exists, it returns the user session data.
  const session = await protectedRoute();

  return (
    <div className="flex flex-col min-h-screen">
      {/* The header receives the user session to display user-specific information. */}
      <Header user={session} />
      <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
