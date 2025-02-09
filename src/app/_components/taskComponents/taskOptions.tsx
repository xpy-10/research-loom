import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { buttonStyleGhost } from "@/lib/utils";
import { Task } from "@prisma/client";
import { Folder, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export default function TaskOptions({task, setViewTaskDialog, setTaskDialogData, setDeleteTaskDialog}:{task:Task, setViewTaskDialog: (arg:boolean) => void, setTaskDialogData: (arg:Task) => void, setDeleteTaskDialog: (arg:boolean) => void}) {

    return (
        <>
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <div className={`${buttonStyleGhost}`}>
                <MoreHorizontal className="text-sidebar-foreground/90"/>
                <span className="sr-only">Open menu</span>
            </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>Menu</DropdownMenuLabel>
            <DropdownMenuItem className="cursor-pointer" onClick={() => {setViewTaskDialog(true); setTaskDialogData(task)}}>
                <Pencil className="text-neutral-500 dark:text-neutral-400" />
                <span>View/Edit Task</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => {setDeleteTaskDialog(true); setTaskDialogData(task)}}>
                <Trash2 className="text-neutral-500 dark:text-neutral-400" />
                <span>Delete Task</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
        </>
    )
}