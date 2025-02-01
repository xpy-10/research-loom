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

const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH'])

export const taskFormSchema = z.object({
    id: z.number().optional(),
    title: z.string().min(2, {
        message: "Must include a title at least 2 characters long."
    }).max(50),
    description: z.string().max(1000, {
        message: "Maximum of 1000 characters exceeded"
    }),
    dueDate: z.date().optional(), 
    priority: taskPriorityEnum.optional()
})
