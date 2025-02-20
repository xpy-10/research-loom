'use server'

import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {s} from 'json-joy/lib/json-crdt-patch';
import { PrismaClient } from '@prisma/client';
import { z, ZodError } from "zod";
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { inlineTaskFormSchema, projectFormSchema, taskFormSchema, changeTaskStatusFormSchema, taskStatusChangeManySchema, taskStatusFormSchema, taskStatusKanbanSort, documentCreationForm, documentDeleteForm } from './formValidation';
import { documentListItemType } from './types';

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

export async function createDocument(values: z.infer<typeof documentCreationForm>, pathName: string) {
    const { userId, orgId } = await auth();
    if (!userId) {
        return { success: false, message: 'Database error, invalid user' };
    }
    if (!orgId) {
        return { success: false, message: 'Error, no organization selected' };
    }
    try {
        const parsedData: z.infer<typeof documentCreationForm> = documentCreationForm.parse(values);
        const project = await prisma.project.findFirst({
            where: {
                organization: orgId as string
            },
            orderBy: {
                lastUsed: 'desc'
            }
        });
        if (project) {
            const document = prisma.document.create({
                data: {
                    title: parsedData.title,
                    contents: ModelWithExt.create(schema).toBinary(),
                    project: {
                        connect: project
                    },
                    lastUsed: new Date()
                }
            });
            revalidatePath(pathName);
            return { success: true, data: document };
        }
        return { success: false, message: 'Document creation unsuccessful' };
    }
    catch (error) {
        if (error instanceof ZodError) {
            return { success: false, message: 'validation error'};
        }
        console.log(error);
        return { success: false, message: 'Database error' };
    }
    finally {
        await prisma.$disconnect();
    };
};

export async function fetchDocuments(limit?: number) {
    const { userId, orgId } = await auth();
    if (!userId) {
        return { success: false, message: 'Database error, invalid user' }
    }
    if (!orgId) {
        return { success: false, message: 'Error, no organization selected' }
    }
    try {
        const project = await prisma.project.findFirst({
            where: {
                organization: orgId as string
            },
            orderBy: {
                lastUsed: 'desc'
            }
        });
        if (project) {
            const documents = await prisma.document.findMany({
                where: {
                    projectId: project.id
                },
                orderBy: {
                    lastUsed: 'desc'
                },
                select: {
                    id: true,
                    title: true
                }
            })
            return { success: true, data: documents };
        }
    }
    catch (error) {
        console.log(error);
        return { success: false, message: 'Database error: failed to fetch documents'}
    }
    finally {
        await prisma. $disconnect();
    };
};

export async function deleteDocument(values: z.infer<typeof documentDeleteForm>, pathName: string) {
    console.log(values)
    const { userId, orgId } = await auth();
    if (!userId) {
        return { success: false, message: 'Database error, invalid user' };
    }
    if (!orgId) {
        return { success: false, message: 'Error, no organization selected' };
    }
    try {
        const parsedData: z.infer<typeof documentDeleteForm> = documentDeleteForm.parse(values);
        const parsedPathName: string = z.string().parse(pathName);
        const project = await prisma.project.findFirst({
            where: {
                organization: orgId as string
            },
            orderBy: {
                lastUsed: 'desc'
            }
        });
        if (project) {
            const deletedDocument = prisma.document.delete({
                where: {
                    id: parsedData.id,
                    projectId: project.id
                }
            });
            revalidatePath(pathName);
            return { success: true, data: deletedDocument };
        };
        return { success: false, message: 'Error in database deleting document'}
    }
    catch (error) {
        console.log(error);
        return { success: false, message: 'Database error, failed to delete document'}
    }
}

export async function createProject(values: z.infer<typeof projectFormSchema>, pathName: string) {
    const { userId, orgId } = await auth();
    if (!userId) {
        return { success: false, message: 'Database error, invalid user' };
    }
    if (!orgId) {
        return { success: false, message: 'Error, no organization selected' };
    }
    
    try {
        const parsedData: z.infer<typeof projectFormSchema> = projectFormSchema.parse(values);
        const parsedPathName: string = z.string().parse(pathName);
        const existingProject = await prisma.project.findFirst({
            where: {
                name: parsedData.projectName,
                organization: orgId as string
            }
        })
        if (existingProject) {
            return { success: false, message: 'Project with same name already exists' };
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
            return { success: false, message: 'validation error' };
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
        return { success:false, message: `Database error, ${!userId && 'no userId'} provided` }
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
        return { success: false, message: 'Database error: failed to retrieve projects list' };
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
            return { success: false, message: 'you do not have permission to delete project' };
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
        else {
            return { success: false, message: 'deletion may have encountered error. Your credentials and permissions may have been the issue' }
        }
    }
    catch(error) {
        if (error instanceof z.ZodError) {
            console.log(error);
            return { success: false, message: 'validation error' };
        }
        console.log(error);
        return { success: false, message: 'database error' };
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
            return { success: false, message: 'you do not have permission to edit project attributes' };
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
        else {
            return { success: false, message: 'error in database editing project' }
        }
    }
    catch(error) {
        if (error instanceof z.ZodError) {
            console.log(error);
            return { success: false, message: 'validation error' };
        }
        console.log(error);
        return { success: false, message: 'database error' };
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
        return { success: false, message: 'Database error, invalid user' }
    }
    if (!orgId) {
        return { success: false, message: 'Error, no organization selected' }
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
                },
                orderBy: {
                    kanbanSort: 'asc'
                }
            })
            return { success: true, data: tasks}
        }
        else return { success: false, message: 'no tasks found' }
    }
    catch (error) {
        console.log(error);
        return { success: false, message: 'database error' };
    }
    finally {
        await prisma.$disconnect();
    }
}

