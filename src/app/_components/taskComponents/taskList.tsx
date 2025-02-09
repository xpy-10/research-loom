'use client'
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PriorityTag, Task, TaskStatus } from "@prisma/client"
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import CreateTaskComponent from "./createTaskComponent";
import EditTaskComponent from "./editTaskComponent";
import TeamMemberChange from "./teamMemberChange";
import CalendarDueDateSelector from "./calendarDueDateSelector";
import TaskPriorityChange from "./taskPriorityChange";
import TaskOptions from "./taskOptions";
import TaskDeleteDialog from "./taskDeleteDialog";
import CreateTaskStatusComponent from "../taskStatusComponents/createTaskStatusComponent";
import SelectTaskStatusComponent from "../taskStatusComponents/selectTaskStatusComponent";


export default function TaskList({data, taskStatus}: {data: Task[], taskStatus: TaskStatus[]}) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({})
    const [viewTaskDialog, setViewTaskDialog] = useState(false);
    const [deleteTaskDialog, setDeleteTaskDialog] = useState(false);
    const [taskDialogData, setTaskDialogData] = useState<Task|undefined>(undefined);
    
    const columns: ColumnDef<Task >[] = [
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
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Description
                        <ArrowUpDown />
                    </Button>
                )
            },
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
            accessorKey: 'status',
            header: ({ column })=> {
                return (
                    <>Task Status</>
                )
            },
            cell: ({ row }) => {
                const task = row.original
                return (
                    <>
                    <SelectTaskStatusComponent task={task} taskStatusLabels={taskStatus}/>
                    </>
                )
            }
        },
        {
            accessorKey: 'priority',
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Priority
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const task = row.original;
                return <TaskPriorityChange task={task}/>
            },
            sortingFn: (rowA: any, rowB: any, columnId: any): number => {
                const tag1 = rowA.getValue(columnId);
                const tag2 = rowB.getValue(columnId);
                const tag1Number = tag1 === PriorityTag.HIGH?3:tag1 === PriorityTag.MEDIUM?2:tag1 === PriorityTag.LOW?1:1;
                const tag2Number = tag2 === PriorityTag.HIGH?3:tag2 === PriorityTag.MEDIUM?2:tag2 === PriorityTag.LOW?1:1;
                if (tag1Number > tag2Number) {
                    return -1;
                }
                else if (tag1Number < tag2Number) {
                    return 1;
                }
                return 0;
            }
        },
        {
            accessorKey: 'due_date',
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Due Date
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const task = row.original;
                return <CalendarDueDateSelector task={task} />
            }
        },
        {
            accessorKey: 'assigned_to',
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Assigned to
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => {
                return <TeamMemberChange task={row.original} />
            }
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const task = row.original;
                return (
                   <TaskOptions task={task} setViewTaskDialog={setViewTaskDialog} setTaskDialogData={setTaskDialogData} setDeleteTaskDialog={setDeleteTaskDialog} />
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
                <CreateTaskComponent />
                <CreateTaskStatusComponent />
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
            <TaskDeleteDialog deleteTaskDialog={deleteTaskDialog} setDeleteTaskDialog={setDeleteTaskDialog} currentTask={taskDialogData} />
        </div>
        </>
    )
}