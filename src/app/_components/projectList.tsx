import { fetchProjects } from "@/lib/actions";
import {
    Table,
    TableBody,
    TableCaption,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import ProjectTableRow from "./projectTableRow";

export default async function ProjectList() {
    const projects = await fetchProjects();

    return (
        <div className="w-full">
            <Table>
            <TableCaption>A list of your projects.</TableCaption>
            <TableHeader>
                <TableRow>
                <TableHead className="pl-10">Project Name</TableHead>
                <TableHead className="text-right">Project Description</TableHead>
                <TableHead className="flex justify-end pr-10">Edit</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
            {   
                projects && projects.data?.map(value => {
                    return (
                        <ProjectTableRow key={value.id} project={value} />
                    )
                })
            }
            </TableBody>
            </Table>
        </div>
    )
}