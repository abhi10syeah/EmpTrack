'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSession, deleteSession, getSession } from '@/lib/auth';
import { loginSchema, employeeSchema } from '@/lib/schemas';
import { createEmployee, updateEmployee, deleteEmployee as deleteEmployeeData, findUserByEmail } from '@/lib/data';
import { Employee } from '@/lib/data';

// Define the shape of the state returned by server actions.
type FormState = {
  success: boolean;
  message: string;
  data?: Employee;
};

// --- Authentication Actions ---

// Server action to handle user login.
export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData): Promise<{ error?: string } | undefined> {
  // Validate form data against the login schema.
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: 'Invalid email or password.' };
  }

  const { email, password } = validatedFields.data;

  // Find the user in the database.
  const user = await findUserByEmail(email);

  // Validate user existence and password.
  // In a real app, use bcrypt.compare(password, user.password).
  if (!user || user.password !== password) {
    return { error: 'Invalid email or password.' };
  }

  // Create a session for the authenticated user.
  await createSession({
    id: user._id.toString(),
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
export async function createEmployeeAction(data: z.infer<typeof employeeSchema>): Promise<FormState> {
  try {
    await adminOnly();
    
    const validatedFields = employeeSchema.safeParse(data);

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data. Please check your inputs.' };
    }

    const newEmployee = await createEmployee(validatedFields.data);
    revalidatePath('/dashboard'); // Refresh the employee list
    return { success: true, message: 'Employee created.', data: JSON.parse(JSON.stringify(newEmployee)) };
  } catch (e) {
    const error = e as Error;
    if (error.message.includes('E11000')) {
        return { success: false, message: 'An employee with this email already exists.' };
    }
    return { success: false, message: error.message };
  }
}

// Server action to update an existing employee record.
export async function updateEmployeeAction(data: z.infer<typeof employeeSchema>): Promise<FormState> {
    try {
        await adminOnly();

        const validatedFields = employeeSchema.safeParse(data);

        if (!validatedFields.success) {
            return { success: false, message: 'Invalid form data.' };
        }
        
        const { id, ...dataToUpdate } = validatedFields.data;
        if (!id) {
            return { success: false, message: 'Employee ID is missing.' };
        }
        
        const updatedEmployee = await updateEmployee(id, dataToUpdate);

        if (!updatedEmployee) {
            return { success: false, message: 'Employee not found.' };
        }

        revalidatePath('/dashboard');
        return { success: true, message: 'Employee updated.', data: JSON.parse(JSON.stringify(updatedEmployee)) };
    } catch(e) {
        const error = e as Error;
        if (error.message.includes('E11000')) {
            return { success: false, message: 'An employee with this email already exists.' };
        }
        return { success: false, message: error.message };
    }
}

// Server action to delete an employee record.
export async function deleteEmployeeAction(id: string): Promise<{ success: boolean; message?: string }> {
    try {
        await adminOnly();
        const result = await deleteEmployeeData(id);
        
        if (!result.success) {
            return { success: false, message: 'Failed to delete employee.' };
        }
        
        revalidatePath('/dashboard');
        return { success: true };
    } catch(e) {
        const error = e as Error;
        return { success: false, message: error.message };
    }
}
