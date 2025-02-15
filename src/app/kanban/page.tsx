'use client'
import { fetchAllTaskStatus, fetchTasks } from "@/lib/actions";
import CreateTaskStatusComponent from "../_components/taskStatusComponents/createTaskStatusComponent";
import { KanbanBoard } from "../_components/KanbanComponents/kanbanBoard";
import CreateTaskComponent from "../_components/taskComponents/createTaskComponent";
import { useCallback, useEffect, useState } from "react";
import { Task, TaskStatus } from "@prisma/client";

export default function Kanban() {
    const [taskStatusLabels, setTaskStatusLabels] = useState<TaskStatus[]>();
    const [taskList, setTaskList] = useState<Task[]>();
    const [shouldRefreshLabels, setShouldRefreshLabels] = useState(false);
    const [shouldRefreshTasks, setShouldRefreshTasks] = useState(false);

    const refreshLabels = useCallback( async () => {
        const newLabels = await fetchAllTaskStatus();
        newLabels.success && newLabels.data && setTaskStatusLabels(newLabels.data);
    }, []);

    const refreshTasks = useCallback( async() => {
        const newTasks = await fetchTasks();
        newTasks.success && newTasks.data && setTaskList(newTasks.data);
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
            <CreateTaskStatusComponent onSuccess={setShouldRefreshLabels}/>
            <CreateTaskComponent onSuccess={setShouldRefreshTasks} />
        </div>
        <div>
        { canRender && <KanbanBoard taskStatusLabels={taskStatusLabels} taskList={taskList} onTaskModify={setShouldRefreshTasks}/>}
        </div>
        </>
    )
}