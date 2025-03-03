import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { updateTaskInline } from "@/lib/actions";
import { buttonStyle } from "@/lib/utils";
import { Task } from "@prisma/client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function CalendarDueDateSelector({task}:{task:Task}) {
    const [pickedDate, setPickedDate] = useState<Date|undefined>(task.due_date?task.due_date:undefined);
    const pathname = usePathname();
    const { toast } = useToast();
    const handleChangeDate = (value:Date|undefined) => {
        setPickedDate(value);
        updateTaskInline({id: task.id, dueDate: value}, pathname).then((response) => {
            /* eslint-disable  @typescript-eslint/no-unused-expressions */
            response.success && response.data && toast({
                description: "Successfully updated task's due date"
            });
            !response.success && response.message && toast({
                description: response.message
            });
            /* eslint-enable  @typescript-eslint/no-unused-expressions */
        }).catch((error) => {
            console.log(error);
            toast({
                description: 'Client: Error updating the task'
            })
        })

    }
    return (
        <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className={`${buttonStyle}`}>
                    {pickedDate? (
                        format(pickedDate, "PPP")
                    ): (
                        <span>{pickedDate? format(pickedDate, "PPP"): 'Pick a due date'}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 opacity-50" />
                </div>
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