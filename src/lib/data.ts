import 'server-only';
import dbConnect from './db';
import Employee, { IEmployee } from '@/models/employee';
import User, { IUser } from '@/models/user';

// The Employee type for the frontend, converting ObjectId to string.
export type Employee = {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  dateOfJoining: Date;
}

// --- User Data ---
export const findUserByEmail = async (email: string) => {
  await dbConnect();
  const user = await User.findOne({ email });
  return user;
};


// --- Employee Data ---

// A helper to serialize the employee document
const serializeEmployee = (doc: IEmployee): Employee => {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    position: doc.position,
    department: doc.department,
    dateOfJoining: doc.dateOfJoining,
  };
};

// Fetches all employees from the database.
export const getEmployees = async (): Promise<Employee[]> => {
  await dbConnect();
  const employees = await Employee.find({}).sort({ name: 1 });
  return employees.map(serializeEmployee);
};

// Creates a new employee in the database.
export const createEmployee = async (data: Omit<Employee, 'id'>): Promise<IEmployee> => {
  await dbConnect();
  const newEmployee = new Employee(data);
  await newEmployee.save();
  return newEmployee;
};

// Updates an existing employee in the database.
export const updateEmployee = async (id: string, data: Partial<Omit<Employee, 'id'>>): Promise<IEmployee | null> => {
  await dbConnect();
  const updatedEmployee = await Employee.findByIdAndUpdate(id, data, { new: true });
  return updatedEmployee;
};

// Deletes an employee from the database.
export const deleteEmployee = async (id: string): Promise<{ success: boolean }> => {
  await dbConnect();
  const result = await Employee.deleteOne({ _id: id });
  return { success: result.deletedCount > 0 };
};
