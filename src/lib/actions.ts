'use server'

import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {s} from 'json-joy/lib/json-crdt-patch'
import { getXataClient } from '@/xata';
import { PrismaClient } from '@prisma/client'
import { z } from "zod";

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

export async function createProject(values: z.infer<typeof formSchema>) {
    console.log('created a project')
    
    async function main() {
        await prisma.project.create({
            data: {
                name: values.projectName,
                description: values.description
            }
        })
        console.log('made connection to prisma')
      }

    main()
      .then(async () => {
        await prisma.$disconnect()
      })
      .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
      })
    return
}

  