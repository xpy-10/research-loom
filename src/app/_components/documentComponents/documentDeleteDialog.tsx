import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteDocument } from "@/lib/actions";
import { documentListItemType } from "@/lib/types";
import { usePathname } from "next/navigation";

export default function DocumentDeleteDialog({deleteDocDialog, setDeleteDocDialog, document}:{deleteDocDialog:boolean, setDeleteDocDialog: (arg:boolean) => void, document: documentListItemType}) {
    const { toast } = useToast();
    const pathname = usePathname();
    const handleMenuDelete = (document: documentListItemType|undefined) => {
        setDeleteDocDialog(false);
        if (!document) { return };
        console.log(document)
        deleteDocument(document, pathname).then((response) => {
            response.success && response.data && toast({
                description: 'Successfully deleted document'
            });
            !response.success && response.message && toast({
                description: response.message
            });
        }).catch((error) => {
            console.log(error);
            toast({
                description: 'Client: Error deleting document'
            })
        });

    }
    return (
        <>
        <Dialog open={deleteDocDialog} onOpenChange={() => setDeleteDocDialog(false)}>
        <DialogContent>
        <DialogHeader>
        <DialogTitle>Are you absolutely sure?</DialogTitle>
        <DialogDescription>
            This action cannot be undone. Are you sure you want to permanently
            delete this document {document && document.title} from our servers?
        </DialogDescription>
        </DialogHeader>
        <DialogFooter>
        <Button onClick={() => handleMenuDelete(document)}>Confirm</Button>
        </DialogFooter>
        </DialogContent>
        </Dialog>
        </>
    )
}