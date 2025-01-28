'use client'
import { TableCell, TableRow } from "@/components/ui/table";
import { createProjectType } from "@/lib/types";
import ProjectsDropDownMenu from "./projectsDropDownMenu";
import { useOrganization } from "@clerk/nextjs";

export default function ProjectTableRow({project}: {project: createProjectType}) {
    const { organization } = useOrganization();
    
    const tableEntry = organization ? (
        <>
        <TableRow className="hover:bg-white" key={project.id}>
        <TableCell className="font-medium pl-10">{project.name}</TableCell>
        <TableCell className="text-right">{project.description}</TableCell>
        <TableCell className="flex justify-end pr-10">
            <ProjectsDropDownMenu project={project}/>
        </TableCell>
        </TableRow>
        </>
    ) : (
        <></>
    )
    return tableEntry;
}