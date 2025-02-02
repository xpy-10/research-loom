'use server'

import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {s} from 'json-joy/lib/json-crdt-patch';
import { Prisma, PrismaClient } from '@prisma/client';
import { z } from "zod";
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { inlineTaskFormSchema, projectFormSchema, taskFormSchema } from './formValidation';

const prisma = new PrismaClient();

const schema = s.obj({
    document: s.obj({
        text: ext.quill.new('')
    })
})

const model = ModelWithExt.create(schema);

export async function retrieveDocument() {
    return model.toBinary();
}

export async function createProject(values: z.infer<typeof projectFormSchema>, pathName: string) {
    const { userId, orgId } = await auth();
    
    try {
        const parsedData: z.infer<typeof projectFormSchema> = projectFormSchema.parse(values);
        const parsedPathName: string = z.string().parse(pathName);
        const existingProject = await prisma.project.findFirst({
            where: {
                name: parsedData.projectName
            }
        })
        if (existingProject) {
            return { success: false, message: 'Project with same name already exists'};
        }
        if (!userId){
            return { success: false, message: 'Problem with authorization, please make sure you are logged in'};
        }
        const newProject = await prisma.project.create({
            data: {
                name: parsedData.projectName,
                description: parsedData.description,
                organization: orgId as string,
                owner: userId,
                lastUsed: new Date()
            }
        })
        revalidatePath(parsedPathName);
        return { success: true, data: newProject};
      }
    catch (error) {
        if (error instanceof z.ZodError) {
            console.log(error)
            return { success: false, message: 'validation error'};
        }
        console.error(error)
        return { success: false, message: 'Database error; failed to create project.'};
      }
    finally {
        await prisma.$disconnect();
    }
}

export async function fetchProjects(limit?: number) {
    const { userId, orgId } = await auth();
    
    if (!userId) {
        return { success:false, message: `Database error, ${!userId && 'no userId'} provided`}
    }

    try {
        const projects = await prisma.project.findMany({
            where: {
                organization: orgId as string
            },
            orderBy: {
                lastUsed: 'desc'
            },
            ...(limit !== undefined && {take: limit})
            
        })
        return { success: true, data: projects };
    }
    catch(error) {
        console.log(error);
        return { success: false, message: 'Database error: failed to retrieve projects list'};
    }
    finally {
        await prisma.$disconnect();
    }
}

export async function deleteProject(projectId: number, pathName: string) {
    const { userId, orgId } = await auth();

    try {
        const parsedProjectId: number = z.number().parse(projectId);
        const parsedPathName: string = z.string().parse(pathName);

        const project = await prisma.project.findUnique({
            where: {
                id: projectId
            }
        })
        if (project && project.owner !== userId) {
            return { success: false, message: 'you do not have permission to delete project'};
        }
        else if (project && project.owner === userId) {
            const deletedProject = await prisma.project.delete({
                where: {
                    id: projectId
                }
            })
            revalidatePath(parsedPathName);
            return { success: true, data: deletedProject };
        }
    }
    catch(error) {
        if (error instanceof z.ZodError) {
            console.log(error);
            return { success: false, message: 'validation error'};
        }
        console.log(error);
        return { success: false, message: 'database error'};
    }
    finally {
        await prisma.$disconnect();
    }
}

export async function editProject(values: z.infer<typeof projectFormSchema>, pathName: string) {
    const { userId, orgId } = await auth();
    try {
        const parsedData: z.infer<typeof projectFormSchema> = projectFormSchema.parse(values)
        const parsedPathName:string = z.string().parse(pathName);
        
        const existingProject = await prisma.project.findFirst({
            where: {
                id: parsedData.id
            }
        })
        if (existingProject && existingProject.owner !== userId) {
            return { success: false, message: 'you do not have permission to edit project attributes'};
        }
        else if (existingProject && existingProject.owner === userId) {
            const editedProject = await prisma.project.update({
                where: {
                    id: parsedData.id
                },
                data: {
                    name: parsedData.projectName,
                    description: parsedData.description
                }
            })
            revalidatePath(parsedPathName);
            return { success: true, data: editedProject };
        }
    }
    catch(error) {
        if (error instanceof z.ZodError) {
            console.log(error);
            return { success: false, message: 'validation error'};
        }
        console.log(error);
        return { success: false, message: 'database error'};
    }
    finally {
        await prisma.$disconnect();
    }
}

