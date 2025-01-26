'use server'

import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {s} from 'json-joy/lib/json-crdt-patch';
import { PrismaClient } from '@prisma/client';
import { z } from "zod";
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

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

const formSchema = z.object({
    projectName: z.string().min(2, {
        message: "Name of Project must be at least 2 characters."
    }).max(50),
    description: z.string().max(250, {
        message: "Maximum of 250 characters exceeded"
    })
})

export async function createProject(values: z.infer<typeof formSchema>, pathName: string) {
    const { userId, orgId } = await auth();
    
    try {
        const existingProject = await prisma.project.findFirst({
            where: {
                name: values.projectName
            }
        })
        if (existingProject) {
            return { success: false, message: 'Project with same name already exists'}
        }
        if (!userId){
            return { success: false, message: 'Problem with authorization, please make sure you are logged in'}
        }
        else {
            const newProject = await prisma.project.create({
                data: {
                    name: values.projectName,
                    description: values.description,
                    organization: orgId as string,
                    owner: userId
                }
            })
            revalidatePath(pathName);
            return { success: true, data: newProject};
        }
      }
    catch (error) {
        console.error(error)
        return { success: false, message: 'Database error; failed to create project.'}
      }
    finally {
        await prisma.$disconnect();
    }
}

export async function fetchProjects() {
    const { userId, orgId } = await auth();

    try {
        const projects = await prisma.project.findMany({
            where: {
                organization: orgId as string
            }
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
        const project = await prisma.project.findUnique({
            where: {
                id: projectId
            }
        })
        if (project && project.owner !== userId) {
            return { success: false, message: 'you do not have permission to delete project'}
        }
        else if (project && project.owner === userId) {
            const deletedProject = await prisma.project.delete({
                where: {
                    id: projectId
                }
            })
            revalidatePath(pathName);
            return { success: true, data: deletedProject };
        }
    }
    catch(error) {
        console.log(error);
        return { success: false, message: `database error`}
    }
    finally {
        await prisma.$disconnect();
    }
}

export async function editProject(projectId: number, values: z.infer<typeof formSchema>, pathName: string) {
    const { userId, orgId } = await auth();

    try {
        const existingProject = await prisma.project.findFirst({
            where: {
                id: projectId
            }
        })
        if (existingProject && existingProject.owner !== userId) {
            return { success: false, message: 'you do not have permission to edit project attributes'}
        }
        else if (existingProject && existingProject.owner === userId) {
            const editedProject = await prisma.project.update({
                where: {
                    id: projectId
                },
                data: {
                    name: values.projectName,
                    description: values.description
                }
            })
            revalidatePath(pathName);
            return { success: true, data: editedProject };
        }
    }
    catch(error) {
        console.log(error);
        return { success: false, message: `database error`}
    }
    finally {
        await prisma.$disconnect();
    }
}





  