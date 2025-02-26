'use client'

import { useState } from "react"
import CreateTaskComponent from "../taskComponents/createTaskComponent";
import CreateTaskStatusComponent from "../taskStatusComponents/createTaskStatusComponent";
import { KanbanBoard } from "./kanbanBoard";
import { useKanbanContext } from "./kanbanContext";

export default function KanbanIndex() {
    const {setModifyTasksEvent, setModifyLabelsEvent} = useKanbanContext();
    return (
        <>
         <div className="flex gap-4 p-2">
                <CreateTaskComponent onSuccess={setModifyTasksEvent} />
                <CreateTaskStatusComponent onSuccess={setModifyLabelsEvent}/>
            </div>
            <div className="flex justify-start px-4">
            <KanbanBoard />
            </div>
        </>
    )
}