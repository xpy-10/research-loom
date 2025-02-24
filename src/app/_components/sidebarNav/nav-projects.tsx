'use client'
import { BriefcaseBusiness, MoreHorizontal } from "lucide-react"
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Project } from "@prisma/client";
import ProjectsDropDownSidebar from "@/app/_components/projectComponents/projectsDropDownSidebar";
import { useOrganization } from "@clerk/nextjs";
import { useEffect } from "react";

export function NavProjects({
  projects,
}: {
  projects: Project[]|undefined
}) {
  const { organization } = useOrganization();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        { organization && projects && projects.map((project) => (
          <SidebarMenuItem key={project.name}>
            <SidebarMenuButton >
              <BriefcaseBusiness />
              <span>{project.name}</span>
            </SidebarMenuButton>
            <ProjectsDropDownSidebar project={project} />
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal className="text-sidebar-foreground/70" />
            <span><a href="/projects">View/Create Projects</a></span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
