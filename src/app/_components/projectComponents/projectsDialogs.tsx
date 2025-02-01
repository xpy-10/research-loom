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
        const editedProject = await editProject(values, pathName);
        editedProject?.success && editedProject.data && toast({
            description: `Successfully changed project attributes`
        })
        editedProject?.success === false && editedProject.message && toast({
            description: editedProject.message
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
        </>
    )
}