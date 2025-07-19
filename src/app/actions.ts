'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSession, deleteSession, getSession } from '@/lib/auth';
import { loginSchema, employeeSchema } from '@/lib/schemas';
import { MOCK_USERS } from '@/lib/users';
import { createEmployee, updateEmployee, deleteEmployee as deleteEmployeeData } from '@/lib/data';

// Define the shape of the state returned by server actions.
type FormState = {
  success?: boolean;
  error?: string;
  data?: unknown;
} | undefined;

// --- Authentication Actions ---

// Server action to handle user login.
export async function loginAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  // Validate form data against the login schema.
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: 'Invalid email or password.' };
  }

  const { email, password } = validatedFields.data;

  // Find the user in the mock database. In a real app, you'd query a database.
  const user = MOCK_USERS.find((u) => u.email === email);

  // Validate user existence and password.
  // In a real app, use bcrypt.compare(password, user.password).
  if (!user || user.password !== password) {
    return { error: 'Invalid email or password.' };
  }

  // Create a session for the authenticated user.
  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  // Redirect to the dashboard upon successful login.
  redirect('/dashboard');
}

// Server action to handle user logout.
export async function logoutAction() {
  await deleteSession();
  redirect('/');
}


// --- Employee CRUD Actions ---

// A helper function to ensure only admins can perform certain actions.
async function adminOnly() {
    const session = await getSession();
    if (session?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required.');
    }
    return session;
}

// Server action to create a new employee record.
export async function createEmployeeAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    await adminOnly();
    
    // Convert FormData to a plain object.
    const formObject = Object.fromEntries(formData.entries());
    
    // Manually create a Date object for dateOfJoining.
    const validatedFields = employeeSchema.safeParse({
        ...formObject,
        dateOfJoining: new Date(formObject.dateOfJoining as string),
    });

    if (!validatedFields.success) {
        return { error: 'Invalid form data. Please check your inputs.' };
    }

    const newEmployee = await createEmployee(validatedFields.data);
    revalidatePath('/dashboard'); // Refresh the employee list
    return { success: true, data: newEmployee };
  } catch (e) {
    const error = e as Error;
    return { error: error.message };
  }
}

// Server action to update an existing employee record.
export async function updateEmployeeAction(_prevState: FormState, formData: FormData): Promise<FormState> {
    try {
        await adminOnly();

        const formObject = Object.fromEntries(formData.entries());
         const validatedFields = employeeSchema.safeParse({
            ...formObject,
            dateOfJoining: new Date(formObject.dateOfJoining as string),
        });

        if (!validatedFields.success) {
            return { error: 'Invalid form data.' };
        }
        
        const { id, ...dataToUpdate } = validatedFields.data;
        if (!id) {
            return { error: 'Employee ID is missing.' };
        }
        
        const updatedEmployee = await updateEmployee(id, dataToUpdate);
        revalidatePath('/dashboard');
        return { success: true, data: updatedEmployee };
    } catch(e) {
        const error = e as Error;
        return { error: error.message };
    }
}

// Server action to delete an employee record.
export async function deleteEmployeeAction(id: string): Promise<FormState> {
    try {
        await adminOnly();
        const result = await deleteEmployeeData(id);
        
        if (!result.success) {
            return { error: 'Failed to delete employee.' };
        }
        
        revalidatePath('/dashboard');
        return { success: true };
    } catch(e) {
        const error = e as Error;
        return { error: error.message };
    }
}
