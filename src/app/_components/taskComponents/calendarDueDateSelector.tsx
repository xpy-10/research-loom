import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { updateTaskInline } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { Task } from "@prisma/client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function CalendarDueDateSelector({task}:{task:Task}) {
    const [pickedDate, setPickedDate] = useState<Date|undefined>(task.due_date?task.due_date:undefined);
    const pathname = usePathname();
    const { toast } = useToast();
    const handleChangeDate = async (value:Date|undefined) => {
        setPickedDate(value);
        try {
            const updatedTask = await updateTaskInline({id: task.id, dueDate: value}, pathname);
            updatedTask?.success && updatedTask.data && toast({
                description: `Successfully updated task's due date`
            })
            updatedTask?.success === false && updatedTask?.message && toast({
                description: 'Error updating the task'
            })
        }
        catch (error) {
            console.log(error);
        }

    }
    return (
        <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={'outline'} className={cn("w-[[240px] pl-3 text-left font-normal", !pickedDate && "text-muted-foreground")}>
                    {pickedDate? (
                        format(pickedDate, "PPP")
                    ): (
                        <span>{pickedDate? format(pickedDate, "PPP"): 'Pick a due date'}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto p-0 z-50" align="start">
                <div className="bg-white rounded border border-black">
                <Calendar mode="single" selected={pickedDate?pickedDate:undefined} onSelect={(value) => {handleChangeDate(value)}} initialFocus />
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
        </>
    )
}