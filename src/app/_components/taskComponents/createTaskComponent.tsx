'use client'
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createTask } from "@/lib/actions";
import { taskFormSchema } from "@/lib/formValidation";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import TeamMemberSelector from "./teamMemberSelector";

export default function CreateTaskComponent({onSuccess}:{onSuccess?: (arg:boolean) => void }) {
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const pathname = usePathname();
    const { toast } = useToast();
    const taskForm = useForm<z.infer<typeof taskFormSchema>>({
        resolver: zodResolver(taskFormSchema),
        defaultValues: {
            title: "",
            description: "",
        }
    })
    const handleCreateTask = (values: z.infer<typeof taskFormSchema>, pathName: string) => {
        setDialogOpen(false);
        createTask(values, pathName).then((response) => {
            response.success && response.data && toast({
                description: `Successfully created new task with title ${response.data.title}`
            });
            response.success && onSuccess && onSuccess(true);
            !response.success && response.message && toast({
                description: response.message
            });
        })
    }

    return (
        <>
        <Button data-cy={`add-task-button`} onClick={() => setDialogOpen(true)}>Add Task</Button>
        <Dialog open={dialogOpen===true} onOpenChange={() => setDialogOpen(false)}>
            <DialogContent>
            <DialogHeader>
            <DialogDescription>
                Dialog to create a new task
            </DialogDescription>
            <DialogTitle>Create Task Form</DialogTitle>
            <Form {...taskForm}>
            <form onSubmit={taskForm.handleSubmit((values) => handleCreateTask(values, pathname))} className="space-y-8">
                <FormField
                control={taskForm.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Task Title</FormLabel>
                        <FormControl>
                            <Input data-cy={'add-task-form-title'} placeholder='...task title'{...field} />
                        </FormControl>
                        <FormDescription>
                            This is your task's Title
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={taskForm.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Task Details</FormLabel>
                        <FormControl>
                            <Textarea data-cy={'add-task-form-details'} placeholder='...task details'{...field} />
                        </FormControl>
                        <FormDescription>
                            This is your task's details
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <FormField 
                control={taskForm.control}
                name="assigned_to"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Assigned to </FormLabel>
                        <FormControl>
                        <TeamMemberSelector selectedTeamMemberId={field.value} setSelectedTeamMemberId={field.onChange} {...field}/>
                        </FormControl>
                    </FormItem>
                )}
                />
                <FormField
                control={taskForm.control}
                name="dueDate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Due date </FormLabel>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <FormControl>
                            <Button variant={'outline'} className={cn("w-[[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value? (
                                    format(field.value, "PPP")
                                ): (
                                    <span>Pick a due date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-auto p-0 z-50" align="start">
                            <div className="bg-white rounded border border-black">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </div>
                        </DropdownMenuContent>
                        </DropdownMenu>
                        <FormDescription>
                            You can optionally select a due date for the task
                        </FormDescription>
                    </FormItem>
                )}
                />
                <DialogFooter>
                    <Button data-cy={'add-task-form-submit'} type='submit'>Submit</Button>
                </DialogFooter>
            </form>
            </Form>
            </DialogHeader>
            </DialogContent>

        </Dialog>
        </>
    )
}