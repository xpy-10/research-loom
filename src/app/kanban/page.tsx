import { fetchAllTaskStatus } from "@/lib/actions";
import CreateTaskStatusComponent from "../_components/taskStatusComponents/createTaskStatusComponent";
import SelectTaskStatusComponent from "../_components/taskStatusComponents/selectTaskStatusComponent";

export default async function Kanban() {
    const taskStatusLabels = await fetchAllTaskStatus();
    return ( 
        <>
        <CreateTaskStatusComponent />
        <div>
        {/* <SelectTaskStatusComponent taskStatusId={} taskStatusLabels={taskStatusLabels.data}/> */}
        </div>
        </>
    )
}