export async function useProject(projectId: number) {
    const { userId, orgId } = await auth();
    try {
        const parsedId = z.number().parse(projectId)
        const project = await prisma.project.update({
            where: {
                id: parsedId
            }, 
            data: {
                lastUsed: new Date()
            }
        })
        return { success: true, data: project };
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            console.log(error);
            return { success: false, message: 'validation error' };
        }
        console.log(error);
        return { success: false, message: 'database error' };
    }
}

export async function fetchTasks() {
    const { userId, orgId } = await auth();
    if (!userId) {
        return { success:false, message: 'Database error, invalid user'}
    }
    if (!orgId) {
        return { success:false, message: 'Error, no organization selected'}
    }
    try {
        const project = await prisma.project.findFirst({
            where: {
                organization: orgId,
            },
            orderBy: {
                lastUsed: 'desc'
            }
        })
        if (project) {
            const tasks = await prisma.task.findMany({
                where: {
                    projectId: project.id
                }
            })
            return { success: true, data: tasks}
        }
    }
    catch (error) {
        console.log(error);
        return { success: false, message: 'database error'};
    }
    finally {
        await prisma.$disconnect();
    }
}

export async function createTask(values: z.infer<typeof taskFormSchema>, pathName: string) {
    const { userId, orgId } = await auth();
    if (!userId) {
        return { success:false, message: 'Database error, invalid user'}
    }
    if (!orgId) {
        return { success:false, message: 'Error, no organization selected'}
    }
    try {
        const parsedData: z.infer<typeof taskFormSchema> = taskFormSchema.parse(values);
        const parsedPathName: string = z.string().parse(pathName);
        const currentProject = await prisma.project.findFirst({
            where: {
                organization: orgId
            },
            orderBy: {
                lastUsed: 'desc'
            }
        })
        if (!currentProject) {
            return { success: false, message: 'current project not found'}
        }
        const newTask = await prisma.task.create({
            data: {
                title: parsedData.title,
                description: parsedData.description,
                projectId: currentProject.id,
                due_date: parsedData.dueDate,
                priority: parsedData.priority
            }
        })
        revalidatePath(parsedPathName);
        console.log(newTask);
        return { success: true, data: newTask }
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            console.log(error);
            return { success: false, message: 'validation error'};
        }
        console.log(error);
        return { success: false, message: 'database error'};
    }
    finally {
        await prisma.$disconnect();
    }
}

export async function updateTask(values: z.infer<typeof taskFormSchema>, pathName: string) {
    const { userId, orgId } = await auth();
    if (!userId) {
        return { success:false, message: 'Database error, invalid user'};
    }
    if (!orgId) {
        return { success:false, message: 'Error, no organization selected'};
    }
    try {
        const parsedData = taskFormSchema.parse(values);
        const parsedPathName = z.string().parse(pathName);
        console.log(parsedData);
        const currentProject = await prisma.project.findFirst({
            where: {
                organization: orgId
            },
            orderBy: {
                lastUsed: 'desc'
            }
        })
        if (!currentProject) {
            return { success: false, message: 'no valid organization used'};
        }
        const updatedTask = await prisma.task.update({
            where: {
                id: parsedData.id,
                projectId: currentProject.id
            },
            data: {
                title: parsedData.title,
                description: parsedData.description,
                due_date: parsedData.dueDate,
                priority: parsedData.priority,
                assigned_to: parsedData.assigned_to
            }
        })
        revalidatePath(parsedPathName);
        return { success: true, data: updatedTask };
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            console.log(error);
            return { success: false, message: 'validation error' };
        }
    }
    finally {
        await prisma.$disconnect();
    }
}

export async function updateTaskInline(values: z.infer<typeof inlineTaskFormSchema>, pathName: string) {
    const { userId, orgId } = await auth();
    if (!userId) {
        return { success:false, message: 'Database error, invalid user'};
    }
    if (!orgId) {
        return { success:false, message: 'Error, no organization selected'};
    }
    try {
        console.log(values);
        const parsedData = inlineTaskFormSchema.parse(values);
        const parsedPathName = z.string().parse(pathName);
        const currentProject = await prisma.project.findFirst({
            where: {
                organization: orgId
            },
            orderBy: {
                lastUsed: 'desc'
            }
        })
        if (!currentProject) {
            return { success: false, message: 'no valid organization used'};
        }
        const updatedTask = await prisma.task.update({
            where: {
                id: parsedData.id,
                projectId: currentProject.id
            },
            data: {
                due_date: parsedData.dueDate,
                assigned_to: parsedData.assigned_to,
                priority: parsedData.priority
            }
        })
        revalidatePath(parsedPathName);
        return { success: true, data: updatedTask };
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            console.log(error);
            return { success: false, message: 'validation error' };
        }
    }
    finally {
        await prisma.$disconnect();
    }
}




  