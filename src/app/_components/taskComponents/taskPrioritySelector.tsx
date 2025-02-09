'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PriorityTag } from "@prisma/client";
import { taskPriorityEnum } from "@/lib/formValidation";
import { buttonStyle } from "@/lib/utils";

export default function TaskPrioritySelector({priorityValue, onValueChange}:{priorityValue: PriorityTag, onValueChange:(tag:PriorityTag) => void}) {
        const priorityVariants = PriorityTag;
    return ( 
        <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className={`${buttonStyle}`}>
                    {priorityValue}
                </div>
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