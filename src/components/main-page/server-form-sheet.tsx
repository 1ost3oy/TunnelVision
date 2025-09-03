'use client';

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import type { Server } from '@/lib/types';
import { serverSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { addServer, updateServer } from '@/app/actions';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/starwind/dialog";
import { Button } from "@/components/starwind/button";
import { Input } from "@/components/starwind/input";
import { Label } from "@/components/starwind/label";
import { Textarea } from "@/components/starwind/textarea";

type FormFieldProps = {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
};

const FormField = ({ label, id, error, children }: FormFieldProps) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error && <p className="text-sm text-error">{error}</p>}
  </div>
);


const DEFAULT_VALUES = {
  name: '',
  ipAddress: '',
  username: 'root',
  sshPort: 22,
  password: '',
  sshKey: '',
};

export function ServerFormSheet({
  open,
  onOpenChange,
  onSuccess,
  server,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  server?: Server;
}) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const isEditMode = !!server;

  const form = useForm<z.infer<typeof serverSchema>>({
    resolver: zodResolver(serverSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && server) {
        form.reset({
          ...server,
          sshPort: server.sshPort || 22,
        });
      } else {
        form.reset(DEFAULT_VALUES);
      }
    }
  }, [server, isEditMode, open, form]);

  const onSubmit = (values: z.infer<typeof serverSchema>) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          formData.append(key, String(value || ''));
        });

        const result = isEditMode
          ? await updateServer(formData, server!.id)
          : await addServer(formData);

        if (result?.errors) {
          toast({
            variant: 'destructive',
            title: `Error ${isEditMode ? 'updating' : 'adding'} server`,
            description: 'Please check the form for errors.',
          });
        } else {
          toast({
            title: `Server ${isEditMode ? 'Updated' : 'Added'}`,
            description: `The server has been ${
              isEditMode ? 'updated' : 'saved'
            } successfully.`,
          });
          onOpenChange(false);
          onSuccess();
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: `Error ${isEditMode ? 'updating' : 'adding'} server`,
          description: 'An unexpected error occurred. Please try again.',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Server' : 'Add New Server'}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 py-4"
        >
          <FormField label="Server Name" id="name" error={form.formState.errors.name?.message}>
            <Input id="name" placeholder="My Awesome Server" {...form.register("name")} />
          </FormField>

          <FormField label="IP Address" id="ipAddress" error={form.formState.errors.ipAddress?.message}>
            <Input id="ipAddress" placeholder="192.168.1.1" {...form.register("ipAddress")} />
          </FormField>
            
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Username" id="username" error={form.formState.errors.username?.message}>
              <Input id="username" placeholder="root" {...form.register("username")} />
            </FormField>
            <FormField label="SSH Port" id="sshPort" error={form.formState.errors.sshPort?.message}>
              <Input id="sshPort" type="number" placeholder="22" {...form.register("sshPort")} />
            </FormField>
          </div>
          
          <FormField label="Password (Optional)" id="password" error={form.formState.errors.password?.message}>
            <Input id="password" type="password" {...form.register("password")} />
          </FormField>

          <FormField label="SSH Key (Optional)" id="sshKey" error={form.formState.errors.sshKey?.message}>
            <Textarea id="sshKey" placeholder="-----BEGIN OPENSSH PRIVATE KEY-----" {...form.register("sshKey")} />
          </FormField>
          
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                `Save ${isEditMode ? 'Changes' : 'Server'}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
