"use client"
import { BookOpen, Bot, Settings2, SquareTerminal } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { Sidebar ,SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Project } from '@prisma/client';

const data = {
  navMain: [
    {
      title: "Task Management",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Task List",
          url: "/tasks",
        },
        {
          title: "Kanban Board",
          url: "#",
        },
        {
          title: "Gantt Chart",
          url: "#",
        }
      ],
    },

    {
      title: "Documents",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Current Documents",
          url: "#",
        },
        {
          title: "Create New",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
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
