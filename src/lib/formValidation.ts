import { PriorityTag } from "@prisma/client";
import {z} from "zod";

export const projectFormSchema = z.object({
    id: z.number().optional(),
    projectName: z.string().min(2, {
        message: "Name of Project must be at least 2 characters."
    }).max(50),
    description: z.string().max(250, {
        message: "Maximum of 250 characters exceeded"
    })
})

enum TaskPriority{
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH'
}

export const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH'])
export const taskPriorityEnum2 = z.nativeEnum(TaskPriority)

export const taskFormSchema = z.object({
    id: z.number().optional(),
    title: z.string().min(2, {
        message: "Must include a title at least 2 characters long."
    }).max(50),
    description: z.string().max(1000, {
        message: "Maximum of 1000 characters exceeded"
    }),
    dueDate: z.date().optional(), 
    assigned_to: z.string().optional(),
    priority: taskPriorityEnum.optional(),
})

export const inlineTaskFormSchema = z.object({
    id: z.number().optional(),
    dueDate: z.date().optional(),
    assigned_to: z.string().optional(),
    priority: taskPriorityEnum.optional(),
})

export const taskStatusFormSchema = z.object({
    label: z.string().max(25, {
        message: "Maximum of 25 characters allowed"
    }).min(1, {
        message: "Minimum of 1 character needed"
    })
})

export const changeTaskStatusFormSchema = z.object({
    taskId: z.number(),
    taskLabelId: z.number().optional(),
    kanbanSort: z.number().optional()
})

export const taskStatusChangeManySchema = z.array(changeTaskStatusFormSchema);

export const changeTaskStatusAttributesFormSchema = z.object({
    id: z.number(),
    kanbanColSort: z.number()
})

export const taskStatusKanbanSort = z.array(changeTaskStatusAttributesFormSchema)

export const documentCreationForm = z.object({
    title: z.string().max(100, {
        message: "Maximum of 100 characters allowed"
    }).min(1, {
        message: "Minimum of 1 character needed for title"
    })
})

export const documentDeleteForm = z.object({
    id: z.number(),
    title: z.string()
})