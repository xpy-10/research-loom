import { useToast } from "@/hooks/use-toast";
import { updateTaskInline } from "@/lib/actions";
import { PriorityTag, Task } from "@prisma/client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import TaskPrioritySelector from "./taskPrioritySelector";

export default function TaskPriorityChange({task}:{task:Task}) {
    const [selectedPriority, setSelectedPriority] = useState<PriorityTag>(task.priority)
    const pathname = usePathname();
    const { toast } = useToast();

    const handleChange = async (tag:PriorityTag) => {
        setSelectedPriority(tag);
        try {
            const updatedTask = await updateTaskInline({id: task.id, priority: tag}, pathname);
            /* eslint-disable @typescript-eslint/no-unused-expressions */
            updatedTask?.success && updatedTask.data && toast({
                description: `Successfully updated priority to ${tag}`
            });
            updatedTask?.success === false && updatedTask.message && toast({
                description: `Update in task priority unsuccessful`
            })
            /* eslint-enable @typescript-eslint/no-unused-expressions */
        }
        catch (error) {
            console.log(error);
            toast({
                description: 'Update in priority task unsuccessful'
            })
        }
    };
    return (
        <>
        <TaskPrioritySelector priorityValue={selectedPriority} onValueChange={handleChange} />
        </>
    )
}