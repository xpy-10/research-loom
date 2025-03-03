'use client'

import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { documentListItemType } from "@/lib/types"
import { buttonStyleGhost } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import DocumentDeleteDialog from "./documentDeleteDialog";

export default function DocumentOptions({document}: {document: documentListItemType}) {
    const [deleteDocDialog, setDeleteDocDialog] = useState(false);
    const [viewDocDialog, setViewDocDialog] = useState(false);
    const router = useRouter();
    useEffect(() => {
        if (!viewDocDialog) return;
        if (viewDocDialog) {
            router.push(`/document/${document.id}`);
            window.location.reload();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewDocDialog]);

    return (
        <>
        <div className="z-20">
        <DropdownMenu>
        <TooltipProvider>
        <Tooltip>
        <TooltipTrigger asChild>
        <DropdownMenuTrigger asChild>
            <div className={`${buttonStyleGhost}`}>
                <MoreHorizontal className="text-sidebar-foreground/90"/>
                <span className="sr-only">Open menu</span>
            </div>
        </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
            Document options
        </TooltipContent>
        </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>Menu</DropdownMenuLabel>
            <DropdownMenuItem className="cursor-pointer" onClick={() => {setViewDocDialog(true)}}>
                <Pencil className="text-neutral-500 dark:text-neutral-400" />
                <span>View/Edit Document</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => {setDeleteDocDialog(true)}}>
                <Trash2 className="text-neutral-500 dark:text-neutral-400" />
                <span>Delete Document</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
        {/* {viewDocDialog && <QuillWriter />} */}
        <DocumentDeleteDialog deleteDocDialog={deleteDocDialog} setDeleteDocDialog={setDeleteDocDialog} document={document} />
        </div>
        </> 
    )
}