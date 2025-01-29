'use client'

import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast";
import { createProjectType } from "@/lib/types";
import { Folder, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { useState } from "react";
import ProjectsDialogs from "./projectsDialogs";
import { useProject } from "@/lib/actions";

export default function ProjectsDropDownMenu({project}: {project: createProjectType}) {
    const { toast } = useToast();
    const [selection, setSelection] = useState<string|undefined>(undefined);
    
    const handleMenuSelection = async (selectedProject: typeof project) => {
        const returnedProject = await useProject(selectedProject.id);
        console.log(returnedProject.data);
        toast({
            description: `Your project ${selectedProject.name} has been selected`
        })
    }
 

    return (
        <>
        <DropdownMenu>
        <DropdownMenuTrigger>
        <MoreHorizontal className="text-sidebar-foreground/90"/>
        <span className="sr-only">More</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
        <DropdownMenuLabel>Project {project.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleMenuSelection(project)}>
            <Folder className="text-neutral-500 dark:text-neutral-400" />
            <span>View Project</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSelection('edit')}>
            <Pencil className="text-neutral-500 dark:text-neutral-400" />
            <span>Edit Project</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSelection('delete')}>
            <Trash2 className="text-neutral-500 dark:text-neutral-400" />
            <span>Delete Project</span>
        </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
        <ProjectsDialogs project={project} setSelection={setSelection} selection={selection} />
        </>
    )
}