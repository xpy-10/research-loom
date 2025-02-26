'use client'
import { KanbanContextProvider } from "../_components/KanbanComponents/kanbanContext";
import KanbanIndex from "../_components/KanbanComponents";

export default function Kanban() {
    // const [taskStatusLabels, setTaskStatusLabels] = useState<TaskStatus[]|Column[]>();
    // const [taskList, setTaskList] = useState<Task[]>();
    // const [shouldRefreshLabels, setShouldRefreshLabels] = useState(false);
    // const [shouldRefreshTasks, setShouldRefreshTasks] = useState(false);
    // const { toast } = useToast();

    // const refreshLabels = useCallback(() => {
    //     fetchAllTaskStatus().then((response) => {
    //         response.success && response.data && setTaskStatusLabels(response.data);
    //         !response.success && response.message && toast({
    //             description: 'Unable to refresh task status list'
    //         });
    //     }).catch((error) => {
    //         console.log(error);
    //         toast({
    //             description: 'Client: Error fetching updated task status list'
    //         })
    //     })
    // }, []);

    // const refreshTasks = useCallback(() => {
    //     fetchTasks().then((response) => {
    //         response.success && response.data && setTaskList(response.data);
    //         !response.success && response.message && toast({
    //             description: 'Unable to refresh tasks'
    //         });
    //     }).catch((error) => {
    //         console.log(error);
    //         toast({
    //             description: 'Client: Error fetching updated tasks'
    //         })
    //     })
    // }, []);

    // useEffect(() => {
    //     refreshLabels();
    //     refreshTasks();
    // }, [refreshLabels, refreshTasks])


    // useEffect(() => {
    //     shouldRefreshLabels && refreshLabels();
    //     setShouldRefreshLabels(false);
    // }, [shouldRefreshLabels]);

    // useEffect(() => {
    //     shouldRefreshTasks && refreshTasks();
    //     setShouldRefreshTasks(false);
    // }, [shouldRefreshTasks])

    // const canRender = taskStatusLabels && taskList;

    return ( 
        <>
        <KanbanContextProvider>
            <KanbanIndex />
        </KanbanContextProvider>
        </>
    )
}