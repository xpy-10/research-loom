import { fetchAllTaskStatus, fetchTasks } from "@/lib/actions";
import CreateTaskStatusComponent from "../_components/taskStatusComponents/createTaskStatusComponent";
import { KanbanBoard } from "../_components/KanbanComponents/kanbanBoard";

export default async function Kanban() {
    const taskStatusLabels = await fetchAllTaskStatus();
    const taskList = await fetchTasks();
    const canRender = taskStatusLabels && taskList && taskStatusLabels.success && taskStatusLabels.data && taskList.success && taskList.data

    return ( 
        <>
        <CreateTaskStatusComponent />
        <div>
        { canRender && <KanbanBoard taskStatusLabels={taskStatusLabels.data} taskList={taskList.data}/>}
        </div>
        </>
    )
}