'use client';
import { TableCell, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import React from "react";

export default function ProjectTableRow({project}: {project: {id:number, name:string, description:string}}) {
    const { toast } = useToast();
    const handleRowSelection = (selectedProject: typeof project) => {
        console.log(selectedProject);
        toast({
            description: `You have chosen project ${selectedProject.name}`
        })
    }

    return (
        <>
        <TableRow className="cursor-pointer" onClick={() => handleRowSelection(project)} key={project.id}>
        <TableCell className="font-medium">{project.name}</TableCell>
        <TableCell className="text-right">{project.description}</TableCell>
        </TableRow>
        </>
    )
}