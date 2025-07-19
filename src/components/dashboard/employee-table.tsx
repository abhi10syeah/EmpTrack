'use client';

import { useState } from 'react';
import type { Employee } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Edit,
  Trash2,
  PlusCircle,
  MoreHorizontal,
  Mail,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { EmployeeForm } from './employee-form';
import { deleteEmployeeAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface EmployeeTableProps {
  initialEmployees: Employee[];
  userRole: 'admin' | 'viewer';
}

export function EmployeeTable({
  initialEmployees,
  userRole,
}: EmployeeTableProps) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [isFormOpen, setFormOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const { toast } = useToast();

  const handleAdd = () => {
    setSelectedEmployee(undefined);
    setFormOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormOpen(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    
    const result = await deleteEmployeeAction(employeeToDelete.id);
    
    if (result.success) {
      setEmployees(employees.filter(e => e.id !== employeeToDelete.id));
      toast({ title: "Success", description: "Employee record deleted." });
    } else {
      toast({ variant: 'destructive', title: "Error", description: result.message });
    }
    setAlertOpen(false);
    setEmployeeToDelete(null);
  };
  
  // This function is called from the form on successful submission.
  const onFormSubmit = (updatedEmployee: Employee) => {
    if (selectedEmployee) {
      // Update existing employee
      setEmployees(employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
    } else {
      // Add new employee
      setEmployees([updatedEmployee, ...employees].sort((a,b) => a.name.localeCompare(b.name)));
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        {userRole === 'admin' && (
          <Button onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Employee
          </Button>
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Joined</TableHead>
              {userRole === 'admin' && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-sm text-muted-foreground">{employee.email}</div>
                </TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{format(new Date(employee.dateOfJoining), 'PPP')}</TableCell>
                {userRole === 'admin' && (
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(employee)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(employee)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {employees.map((employee) => (
          <Card key={employee.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{employee.name}</CardTitle>
                </div>
                {userRole === 'admin' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="-mt-2 -mr-2">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(employee)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(employee)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{employee.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.position}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <span className="pl-6">{employee.department}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {format(new Date(employee.dateOfJoining), 'PPP')}</span>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog for Add/Edit */}
      <EmployeeForm
        isOpen={isFormOpen}
        setOpen={setFormOpen}
        employee={selectedEmployee}
        onFormSubmit={onFormSubmit}
      />

      {/* Alert Dialog for Delete Confirmation */}
      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee record for <span className="font-semibold">{employeeToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
