'use client'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { deleteProject, editProject } from "@/lib/actions";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { projectFormSchema } from "@/lib/formValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";

export default function ProjectsDialogs({project, setSelection, selection}: {project: createProjectType, setSelection:(str:string|undefined)=>void, selection: string|undefined}) {
    const pathname = usePathname();
    const { toast } = useToast();
    const projectForm = useForm<z.infer<typeof projectFormSchema>>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: {
            id: project.id,
            projectName: project.name,
            description: project.description
        }
    })
    const handleMenuDelete = async (selectedProject: typeof project) => {
        setSelection('delete');
        deleteProject(selectedProject.id, pathname).then((response) => {
            /* eslint-disable  @typescript-eslint/no-unused-expressions */
            response.success && response.data && toast({
                description: `Your project ${response.data.name} has been successfully deleted`
            });
            !response.success && response.message && toast({
                description: response.message
            });
            /* eslint-enable  @typescript-eslint/no-unused-expressions */
        }).catch((error) => {
            console.log(error);
            toast({
                description: 'Client: Deletion of project encountered error'
            });
        })
    }

    const handleEditSubmit = (values: z.infer<typeof projectFormSchema>, pathName: string) => {
        setSelection(undefined);
        editProject(values, pathName).then((response) => {
            /* eslint-disable @typescript-eslint/no-unused-expressions */
            response.success && response.data && toast({
                description: 'Successfully changed project attributes'
            });
            !response.success && response.message && toast({
                description: response.message
            });
            /* eslint-enable @typescript-eslint/no-unused-expressions */
        }).catch((error) => {
            console.log(error);
            toast({
                description: 'Client: Unable to edit project'
            })
        })
    }
    return (
        <>
        <Dialog open={selection==='delete'} onOpenChange={() => setSelection(undefined)}>
        <DialogContent>
        <DialogHeader>
        <DialogTitle>Are you absolutely sure?</DialogTitle>
        <DialogDescription>
            This action cannot be undone. Are you sure you want to permanently
            delete this file from our servers? This will delete all files associated with the project as well.
        </DialogDescription>
        </DialogHeader>
        <DialogFooter>
        <Button data-cy={`delete-project-dialog-confirm-${project.name}`} onClick={() => handleMenuDelete(project)}>Confirm</Button>
        </DialogFooter>
        </DialogContent>
        </Dialog>

        <Dialog open={selection==='edit'} onOpenChange={()=> setSelection(undefined)}>
        <DialogContent data-cy={`edit-project-dialog-${project.name}`}>
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
                    <Input  data-cy={`edit-project-name-input-${project.name}`} placeholder={project.name}{...field} />
                </FormControl>
                <FormDescription>
                    This is your project&apos;s name
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
                    <Input  data-cy={`edit-project-description-input-${project.name}`} placeholder={project.description}{...field} />
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
        <Button data-cy={`edit-project-submit-${project.name}`} type="submit">Submit</Button> 
        </DialogFooter>
        </form>
        </Form>
        </DialogContent>
        </Dialog>
        </>
    )
}