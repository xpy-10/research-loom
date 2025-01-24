'use server'

import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {s} from 'json-joy/lib/json-crdt-patch';
import { getXataClient } from '@/xata';
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
    console.log('created a project')
    const { userId, orgId } = await auth();
    
    try {
        const newProject = await prisma.project.create({
            data: {
                name: values.projectName,
                description: values.description,
                organization: orgId as string
            }
        })
        revalidatePath(pathName);
        return { success: true, data: newProject};
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





  