'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Task, TaskStatus } from "@prisma/client";
import { ChevronDown, ChevronRight,  } from "lucide-react"
import { useState } from "react";
import CreateTaskStatusComponent from "./createTaskStatusComponent";
import { buttonStyle } from "@/lib/utils";
import { changeTaskStatus } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

export default function SelectTaskStatusComponent({task, taskStatusLabels}:{task: Task, taskStatusLabels:TaskStatus[]|undefined}) {
    const [openDropDown, setOpenDropdown] = useState(false);
    const taskStatusId = task.taskStatusId;
    const taskLabel = taskStatusId && taskStatusLabels?.find((label) => label.id=== taskStatusId)
    const [taskStatusVal, setTaskStatusVal] = useState(taskLabel);
    const { toast } = useToast();

    const handleStatusChange = async (taskLabel: TaskStatus|undefined) => {
        setTaskStatusVal(taskLabel);
        if (taskLabel) {
            const args = { taskId: task.id, taskLabelId: taskLabel.id};
            const selectedTaskStatus = changeTaskStatus(args)
            selectedTaskStatus.then((response) => {
                /* eslint-disable  @typescript-eslint/no-unused-expressions */
                response.success && response.data && toast({
                    description: `task ${response.data.title}'s status changed` 
                });
                !response.success && response.message && toast({
                    description: "error updating the task"
                })
                /* eslint-enable  @typescript-eslint/no-unused-expressions */
            }).catch((error) => {
                console.log(error);
                toast({
                    description: "error with database operation"
                })
            })
        }
    }

    return (
        <>
        <DropdownMenu open={openDropDown} onOpenChange={() => {setOpenDropdown(!openDropDown)}}>
        <DropdownMenuTrigger >
            <div className={`${buttonStyle}`} >
                
                <span>{taskStatusVal? taskStatusVal.label: 'No Label'}</span>
                { openDropDown?
                <ChevronDown />
                :
                <ChevronRight /> } 
            </div>
        </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Choose a label</DropdownMenuLabel>
                { taskStatusLabels?.map((label) => {
                    return (
                        <DropdownMenuItem onClick={() => handleStatusChange(label)} key={label.id}>
                            <span>{label.label}</span>
                        </DropdownMenuItem>
                    )
                })}
                <DropdownMenuLabel>
                    <CreateTaskStatusComponent/>
                </DropdownMenuLabel>
            </DropdownMenuContent>
        </DropdownMenu>
        </>
    )
}