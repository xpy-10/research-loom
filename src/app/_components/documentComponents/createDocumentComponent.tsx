'use client'
import { Button } from "@/components/ui/button";
import { createDocument } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { documentCreationForm } from "@/lib/formValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function CreateDocumentComponent() {
    const [dialogOpen , setDialogOpen] = useState(false);
    const { toast } = useToast();
    const pathname = usePathname();
    const form = useForm<z.infer<typeof documentCreationForm>>({
        resolver: zodResolver(documentCreationForm),
        defaultValues: {
            title: ''
        }
    })
    const handleSubmit = (values: z.infer<typeof documentCreationForm>, pathName: string) => {
        createDocument(values, pathName).then((response) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            response.success && response.data && toast({
                description: 'Successfully created document'
            })
        })
    }

    return (
        <>
        <div>
        <Button onClick={() => setDialogOpen(true)}>Create Document</Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create a Document</DialogTitle>
                <DialogDescription>Fill out form below and Submit to create a document</DialogDescription>
            </DialogHeader>
        <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => {handleSubmit(values, pathname); setDialogOpen(false)})} className="space-y-8">
            <FormField
            control={form.control}
            name="title"
            render={({field}) => (
                <FormItem>
                <FormLabel>Document Title</FormLabel>
                <FormControl>
                    <Input {...field} />
                </FormControl>
                <FormDescription>
                    Give a title to your document
                </FormDescription>
                </FormItem>
            )}
            >
            </FormField>
        <DialogFooter>
          <Button type="submit">Submit</Button>
        </DialogFooter>
        </form>
        </Form>
        </DialogContent>
        </Dialog>
        </div>
        </>
    )
}