'use client';
import { TableCell, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import {
Dialog,
DialogContent,
DialogDescription,
DialogHeader,
DialogTitle,
DialogTrigger,
DialogFooter
} from "@/components/ui/dialog";
import React, { useState } from "react";
import { deleteProject } from "@/lib/actions";
import { usePathname } from "next/navigation";

export default function ProjectTableRow({project}: {project: {id:number, name:string, description:string}}) {
    const { toast } = useToast();
    const pathname = usePathname();
    const [selection, setSelection] = useState<string|undefined>(undefined);

    const handleMenuSelection = (selectedProject: typeof project) => {
        console.log(selectedProject);
        toast({
            description: `Your project ${project.name} has been selected`
        })
    }

    const handleMenuDelete = async (selectedProject: typeof project) => {
        console.log('delete', selectedProject);
        setSelection('delete');
        const deletedProject = await deleteProject(selectedProject.id, pathname)
        if (deletedProject?.success && deletedProject.data) {
            toast({
                description: `Your project ${deletedProject.data.name} has been successfully deleted`
            })
        }
    }

    const handleMenuEdit = (selectedProject: typeof project) => {
        console.log('edit', selectedProject);
    }

    return (
        <>
        <TableRow className="hover:bg-white" key={project.id}>
        <TableCell className="font-medium pl-10">{project.name}</TableCell>
        <TableCell className="text-right">{project.description}</TableCell>
        <TableCell className="flex justify-end pr-10">
            <Dialog>
            <DropdownMenu>
            <DropdownMenuTrigger>
                <MoreHorizontal className="text-sidebar-foreground/90" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Project {project.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleMenuSelection(project)}>Select</DropdownMenuItem>
                <DialogTrigger>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuItem onClick={() => handleMenuEdit(project)}>Edit</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent>
            <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
                This action cannot be undone. Are you sure you want to permanently
                delete this file from our servers? This will delete all files associated with the project as well.
            </DialogDescription>
            </DialogHeader>
            <DialogFooter>
            <Button onClick={() => handleMenuDelete(project)}>Confirm</Button>
            </DialogFooter>
        </DialogContent>
            </Dialog>
        </TableCell>
        </TableRow>
        </>
    )
}