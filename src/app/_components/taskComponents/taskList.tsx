'use client'
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Task } from "@prisma/client"
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import CreateTaskComponent from "./createTaskComponent";
import EditTaskComponent from "./editTaskComponent";
import TeamMemberSelector from "./teamMemberSelector";
import { updateTask, updateTaskInline } from "@/lib/actions";
import { usePathname } from "next/navigation";
import { inlineTaskFormSchema, taskFormSchema } from "@/lib/formValidation";
import { useToast } from "@/hooks/use-toast";
import { revalidatePath } from 'next/cache';
import { useOrganization } from "@clerk/nextjs";
import TeamMemberChange from "./teamMemberChange";


export default function TaskList({data}: {data: Task[]}) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({})
    const [viewTaskDialog, setViewTaskDialog] = useState(false);
    const [taskDialogData, setTaskDialogData] = useState<Task|undefined>(undefined);
    
    const columns: ColumnDef<Task>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all" 
                />
            ),
            cell: ({ row }) => (
                <Checkbox checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => {
                return (
                    <div>{row.getValue('description')}</div>
                )
            },
        },
        {
            accessorKey: 'title',
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Task Title
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div>{row.getValue('title')}</div>
        },
        {
            accessorKey: 'due_date',
            header: () => <div>Due Date</div>,
            cell: ({ row }) => {
                const date = row.getValue('due_date') as Date
                return <div>{date && date.toISOString()}</div>
            }
        },
        {
            accessorKey: 'assigned_to',
            header: () => <div>Assigned to</div>,
            cell: ({ row }) => {
                return <TeamMemberChange task={row.original}></TeamMemberChange>
            }
        },
        {
            accessorKey: 'priority',
            header: () => <div>Priority</div>,
            cell: ({ row }) => {
                const priorityStatus = row.getValue('priority');
                const bgColour = priorityStatus
                return <div>{row.getValue('priority')}</div>
            }
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const task = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="text-sidebar-foreground/90"/>
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Menu</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => console.log(task)}>
                            View Task
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {setViewTaskDialog(true); setTaskDialogData(task)}}>
                            Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log(`clicked to delete task ${task.title}`)}>
                            Delete Task
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ]
    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection
        }
    })
    return (
        <>
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input 
                    placeholder="Filter tasks"
                    value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => table.getColumn("description")?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                />
                <div className="flex ml-auto gap-4">
                <CreateTaskComponent/>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => {
                            return (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                >
                                    {column.id}
                                </DropdownMenuCheckboxItem>
                            )
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder? 
                                        null 
                                        : 
                                        flexRender(header.column.columnDef.header, header.getContext())
                                        }
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ): 
                        (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <EditTaskComponent dialogOpen={viewTaskDialog} setDialogOpen={setViewTaskDialog} currentTask={taskDialogData} setCurrentTask={setTaskDialogData}/>

        </div>
        </>
    )
}