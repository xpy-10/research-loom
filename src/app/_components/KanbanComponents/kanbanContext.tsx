import { Task, TaskStatus } from "@prisma/client";
import { Column } from "./boardColumn";
import React, { createContext, useContext, useState } from "react";

interface kanbanContextType {
    listOfTasks: Task[],
    setListOfTasks: React.Dispatch<React.SetStateAction<Task[]>>,
    listOfLabels: TaskStatus[]|Column[],
    setListOfLabels: React.Dispatch<React.SetStateAction<TaskStatus[]|Column[]>>
    shouldRefreshTasks: boolean,
    setShouldRefreshTasks: React.Dispatch<React.SetStateAction<boolean>>,
    shouldProcessDeleteTask: Task|undefined,
    setShouldProcessDeleteTask: React.Dispatch<React.SetStateAction<Task|undefined>>,
    modifyLabelsEvent: boolean,
    setModifyLabelsEvent: React.Dispatch<React.SetStateAction<boolean>>,
    modifyTasksEvent: boolean,
    setModifyTasksEvent: React.Dispatch<React.SetStateAction<boolean>>
}

const KanbanContext = createContext<kanbanContextType|undefined>(undefined);

export function KanbanContextProvider({children}:{children: React.ReactNode}) {
    const [taskStatusLabels, setTaskStatusLabels] = useState<TaskStatus[]|Column[]>([]);
    const [taskList, setTaskList] = useState<Task[]>([]);
    const [shouldRefreshTasks, setShouldRefreshTasks] = useState(false);
    const [shouldProcessDeleteTask, setShouldProcessDeleteTask] = useState<Task|undefined>(undefined);
    const [modifyLabelsEvent, setModifyLabelsEvent] = useState(false);
    const [modifyTasksEvent, setModifyTasksEvent] = useState(false);
    
    const context: kanbanContextType = {
        listOfTasks: taskList,
        setListOfTasks: setTaskList,
        listOfLabels: taskStatusLabels,
        setListOfLabels: setTaskStatusLabels,
        shouldRefreshTasks: shouldRefreshTasks,
        setShouldRefreshTasks: setShouldRefreshTasks,
        shouldProcessDeleteTask: shouldProcessDeleteTask,
        setShouldProcessDeleteTask: setShouldProcessDeleteTask,
        modifyLabelsEvent: modifyLabelsEvent,
        setModifyLabelsEvent: setModifyLabelsEvent,
        modifyTasksEvent: modifyTasksEvent,
        setModifyTasksEvent: setModifyTasksEvent
    };

    return (
    <KanbanContext.Provider value={context}>
        {children}
    </KanbanContext.Provider>
    )
};

export const useKanbanContext = () => {
    const context = useContext(KanbanContext);
    if (!context) {
        throw new Error('useKanbanContext must be used within a KanbanContext Provider')
    }
    return context;
}