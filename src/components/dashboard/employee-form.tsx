'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { employeeSchema } from '@/lib/schemas';
import type { Employee } from '@/lib/data';
import { createEmployeeAction, updateEmployeeAction } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  employee?: Employee;
  onFormSubmit: (employee: Employee) => void;
}

export function EmployeeForm({ isOpen, setOpen, employee, onFormSubmit }: EmployeeFormProps) {
  const { toast } = useToast();
  const isEditMode = !!employee;

  // Choose the appropriate server action based on whether we are editing or creating.
  const action = isEditMode ? updateEmployeeAction : createEmployeeAction;
  const [state, formAction] = useFormState(action, undefined);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      id: undefined,
      name: '',
      email: '',
      position: '',
      department: '',
      dateOfJoining: undefined,
    },
  });

  // Populate the form with employee data when in edit mode.
  useEffect(() => {
    if (isEditMode && employee) {
      form.reset({
        id: employee.id,
        name: employee.name,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        dateOfJoining: employee.dateOfJoining,
      });
    } else {
      form.reset();
    }
  }, [employee, isEditMode, form, isOpen]);

  // Handle the response from the server action.
  useEffect(() => {
    if (state?.success && state.data) {
      toast({
        title: `Success: Employee ${isEditMode ? 'Updated' : 'Created'}`,
        description: `The record for ${state.data.name} has been saved.`,
      });
      onFormSubmit(state.data as Employee);
      setOpen(false);
    } else if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.error,
      });
    }
  }, [state, isEditMode, setOpen, onFormSubmit, toast]);
  
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the employee's details below." : "Fill in the details for the new employee."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form action={formAction}>
            <div className="space-y-4 py-4">
              {/* Hidden input for employee ID in edit mode */}
              {isEditMode && <input type="hidden" {...form.register('id')} />}

              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="john.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="position" render={({ field }) => (
                <FormItem><FormLabel>Position</FormLabel><FormControl><Input placeholder="Software Engineer" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="department" render={({ field }) => (
                <FormItem><FormLabel>Department</FormLabel><FormControl><Input placeholder="Technology" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="dateOfJoining" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Date of Joining</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Employee'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
