import CreateTask from "../_components/taskComponents/createTask";
import TaskList from "../_components/taskComponents/taskList";

export default function TaskPage() {
    return (
        <>
        <div>
        <TaskList />
        </div>
        <div>
        <CreateTask />
        </div>
        </>
    )
}