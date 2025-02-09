'use client'
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createTaskStatus } from "@/lib/actions";
import { taskStatusFormSchema } from "@/lib/formValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function CreateTaskStatusComponent() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const pathname = usePathname();
    const { toast } = useToast();
    const taskStatusForm = useForm<z.infer<typeof taskStatusFormSchema>>({
        resolver: zodResolver(taskStatusFormSchema),
        defaultValues: {
            label: ''
        }
    })
    const handleCreateSubmit = async (values: z.infer<typeof taskStatusFormSchema>, pathName: string) => {
        try {
            const newTaskLabel = await createTaskStatus(values, pathName);
            newTaskLabel.success && newTaskLabel.data && toast({
                description: 'New task label successfully created'
            })
            newTaskLabel.success === false && newTaskLabel.message && toast({
                description: 'Unsuccessful in creating new label'
            })
        }
        catch (error) {
            console.log(error);
            toast({
                description: 'Unable to create new label'
            });
        }
    }

    return (
        <>
        <Button onClick={() => setDialogOpen(true)}>Add Task Status</Button>
        <Dialog open={dialogOpen} onOpenChange={() => setDialogOpen(false)}>
            <DialogContent>
            <DialogHeader>
            <DialogTitle>Create a new task status label</DialogTitle>
            </DialogHeader>
            <DialogDescription>This creates a tag available for use in your Kanban board</DialogDescription>
            <Form {...taskStatusForm}>
                <form onSubmit={taskStatusForm.handleSubmit((values) => handleCreateSubmit(values, pathname))}>
                    <FormField
                    control={taskStatusForm.control}
                    name="label"
                    render={({field}) => (
                        <FormItem>
                        <FormLabel>Task Status Label</FormLabel>
                        <FormControl>
                            <Input placeholder='custom label'{...field} />
                        </FormControl>
                        <FormDescription>
                            This creates a new label to be used on tasks on the Kanban Board
                        </FormDescription>
                        </FormItem>
                    )}
                    />
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button type='submit' onClick={() => setDialogOpen(false)}>Submit</Button>
                    </DialogFooter>
                </form>
            </Form>
            </DialogContent>
        </Dialog>
        </>
    )
}