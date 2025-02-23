"use client"
import { BookOpen, Bot, Settings2, SquareTerminal } from "lucide-react";
import { NavMain } from "@/app/_components/sidebarNav/nav-main";
import { NavProjects } from "@/app/_components/sidebarNav/nav-projects";
import { Sidebar ,SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Project } from '@prisma/client';

const data = {
  navMain: [
    {
      title: "Task Management",
      url: "",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Task List",
          url: "/tasks",
        },
        {
          title: "Kanban Board",
          url: "/kanban",
        },
        {
          title: "Gantt Chart",
          url: "",
        }
      ],
    },

    {
      title: "Documents",
      url: "",
      icon: BookOpen,
      items: [
        {
          title: "Current Documents",
          url: "document",
        },
        {
          title: "Create New",
          url: "document",
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
        <OrganizationSwitcher />
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
