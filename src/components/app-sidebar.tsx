"use client"

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { useOrganizationList } from '@clerk/nextjs';
import { fetchProjects } from "@/lib/actions";
import { Project } from '@prisma/client';


const data = {
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
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
  projects: Project[]
}

type SideBarPropsCustom = React.ComponentProps<typeof Sidebar> & additionalProps

export function AppSidebar({ projects, ...props }: SideBarPropsCustom) {
  
  const userMembershipsParams = {
    memberships: {
      pageSize: 5,
      keepPreviousData: true,
    },
  }
  const { isLoaded, userMemberships } = useOrganizationList({
    userMemberships: userMembershipsParams,
  })
  
  type teamType = {
    name: string
  }
  
  let teams:teamType[] = [{name: 'Personal Workspace'}];
  if (isLoaded) {
    userMemberships.data.map((membership) => {
      teams.push({name: membership.organization.name})
    })
  }
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {
          projects && <NavProjects projects={projects} />
        }
      </SidebarContent>
      <SidebarFooter>
        <UserButton/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
