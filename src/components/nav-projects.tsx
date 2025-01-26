import {
  Folder,
  Forward,
  MoreHorizontal,
  Pencil,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Project } from "@prisma/client"
import ProjectsDialogs from "@/app/_components/projectComponents/projectsDialogs"
import ProjectsDropDownSidebar from "@/app/_components/projectComponents/projectsDropDownSidebar"

export function NavProjects({
  projects,
}: {
  projects: Project[]
}) {
  const { isMobile } = useSidebar()

  const handleMenuSelection = (selectedProject: Project) => {
    console.log(selectedProject);
  }

  const handleEditSubmit = () => {
    console.log('edit');
  }

  const handleMenuDelete = (selectedProject: Project) => {
    console.log('delete');
  }



  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((project) => (
          <SidebarMenuItem key={project.name}>
            <SidebarMenuButton asChild>
              <span>{project.name}</span>
            </SidebarMenuButton>
            <ProjectsDropDownSidebar project={project} />
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal className="text-sidebar-foreground/70" />
            <span><a href="/projects">Create New</a></span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
