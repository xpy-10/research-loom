"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import { createProject } from "@/lib/actions";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";


const formSchema = z.object({
    projectName: z.string().min(2, {
        message: "Name of Project must be at least 2 characters."
    }).max(50),
    description: z.string().max(250, {
        message: "Maximum of 250 characters exceeded"
    })
})

type projectType_db = {
    success: boolean,
    data?: {
        description: string;
        id: number;
        name: string;
        organization: string;
    },
    message?: string;
} 
export default function CreateProject() {
    const [value, setValue] = useState<projectType_db>();
    const { toast } = useToast();
    const path = usePathname();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            projectName: '',
            description: ''
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const returnedProject = await createProject(values, path);
        setValue(returnedProject);
        toast({
            title: `${returnedProject.success?'Successful':'Unsuccessful'}`,
            description: `${returnedProject.success?returnedProject.data && returnedProject.data.name + ' has been created':
                returnedProject.message
            }`
        })
    }

    return (
    <>
    <div className="w-1/2">
    <Card>
    <CardHeader>
        <CardTitle>Create a Project</CardTitle>
        <CardDescription>Fill in the form below to initiate a new project</CardDescription>
    </CardHeader>
    <CardContent>
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                    <Input  {...field} />
                </FormControl>
                <FormDescription>
                    This is your project's name
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Project Description</FormLabel>
                <FormControl>
                    <Input  {...field} />
                </FormControl>
                <FormDescription>
                    Project description
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
            <CardFooter>
                <Button type="submit">Submit</Button> 
            </CardFooter>
        </form>
    </Form>
    </CardContent>
    </Card>
    </div>
    </>
        
    )
}