export async function createTask(values: z.infer<typeof taskFormSchema>, pathName: string) {
    const { userId, orgId } = await auth();
    if (!userId) {
        return { success: false, message: 'Database error, invalid user' }
    }
    if (!orgId) {
        return { success: false, message: 'Error, no organization selected' }
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
            return { success: false, message: 'current project not found' }
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
        return { success: true, data: newTask }
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            console.log(error);
            return { success: false, message: 'validation error' };
        }
        console.log(error);
        return { success: false, message: 'database error' };
    }
    finally {
        await prisma.$disconnect();
    }
}

export async function updateTask(values: z.infer<typeof taskFormSchema>, pathName: string) {
    const { userId, orgId } = await auth();
    if (!userId) {
        return { success: false, message: 'Database error, invalid user' };
    }
    if (!orgId) {
        return { success: false, message: 'Error, no organization selected' };
    }
    try {
        const parsedData = taskFormSchema.parse(values);
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
            return { success: false, message: 'no valid project used'};
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
        };
        console.log(error);
        return { success: false, message: 'database error' };
    }
    finally {
        await prisma.$disconnect();
    }
}

export async function updateTaskInline(values: z.infer<typeof inlineTaskFormSchema>, pathName: string) {
    const { userId, orgId } = await auth();
    if (!userId) {
        return { success: false, message: 'Database error, invalid user' };
    }
    if (!orgId) {
        return { success: false, message: 'Error, no organization selected' };
    }
    try {
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
            return { success: false, message: 'no valid project used' };
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
        };
        console.log(error);
        return { success: false, message: 'database error' };
    }
    finally {
        await prisma.$disconnect();
    }
}

export async function deleteTask(values: z.infer<typeof inlineTaskFormSchema>, pathName: string) {
    const { userId, orgId } = await auth();
    if (!userId) {
        return { success: false, message: 'Database error, invalid user' };
    }
    if (!orgId) {
        return { success: false, message: 'Error, no organization selected' };
    }
    try {
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
            return { success: false, message: 'no valid project used' };
        }
        const deletedTask = await prisma.task.delete({
            where: {
                id: parsedData.id,
                projectId: currentProject.id
            },
        })
        revalidatePath(parsedPathName);
        return { success: true, data: deletedTask };
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            console.log(error);
            return { success: false, message: 'validation error' };
        };
        console.log(error);
        return { success: false, message: 'database error' };
    }
    finally {
        await prisma.$disconnect();
    }
}

export async function createTaskStatus(values: z.infer<typeof taskStatusFormSchema>, pathName: string) {
    const { userId, orgId } = await auth();
    if (!userId) {
        return { success: false, message: 'Database error, invalid user' };
    }
    if (!orgId) {
        return { success: false, message: 'Error, no organization selected' };
    }
    try {
        const parsedData = taskStatusFormSchema.parse(values);
        const parsedPathName = z.string().parse(pathName);
        const currentProject = await prisma.project.findFirst({
            where: {
                organization: orgId
            },
            orderBy: {
                lastUsed: 'desc'
            }
        });
        if (!currentProject) {
            return { success: false, message: 'no valid project used' };
        };
        const newTaskStatusLabel = await prisma.taskStatus.create({
            data: {
                label: parsedData.label,
                projectId: currentProject.id
            }
        });
        revalidatePath(parsedPathName);
        return { success: true, data: newTaskStatusLabel };
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            console.log(error);
            return { success: false, message: 'validation error' };
        };
        console.log(error);
        return { success: false, message: 'database error' };
    }
    finally {
        await prisma.$disconnect();
    }
}

