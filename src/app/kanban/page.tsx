'use client'
import { fetchAllTaskStatus, fetchTasks } from "@/lib/actions";
import CreateTaskStatusComponent from "../_components/taskStatusComponents/createTaskStatusComponent";
import { KanbanBoard } from "../_components/KanbanComponents/kanbanBoard";
import CreateTaskComponent from "../_components/taskComponents/createTaskComponent";
import { useCallback, useEffect, useState } from "react";
import { Task, TaskStatus } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";

export default function Kanban() {
    const [taskStatusLabels, setTaskStatusLabels] = useState<TaskStatus[]>();
    const [taskList, setTaskList] = useState<Task[]>();
    const [shouldRefreshLabels, setShouldRefreshLabels] = useState(false);
    const [shouldRefreshTasks, setShouldRefreshTasks] = useState(false);
    const [updateKanban, setUpdateKanban] = useState(false);
    const { toast } = useToast();

    const refreshLabels = useCallback(() => {
        fetchAllTaskStatus().then((response) => {
            response.success && response.data && setTaskStatusLabels(response.data);
            response.success && setUpdateKanban(true);
            !response.success && response.message && toast({
                description: 'Unable to refresh task status list'
            });
        }).catch((error) => {
            console.log(error);
            toast({
                description: 'Client: Error fetching updated task status list'
            })
        })
    }, []);

    const refreshTasks = useCallback(() => {
        fetchTasks().then((response) => {
            response.success && response.data && setTaskList(response.data);
            response.success && setUpdateKanban(true);
            !response.success && response.message && toast({
                description: 'Unable to refresh tasks'
            });
        }).catch((error) => {
            console.log(error);
            toast({
                description: 'Client: Error fetching updated tasks'
            })
        })
    }, []);

    useEffect(() => {
        refreshLabels();
        refreshTasks();
    }, [refreshLabels, refreshTasks])


    useEffect(() => {
        shouldRefreshLabels && refreshLabels();
        setShouldRefreshLabels(false);
    }, [shouldRefreshLabels]);

    useEffect(() => {
        shouldRefreshTasks && refreshTasks();
        setShouldRefreshTasks(false);
    }, [shouldRefreshTasks])

    const canRender = taskStatusLabels && taskList;

    return ( 
        <>
        <div className="flex gap-4 p-2">
            <CreateTaskComponent onSuccess={setShouldRefreshTasks} />
            <CreateTaskStatusComponent onSuccess={setShouldRefreshLabels}/>
        </div>
        <div className="flex justify-start px-4">
        { canRender && <KanbanBoard updateKanban={updateKanban} setUpdateKanban={setUpdateKanban} taskStatusLabels={taskStatusLabels} taskList={taskList} onTaskModify={setShouldRefreshTasks}/>}
        </div>
        </>
    )
}