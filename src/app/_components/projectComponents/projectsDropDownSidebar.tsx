'use client'
import { createProjectType } from "@/lib/types";
import { DropdownMenuItem, DropdownMenuSeparator, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast";
import { Folder, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { useState } from "react";
import ProjectsDialogs from "./projectsDialogs";
import { SidebarMenuAction } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";

export default function ProjectsDropDownSidebar({project}:{project:createProjectType}) {
    
    const { isMobile } = useSidebar();
    const { toast } = useToast();
    const [selection, setSelection] = useState<string|undefined>(undefined);

    const handleMenuSelection = (selectedProject: typeof project) => {
        toast({
            description: `Your project ${selectedProject.name} has been selected`
        })
    }
    return (
        <>
        <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={() => handleMenuSelection(project)}>
                  <Folder className="text-neutral-500 dark:text-neutral-400" />
                  <span>View Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelection('edit')}>
                  <Pencil className="text-neutral-500 dark:text-neutral-400" />
                  <span>Edit Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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