import { getEmployees } from '@/lib/data';
import { getSession } from '@/lib/auth';
import { EmployeeTable } from '@/components/dashboard/employee-table';

// The dashboard page is a Server Component that fetches data and passes it to client components.
export default async function DashboardPage() {
  // Fetch employee data and the current user's session in parallel.
  const [employees, session] = await Promise.all([
    getEmployees(),
    getSession(),
  ]);

  // Ensure a session exists before rendering the page content.
  // The layout already protects this route, but this is an extra safeguard.
  if (!session) {
    return null; 
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-headline tracking-tight">Employee Directory</h2>
        <p className="text-muted-foreground mt-1">
          View, add, edit, and manage all employee records.
        </p>
      </div>
      {/* The EmployeeTable component handles the display and interaction with employee data. */}
      <EmployeeTable initialEmployees={employees} userRole={session.role} />
    </div>
  );
}
