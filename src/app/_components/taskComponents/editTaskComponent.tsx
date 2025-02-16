'use client'
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { taskFormSchema, taskPriorityEnum } from "@/lib/formValidation";
import { buttonStyle } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { usePathname } from "next/navigation";
import { updateTask } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Task } from "@prisma/client"
import TeamMemberSelector from "./teamMemberSelector";
import TaskPrioritySelector from "./taskPrioritySelector";


export default function EditTaskComponent({dialogOpen, setDialogOpen, currentTask, setCurrentTask}: {dialogOpen: boolean, setDialogOpen: (arg:boolean) => void, currentTask: Task|undefined, setCurrentTask: (arg:Task|undefined) => void}) {
    
    if (!currentTask){
        return (<></>)
    }

    const pathname = usePathname();
    const { toast } = useToast();
    const taskForm = useForm<z.infer<typeof taskFormSchema>>({
            resolver: zodResolver(taskFormSchema),
            defaultValues: {
                id: currentTask.id,
                title: currentTask.title,
                description: currentTask.description,
                dueDate: currentTask.due_date? new Date(currentTask.due_date): undefined,
                priority: taskPriorityEnum.parse(currentTask.priority)
            }
        })

    const handleSubmit = (values: z.infer<typeof taskFormSchema>, pathName: string) => {
        setDialogOpen(false);
        updateTask(values, pathName).then((response) => {
            response.success && response.data && toast({
                description: `Successfully updated task with title ${response.data.title}`
            });
            !response.success && response.message && toast({
                description: response.message
            });
        }).catch((error) => {
            console.log(error);
            toast({
                description: `Client: Error updating task with title ${values.title}`
            })
        })
    }

    return (
        <>
        <Dialog open={dialogOpen===true} onOpenChange={() => {setDialogOpen(false); setCurrentTask(undefined)}}>
            <DialogContent>
            <DialogHeader>
            <DialogDescription>
                Dialog to create a new task
            </DialogDescription>
            <DialogTitle>Create Task Form</DialogTitle>
            <Form {...taskForm}>
            <form onSubmit={taskForm.handleSubmit((values) => handleSubmit(values, pathname))} className="space-y-8">
                <FormField
                control={taskForm.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Task Title</FormLabel>
                        <FormControl>
                            <Input placeholder={currentTask.title}{...field} />
                        </FormControl>
                        <FormDescription>
                            This is your project's Title
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
                            <Textarea placeholder={currentTask.description}{...field} />
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
                name="priority"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Priority </FormLabel>
                        <FormControl>
                        <TaskPrioritySelector priorityValue={currentTask.priority} onValueChange={field.onChange}{...field}/>
                        </FormControl>
                        <FormDescription>
                            You can select a priority for the task
                        </FormDescription>
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
                            <div className={`${buttonStyle}`}>
                                {field.value? (
                                    format(field.value, "PPP")
                                ): (
                                    <span>{currentTask.due_date? format(currentTask.due_date, "PPP"): 'Pick a due date'}</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 opacity-50" />

                            </div>
                        </FormControl>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-auto p-0 z-50" align="start">
                            <div className="bg-white rounded border border-black">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange}{...field} initialFocus />
                            </div>
                        </DropdownMenuContent>
                        </DropdownMenu>
                        <FormDescription>
                            You can optionally select a due date for the task
                        </FormDescription>
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
                        <TeamMemberSelector selectedTeamMemberId={currentTask.assigned_to} setSelectedTeamMemberId={field.onChange} {...field}/>
                        </FormControl>
                        <FormDescription>
                            You can assign a team member to this task
                        </FormDescription>
                    </FormItem>
                )}
                />
                <DialogFooter>
                    <Button type='submit'>Submit</Button>
                </DialogFooter>
            </form>
            </Form>
            </DialogHeader>
            </DialogContent>

        </Dialog>
        </>
    )
}