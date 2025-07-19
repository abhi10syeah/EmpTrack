// This file simulates a database for employee records.
// In a real application, this would be replaced with a database connection (e.g., MongoDB with Mongoose).

export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  dateOfJoining: Date;
}

// Initial mock data for employees.
let employees: Employee[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice.j@example.com', position: 'Software Engineer', department: 'Technology', dateOfJoining: new Date('2022-08-15') },
  { id: '2', name: 'Bob Williams', email: 'bob.w@example.com', position: 'Project Manager', department: 'Management', dateOfJoining: new Date('2021-03-20') },
  { id: '3', name: 'Charlie Brown', email: 'charlie.b@example.com', position: 'UX Designer', department: 'Design', dateOfJoining: new Date('2023-01-10') },
  { id: '4', name: 'Diana Miller', email: 'diana.m@example.com', position: 'HR Specialist', department: 'Human Resources', dateOfJoining: new Date('2020-11-05') },
  { id: '5', name: 'Ethan Davis', email: 'ethan.d@example.com', position: 'Marketing Head', department: 'Marketing', dateOfJoining: new Date('2019-07-22') },
  { id: '6', name: 'Fiona Garcia', email: 'fiona.g@example.com', position: 'DevOps Engineer', department: 'Technology', dateOfJoining: new Date('2023-05-30') },
];

// Simulates fetching all employees from the database.
export const getEmployees = async (): Promise<Employee[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return employees.sort((a, b) => a.name.localeCompare(b.name));
};

// Simulates creating a new employee in the database.
export const createEmployee = async (data: Omit<Employee, 'id'>): Promise<Employee> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newEmployee: Employee = {
    id: (Math.max(...employees.map(e => parseInt(e.id, 10))) + 1).toString(),
    ...data,
  };
  employees.push(newEmployee);
  return newEmployee;
};

// Simulates updating an existing employee in the database.
export const updateEmployee = async (id: string, data: Partial<Omit<Employee, 'id'>>): Promise<Employee | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = employees.findIndex(e => e.id === id);
  if (index !== -1) {
    employees[index] = { ...employees[index], ...data };
    return employees[index];
  }
  return null;
};

// Simulates deleting an employee from the database.
export const deleteEmployee = async (id: string): Promise<{ success: boolean }> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const initialLength = employees.length;
  employees = employees.filter(e => e.id !== id);
  return { success: employees.length < initialLength };
};
