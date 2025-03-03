"use client"
import { BookOpen, Bot, Settings2, SquareTerminal } from "lucide-react";
import { NavMain } from "@/app/_components/sidebarNav/nav-main";
import { NavProjects } from "@/app/_components/sidebarNav/nav-projects";
import { Sidebar ,SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import { Project } from '@prisma/client';

const data = {
  navMain: [
    {
      title: "Task Management",
      url: "",
      icon: SquareTerminal,
      isActive: true,
      dataCy: "task-management",
      items: [
        {
          title: "Task List",
          url: "/tasks",
          dataCy: "task-list"
        },
        {
          title: "Kanban Board",
          url: "/kanban",
          dataCy: "kanban-board"
        },
      ],
    },

    {
      title: "Documents",
      url: "",
      icon: BookOpen,
      dataCy: "documents",
      items: [
        {
          title: "View/Create Documents",
          url: "/document",
          dataCY: "view/create-documents"
        },
      ],
    },
  ],
}

interface additionalProps {
  projects: Project[]|undefined
}

type SideBarPropsCustom = React.ComponentProps<typeof Sidebar> & additionalProps

export function AppSidebar({ projects, ...props }: SideBarPropsCustom) {

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <UserButton/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
