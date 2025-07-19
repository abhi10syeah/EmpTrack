'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  employee?: Employee;
  onFormSubmit: (employee: Employee) => void;
}

export function EmployeeForm({ isOpen, setOpen, employee, onFormSubmit }: EmployeeFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!employee;

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

  // Populate the form with employee data when in edit mode or reset it.
  useEffect(() => {
    if (isOpen) {
      setError(null); // Clear previous errors when dialog opens
      if (isEditMode && employee) {
        form.reset({
          id: employee.id,
          name: employee.name,
          email: employee.email,
          position: employee.position,
          department: employee.department,
          dateOfJoining: new Date(employee.dateOfJoining),
        });
      } else {
        form.reset({
          id: undefined,
          name: '',
          email: '',
          position: '',
          department: '',
          dateOfJoining: undefined,
        });
      }
    }
  }, [employee, isEditMode, form, isOpen]);
  
  const onSubmit = form.handleSubmit((data) => {
    setError(null); // Clear previous errors on new submission
    startTransition(async () => {
      const action = isEditMode ? updateEmployeeAction : createEmployeeAction;
      const result = await action(data);

      if (result.success && result.data) {
        toast({
          title: `Success: Employee ${isEditMode ? 'Updated' : 'Created'}`,
          description: `The record for ${result.data.name} has been saved.`,
        });
        onFormSubmit(result.data);
        setOpen(false);
      } else {
        setError(result.message);
      }
    });
  });

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
          <form onSubmit={onSubmit}>
            <div className="space-y-4 py-4">
               {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>An error occurred</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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
              <Button type="submit" disabled={isPending}>
                 {isPending ? 'Saving...' : isEditMode ? 'Save Changes' : 'Save Employee'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
