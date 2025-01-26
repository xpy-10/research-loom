'use client';
import { TableCell, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Folder, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import {
Dialog,
DialogContent,
DialogDescription,
DialogHeader,
DialogTitle,
DialogFooter
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import React, { useState } from "react";
import { deleteProject, editProject } from "@/lib/actions";
import { usePathname } from "next/navigation";
import { createProjectType } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { projectFormSchema } from "@/lib/formValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export default function ProjectTableRow({project}: {project: createProjectType}) {
    const { toast } = useToast();
    const pathname = usePathname();
    const [selection, setSelection] = useState<string|undefined>(undefined);

    const handleMenuSelection = (selectedProject: typeof project) => {
        toast({
            description: `Your project ${project.name} has been selected`
        })
    }

    const handleMenuDelete = async (selectedProject: typeof project) => {
        setSelection('delete');
        const deletedProject = await deleteProject(selectedProject.id, pathname)
        deletedProject?.success && deletedProject.data && toast({
                description: `Your project ${deletedProject.data.name} has been successfully deleted`
            })
        deletedProject?.success === false && deletedProject.message && toast({
                description: deletedProject.message
            })
    }

    const handleEditSubmit = async (values: z.infer<typeof projectFormSchema>, pathName: string) => {
        setSelection(undefined);
        const editedProject = await editProject(values, pathName)
        editedProject?.success && editedProject.data && toast({
            description: `Successfully changed project attributes`
        })
    }

    const projectForm = useForm<z.infer<typeof projectFormSchema>>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: {
            id: project.id,
            projectName: project.name,
            description: project.description
        }
    })

    return (
        <>
        <TableRow className="hover:bg-white" key={project.id}>
        <TableCell className="font-medium pl-10">{project.name}</TableCell>
        <TableCell className="text-right">{project.description}</TableCell>
        <TableCell className="flex justify-end pr-10">
            <DropdownMenu>
            <DropdownMenuTrigger>
                <MoreHorizontal className="text-sidebar-foreground/90" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Project {project.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleMenuSelection(project)}>
                    <Folder className="text-neutral-500 dark:text-neutral-400" />
                    <span>View Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelection('delete')}>
                    <Trash2 className="text-neutral-500 dark:text-neutral-400" />
                    <span>Delete Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelection('edit')}>
                    <Pencil className="text-neutral-500 dark:text-neutral-400" />
                    <span>Edit Project</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={selection==='delete'} onOpenChange={()=> setSelection(undefined)}>
            <DialogContent>
            <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
                This action cannot be undone. Are you sure you want to permanently
                delete this file from our servers? This will delete all files associated with the project as well.
            </DialogDescription>
            </DialogHeader>
            <DialogFooter>
            <Button onClick={() => handleMenuDelete(project)}>Confirm</Button>
            </DialogFooter>
            </DialogContent>
            </Dialog>

            <Dialog open={selection==='edit'} onOpenChange={()=> setSelection(undefined)}>
            <DialogContent>
            <DialogHeader>
            <DialogTitle>Enter new project attributes</DialogTitle>
            </DialogHeader>
            <Form {...projectForm}>
            <form onSubmit={projectForm.handleSubmit((values)=> handleEditSubmit(values, pathname))} className="space-y-8">
                <FormField
                control={projectForm.control}
                name="projectName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                        <Input  placeholder={project.name}{...field} />
                    </FormControl>
                    <FormDescription>
                        This is your project's name
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={projectForm.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                        <Input  placeholder={project.description}{...field} />
                    </FormControl>
                    <FormDescription>
                        Project description
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <DialogFooter>
            <Button variant="secondary" onClick={() => setSelection(undefined)}>Cancel</Button>
            <Button type="submit">Submit</Button> 
            </DialogFooter>
            </form>
            </Form>
            </DialogContent>
            </Dialog>
        </TableCell>
        </TableRow>
        </>
    )
}