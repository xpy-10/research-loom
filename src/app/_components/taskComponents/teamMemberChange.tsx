'use client'
import { Task } from "@prisma/client";
import { useEffect, useState } from "react";
import TeamMemberSelector from "./teamMemberSelector";
import { updateTaskInline } from "@/lib/actions";
import { usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function TeamMemberChange({task}: {task:Task}) {
    
    const [assigneeId, setAssigneeId] = useState<string|undefined>(task.assigned_to?task.assigned_to:undefined);
    const [shouldUpdate, setShouldUpdate] = useState<boolean>(false);
    const pathname = usePathname();
    const { toast } = useToast();

    useEffect(() => {
        setShouldUpdate(true);
        const updateAssignee = async () => {
            const updatedTask = await updateTaskInline({id: task.id, assigned_to: assigneeId}, pathname)
            updatedTask?.success && updatedTask.data && toast({
                description: `${assigneeId===''?'Successfully unassigned task': 'Successfully assigned task'} `
            })
            updatedTask?.success === false && updatedTask.message && toast({
                description: updatedTask.message
            })
        };
        shouldUpdate && updateAssignee();
        return () => setShouldUpdate(false)
    }, [assigneeId])

    return (
        <>
        <div>
        <TeamMemberSelector selectedTeamMemberId={task.assigned_to} setSelectedTeamMemberId={setAssigneeId}></TeamMemberSelector>
        </div>
        </>
    )
}