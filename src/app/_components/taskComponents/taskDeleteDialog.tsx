import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteTask } from "@/lib/actions";
import { Task } from "@prisma/client";
import { usePathname } from "next/navigation";

export default function TaskDeleteDialog({deleteTaskDialog, setDeleteTaskDialog, currentTask}:{deleteTaskDialog:boolean, setDeleteTaskDialog: (arg:boolean) => void, currentTask: Task|undefined}) {
    const { toast } = useToast();
    const pathname = usePathname();
    
    const handleMenuDelete = async (selectedTask: Task|undefined) => {
        setDeleteTaskDialog(false);
        if (!selectedTask) { return }
        try {
            const deletedTask = await deleteTask({id: selectedTask.id}, pathname);
            deletedTask?.success && deletedTask.data && toast({
                description: 'successfully deleted task'
            })
            deletedTask?.success === false && deletedTask.message && toast({
                description: deletedTask.message
            })
        }
        catch (error) {
            console.log(error);
        }
    }

    return (
        <>
        <Dialog open={deleteTaskDialog} onOpenChange={() => setDeleteTaskDialog(false)}>
        <DialogContent>
        <DialogHeader>
        <DialogTitle>Are you absolutely sure?</DialogTitle>
        <DialogDescription>
            This action cannot be undone. Are you sure you want to permanently
            delete this task from our servers?
        </DialogDescription>
        </DialogHeader>
        <DialogFooter>
        <Button onClick={() => handleMenuDelete(currentTask)}>Confirm</Button>
        </DialogFooter>
        </DialogContent>
        </Dialog>
        </>
    )
}