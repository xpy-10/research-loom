import { TableCell, TableRow } from "@/components/ui/table";
import { createProjectType } from "@/lib/types";
import ProjectsDropDownMenu from "./projectsDropDownMenu";

export default function ProjectTableRow({project}: {project: createProjectType}) {
    return (
        <>
        <TableRow className="hover:bg-white" key={project.id}>
        <TableCell className="font-medium pl-10">{project.name}</TableCell>
        <TableCell className="text-right">{project.description}</TableCell>
        <TableCell className="flex justify-end pr-10">
            <ProjectsDropDownMenu project={project}/>
        </TableCell>
        </TableRow>
        </>
    )
}