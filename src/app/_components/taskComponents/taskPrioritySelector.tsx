'use client'
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { PriorityTag, Task } from "@prisma/client";
import { taskPriorityEnum } from "@/lib/formValidation";

export default function TaskPrioritySelector({priorityValue, onValueChange}:{priorityValue: PriorityTag, onValueChange:(tag:PriorityTag) => void}) {
        const priorityVariants = PriorityTag;
    return ( 
        <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={'outline'} className={cn("w-[[240px] pl-3 text-left font-normal")}>
                    {priorityValue}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto p-0 z-50" align="start">
            <DropdownMenuLabel>Priority</DropdownMenuLabel>
            <DropdownMenuSeparator/>
            <DropdownMenuRadioGroup value={priorityValue}></DropdownMenuRadioGroup>
                { Object.entries(priorityVariants).map(([key, val]) => {
                    return (
                        <DropdownMenuRadioItem key={key} value={val} onClick={() => {onValueChange(taskPriorityEnum.parse(val))}}>
                            {val}
                        </DropdownMenuRadioItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
        </>
    )
}