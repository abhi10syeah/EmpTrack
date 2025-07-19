import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { Building2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function LoginPage() {
  // Check if the user is already logged in and redirect to dashboard if so.
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="bg-primary text-primary-foreground p-3 rounded-full mb-4">
             <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold font-headline text-center">EmpTrack Portal</h1>
          <p className="text-muted-foreground text-center mt-2">
            Sign in to manage your employee records.
          </p>
        </div>
        <LoginForm />

        <Alert className="mt-8">
          <Info className="h-4 w-4" />
          <AlertTitle>Demo Credentials</AlertTitle>
          <AlertDescription>
            <p className="mt-2">
              <strong>Admin:</strong> admin@example.com / ajax121
            </p>
            <p className="mt-1">
              <strong>Viewer:</strong> viewer@example.com / ajax121
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </main>
  );
}
