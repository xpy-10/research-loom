import { fetchAllTaskStatus, fetchTasks } from "@/lib/actions";
import TaskList from "../_components/taskComponents/taskList";

export default async function TaskPage() {
    const taskData = await fetchTasks();
    const statusList = await fetchAllTaskStatus();
    return (
        <>
        <div className="p-4">
        <TaskList 
        data={taskData && taskData.success && taskData.data? taskData.data : []}
        taskStatus={statusList && statusList.success && statusList.data? statusList.data : []}
        />
        </div>
        </>
    )
}