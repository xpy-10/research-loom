'use client'
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { BoardColumn, BoardContainer } from "./boardColumn";
import { DndContext, type DragEndEvent, type DragOverEvent, DragOverlay, type DragStartEvent, useSensor, useSensors, KeyboardSensor, TouchSensor, MouseSensor } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { TaskCard } from "./taskCard";
import type { Column } from "./boardColumn";
import { hasDraggableData } from "@/lib/utils";
import { coordinateGetter } from "./multipleContainersKeyboardPreset";
import { Task } from "@prisma/client";
import { z } from "zod";
import { taskStatusChangeManySchema, taskStatusKanbanSort } from "@/lib/formValidation";
import { changeTaskAttributesKanban, changeTaskStatusKanbanSort, fetchAllTaskStatus, fetchTasks } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useKanbanContext } from "./kanbanContext";

export function KanbanBoard() {

    const uncategorizedColumn = {id: -1, label: 'uncategorized'};
    const { listOfLabels, listOfTasks, 
      setListOfLabels, setListOfTasks, 
      shouldRefreshTasks, setShouldRefreshTasks, 
      shouldProcessDeleteTask, setShouldProcessDeleteTask,
      modifyTasksEvent, setModifyTasksEvent,
      modifyLabelsEvent, setModifyLabelsEvent,
    } = useKanbanContext();
    const columnsId = useMemo(() => listOfLabels.map((col) => col.id), [listOfLabels]);
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();

    /* eslint-disable @typescript-eslint/no-unused-expressions, react-hooks/exhaustive-deps */
    useEffect(() => {
        setIsClient(true);
        fetchAllTaskStatus().then((response) => {
            response.success && response.data && setListOfLabels([uncategorizedColumn, ...response.data]);
            !response.success && response.message && toast({
                description: 'Unable to fetch task status list'
            });
        }).catch((error) => {
            console.log(error);
            toast({
                description: 'Client: Error fetching updated task status list'
            })
        });
        fetchTasks().then((response) => {
                  response.success && response.data && setListOfTasks(response.data);
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
        if (!isClient || !modifyLabelsEvent) return;
        console.log('labels :', modifyLabelsEvent);
        setModifyLabelsEvent(false)
        fetchAllTaskStatus().then((response) => {
            response.success && response.data && setListOfLabels([uncategorizedColumn, ...response.data]);
            !response.success && response.message && toast({
                description: 'Unable to refresh task status list'
            });
        }).catch((error) => {
            console.log(error);
            toast({
                description: 'Client: Error fetching updated task status list'
            })
        })
    }, [modifyLabelsEvent]);

    useEffect(() => {
      if (!modifyTasksEvent) return;
      setModifyTasksEvent(false);
      fetchTasks().then((response) => {
          response.success && response.data && setListOfTasks(response.data);
          !response.success && response.message && toast({
              description: 'Unable to refresh tasks'
          });
      }).catch((error) => {
          console.log(error);
          toast({
              description: 'Client: Error fetching updated tasks'
          })
      });
    }, [modifyTasksEvent]);
    

    useEffect(() => {
      if (!shouldProcessDeleteTask) return;
      const newList = listOfTasks.filter((task) => {
        return task.id != shouldProcessDeleteTask.id
      })
      setListOfTasks(newList);
      setShouldProcessDeleteTask(undefined)
    }, [shouldProcessDeleteTask])

    useEffect(() => {
        if (!isClient || !listOfTasks || !shouldRefreshTasks || modifyTasksEvent || shouldProcessDeleteTask) return; 
        setShouldRefreshTasks(false);
          const updateArray: z.infer<typeof taskStatusChangeManySchema> = [];
          listOfTasks.map((task, index) => {
              updateArray.push({taskId: task.id, kanbanSort: index,  taskLabelId: task.taskStatusId? task.taskStatusId: -1})
          });
          changeTaskAttributesKanban(updateArray).then((response) => {
            response.success && response.data && toast({
              description: 'tasks successfully updated'
            });
            !response.success && response.message && toast({
              description: "error updating the tasks"
            })
          }).catch((error) => {
            console.log(error);
            toast({
              description: "error with database operation"
            })
          });
    }, [shouldRefreshTasks]);

    useEffect(() => {
        if (!isClient || !listOfLabels) return;
        console.log('update array')
          const updateArray: z.infer<typeof taskStatusKanbanSort> = []
          listOfLabels.map((column, index) => {
              updateArray.push({id: Number(column.id), kanbanColSort: index})
          });
          changeTaskStatusKanbanSort(updateArray).then((response) => {
            response.success && response.data && toast({
              description: 'columns successfully updated'
            });
            !response.success && response.message && toast({
              description: "error updating the columns"
            })
          }).catch((error) => {
            console.log(error);
            toast({
              description: "error with database operation"
            })
          });
    }, [listOfLabels])
    /* eslint-enable @typescript-eslint/no-unused-expressions, react-hooks/exhaustive-deps */
    
    const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinateGetter,
    })
  );

  const returnValue = (isClient && columnsId && listOfLabels && listOfTasks ? (
  <DndContext
    sensors={sensors}
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    onDragOver={onDragOver}
  >
    <BoardContainer>
      <SortableContext items={columnsId}>
        {listOfLabels.map((col) => (
          <BoardColumn
            key={col.id}
            column={col}
            tasks={listOfTasks.filter((task) => task.taskStatusId === col.id || !task.taskStatusId && col.id === -1)}
            onTaskModify={setShouldRefreshTasks}
            onTaskDelete={setShouldProcessDeleteTask}
          />
        ))}
      </SortableContext>
    </BoardContainer>

    { "document" in window &&
      createPortal(
        <DragOverlay>
          {activeColumn && (
            <BoardColumn
              isOverlay
              column={activeColumn}
              tasks={listOfTasks.filter(
                (task) => task.taskStatusId === activeColumn.id || !task.taskStatusId && activeColumn.id === -1
              )}
              onTaskModify={setShouldRefreshTasks}
              onTaskDelete={setShouldProcessDeleteTask}
            />
          )}
          {activeTask && <TaskCard onTaskModify={setShouldRefreshTasks} onTaskDelete={setShouldProcessDeleteTask} task={activeTask} isOverlay />}
        </DragOverlay>,
        document.body
      )}
  </DndContext>):
  (<div>Loading</div>)
)

  return returnValue;

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === "Column") {
      setActiveColumn(data.column);
      return;
    }

    if (data?.type === "Task") {
      setActiveTask(data.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active)) return;

    const activeData = active.data.current;

    if (activeId === overId) return;

    const isActiveAColumn = activeData?.type === "Column";
    if (!isActiveAColumn) return;

    /* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
    const newLabels = listOfLabels? ((listOfLabels: any) => {
      const activeColumnIndex = listOfLabels.findIndex((col: any) => col.id === activeId);

      const overColumnIndex = listOfLabels.findIndex((col: any) => col.id === overId);
      return arrayMove(listOfLabels, activeColumnIndex, overColumnIndex);
    }): (undefined);
    /* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

    setListOfLabels((listOfLabels) => {
      const activeColumnIndex = listOfLabels.findIndex((col) => col.id === activeId);

      const overColumnIndex = listOfLabels.findIndex((col) => col.id === overId);
      return arrayMove(listOfLabels, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const isActiveATask = activeData?.type === "Task";
    const isOverATask = overData?.type === "Task";

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setListOfTasks((listOfTasks) => {
        const activeIndex = listOfTasks.findIndex((t) => t.id === activeId);
        const overIndex = listOfTasks.findIndex((t) => t.id === overId);
        const activeTask = listOfTasks[activeIndex];
        const overTask = listOfTasks[overIndex];
        if (
          activeTask &&
          overTask &&
          activeTask.taskStatusId !== overTask.taskStatusId
        ) {
          activeTask.taskStatusId = overTask.taskStatusId;
          return arrayMove(listOfTasks, activeIndex, overIndex - 1);
        }
        return arrayMove(listOfTasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = overData?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setListOfTasks((listOfTasks) => {
        const activeIndex = listOfTasks.findIndex((t) => t.id === activeId);
        const activeTask = listOfTasks[activeIndex];
        if (activeTask) {
          activeTask.taskStatusId = overId as number;
          return arrayMove(listOfTasks, activeIndex, activeIndex);
        }
        return listOfTasks;
      });
    }
  }
}