export async function fetchAllTaskStatus() {
    const { userId, orgId } = await auth();
    if (!userId) {
        return { success: false, message: 'Database error, invalid user' };
    }
    if (!orgId) {
        return { success: false, message: 'Error, no organization selected' };
    }
    try {
        const currentProject = await prisma.project.findFirst({
            where: {
                organization: orgId
            },
            orderBy: {
                lastUsed: 'desc'
            }
        });
        if (!currentProject) {
            return { success: false, message: 'no valid project used' };
        };
        const taskStatusEntries = await prisma.taskStatus.findMany({
            where: {
                projectId: currentProject.id
            },
            // orderBy: {
            //     kanbanColSort: 'asc'
            // }
        });
        return { success: true, data: taskStatusEntries };
    }
    catch (error) {
        console.log(error);
        return { success: false, message: 'database error' };
    }
    finally {
        await prisma.$disconnect();
    }
}

export async function changeTaskStatus(values: z.infer<typeof changeTaskStatusFormSchema>) {
    const { userId, orgId } = await auth();
    if (!userId) {
        return { success: false, message: 'Database error, invalid user' };
    }
    if (!orgId) {
        return { success: false, message: 'Error, no organization selected' };
    }
    try {
        const parsedData = changeTaskStatusFormSchema.parse(values);
        const currentProject = await prisma.project.findFirst({
            where: {
                organization: orgId
            },
            orderBy: {
                lastUsed: 'desc'
            }
        });
        if (!currentProject) {
            return { success: false, message: 'no valid organization used'};
        };
        const editedTask = await prisma.task.update({
            where: {
                id: parsedData.taskId,
                projectId: currentProject.id
            },
            data: {
                taskStatusId: parsedData.taskLabelId
            }
        })
        return { success: true, data: editedTask }
    
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            console.log(error);
            return { success: false, message: 'validation error' };
        };
        console.log(error);
        return { success: false, message: 'database error'};
    }
    finally {
        await prisma.$disconnect();
    }
}

export async function changeTaskAttributesKanban(values: z.infer<typeof taskStatusChangeManySchema>) {
    const { userId, orgId } = await auth();
    if (!userId) {
        return { success:false, message: 'Database error, invalid user'};
    }
    if (!orgId) {
        return { success:false, message: 'Error, no organization selected'};
    }
    try {
        const parsedData = taskStatusChangeManySchema.parse(values);
        const currentProject = await prisma.project.findFirst({
            where: {
                organization: orgId
            },
            orderBy: {
                lastUsed: 'desc'
            }
        });
        if (!currentProject) {
            return { success: false, message: 'no valid organization used'};
        };
        const changedTasks = await prisma.$transaction( async (transaction) => {
            let results = [];
            for (const data of parsedData) {
                if (data.taskLabelId && data.taskLabelId >= 0) {
                    const changedTask = await transaction.task.update({
                        where: {
                            id: data.taskId
                        },
                        data: {
                            taskStatusId: data.taskLabelId,
                            kanbanSort: data.kanbanSort
                        }
                    });
                    results.push(changedTask);
                }
                else if (data.taskLabelId == -1) {
                    const changedTask = await transaction.task.update({
                        where: {
                            id: data.taskId
                        },
                        data: {
                            kanbanSort: data.kanbanSort,
                            taskStatusId: undefined,
                            taskStatus: {
                                disconnect: true
                            }
                        }
                    });
                    results.push(changedTask);
                }
            };
            return results;
        })
        return { success: true, data: changedTasks };
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            console.log(error);
            return { success: false, message: 'validation error' };
        };
        console.log(error);
        return { success: false, message: 'database error' };
    }
    finally {
        await prisma.$disconnect();
    }
}

export async function changeTaskStatusKanbanSort(values: z.infer<typeof taskStatusKanbanSort>){
    const { userId, orgId } = await auth();
    if (!userId) {
        return { success:false, message: 'Database error, invalid user'};
    }
    if (!orgId) {
        return { success:false, message: 'Error, no organization selected'};
    }
    try {
        const parsedData = taskStatusKanbanSort.parse(values);
        const currentProject = await prisma.project.findFirst({
            where: {
                organization: orgId
            },
            orderBy: {
                lastUsed: 'desc'
            }
        });
        if (!currentProject) {
            return { success: false, message: 'no valid organization used'};
        };
        const changedTasks = await prisma.$transaction( async (transaction) => {
            let results = [];
            for (const data of parsedData) {
                if (data.id == -1) continue;
            
                const changedTaskStatus = await transaction.taskStatus.update({
                    where: {
                        id: data.id,
                        projectId: currentProject.id
                    },
                    data: {
                        kanbanColSort: data.kanbanColSort
                    }
                });
              results.push(changedTaskStatus);
            };
            return results;
        })
        return { success: true, data: changedTasks };
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            console.log(error);
            return { success: false, message: 'validation error' };
        };
        console.log(error);
        return { success: false, message: 'database error' };
    }
    finally {
        await prisma.$disconnect();
    }
}