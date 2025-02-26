import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteTask } from "@/lib/actions";
import { Task } from "@prisma/client";
import { usePathname } from "next/navigation";

export default function TaskDeleteDialog({deleteTaskDialog, setDeleteTaskDialog, currentTask, onTaskDelete}:{deleteTaskDialog:boolean, setDeleteTaskDialog: (arg:boolean) => void, currentTask: Task|undefined, onTaskDelete?: (arg: Task|undefined) => void }) {
    const { toast } = useToast();
    const pathname = usePathname();
    
    const handleMenuDelete = (selectedTask: Task|undefined) => {
        setDeleteTaskDialog(false);
        if (!selectedTask) { return };
        deleteTask({id: selectedTask.id}, pathname).then((response) => {
            response.success && response.data && toast({
                description: 'Successfully deleted task'
            });
            response.success && response.data && onTaskDelete && onTaskDelete(response.data);
            !response.success && response.message && toast({
                description: response.message
            });
        }).catch((error) => {
            console.log(error);
            toast({
                description: 'Client: Error deleting task'
            })
        });
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