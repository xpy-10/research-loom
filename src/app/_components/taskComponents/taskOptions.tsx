'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { buttonStyleGhost } from "@/lib/utils";
import { Task } from "@prisma/client";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import EditTaskComponent from "./editTaskComponent";
import TaskDeleteDialog from "./taskDeleteDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

type taskOptionsType = {
    task: Task,
    onTaskModify?: (arg: boolean) => void
}
export default function TaskOptions({task, onTaskModify}: taskOptionsType) {
    const [viewTaskDialog, setViewTaskDialog] = useState(false);
    const [deleteTaskDialog, setDeleteTaskDialog] = useState(false);
    useEffect(() => {
        (!viewTaskDialog || !deleteTaskDialog) && onTaskModify && onTaskModify(true);
    }, [viewTaskDialog, deleteTaskDialog]);

    return (
        <>
        <DropdownMenu>
        <TooltipProvider>
        <Tooltip>
        <TooltipTrigger asChild>
        <DropdownMenuTrigger asChild>
            <div className={`${buttonStyleGhost}`}>
                <MoreHorizontal className="text-sidebar-foreground/90"/>
                <span className="sr-only">Open menu</span>
            </div>
        </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
            Task options
        </TooltipContent>
        </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>Menu</DropdownMenuLabel>
            <DropdownMenuItem className="cursor-pointer" onClick={() => {setViewTaskDialog(true)}}>
                <Pencil className="text-neutral-500 dark:text-neutral-400" />
                <span>View/Edit Task</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => {setDeleteTaskDialog(true)}}>
                <Trash2 className="text-neutral-500 dark:text-neutral-400" />
                <span>Delete Task</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
        <EditTaskComponent dialogOpen={viewTaskDialog} setDialogOpen={setViewTaskDialog} currentTask={task}/>
        <TaskDeleteDialog deleteTaskDialog={deleteTaskDialog} setDeleteTaskDialog={setDeleteTaskDialog} currentTask={task} />
        </>
    )
}