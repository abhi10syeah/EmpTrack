import { z } from 'zod';

// Schema for login form validation.
// Ensures email is a valid format and password is not empty.
export const loginSchema = z.object({
  email: z.string().email({ message: 'A valid email is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Schema for employee form validation.
// Defines the expected types and constraints for employee data.
export const employeeSchema = z.object({
  id: z.string().optional(), // ID is optional, used for editing existing employees.
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'A valid email is required' }),
  position: z.string().min(2, { message: 'Position is required' }),
  department: z.string().min(2, { message: 'Department is required' }),
  // The date picker provides a Date object, so we validate against that.
  dateOfJoining: z.date({
    required_error: "Date of joining is required.",
  }),
});
