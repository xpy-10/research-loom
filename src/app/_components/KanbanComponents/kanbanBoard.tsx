'use client'
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { BoardColumn, BoardContainer } from "./boardColumn";
import { DndContext, type DragEndEvent, type DragOverEvent, DragOverlay, type DragStartEvent, useSensor, useSensors, KeyboardSensor, Announcements, UniqueIdentifier, TouchSensor, MouseSensor } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { TaskCard } from "./taskCard";
import type { Column } from "./boardColumn";
import { hasDraggableData } from "@/lib/utils";
import { coordinateGetter } from "./multipleContainersKeyboardPreset";
import { TaskStatus, Task } from "@prisma/client";
import { z } from "zod";
import { taskStatusChangeManySchema, taskStatusKanbanSort } from "@/lib/formValidation";
import { changeTaskAttributesKanban, changeTaskStatusKanbanSort } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

export function KanbanBoard({taskStatusLabels, taskList}:{taskStatusLabels:TaskStatus[], taskList:Task[]}) {
    const uncategorizedColumn = {id: -1, label: 'uncategorized'}
    taskStatusLabels.map((label) => {console.log(label.id, label.kanbanColSort)})
    const [columns, setColumns] = useState<Column[]>([uncategorizedColumn, ...taskStatusLabels]);
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
    const [tasks, setTasks] = useState<Task[]>(taskList);
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
    }, [])

    useEffect(() => {
        if (!isClient) return;
        let updateArray: z.infer<typeof taskStatusChangeManySchema> = []
        tasks.map((task, index) => {
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
        
    }, [tasks])

    useEffect(() => {
        if (!isClient) return;
        let updateArray: z.infer<typeof taskStatusKanbanSort> = []
        columns.map((column, index) => {
          console.log(column, index)
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
    }, [columns])
    
    const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinateGetter,
    })
  );

  const returnValue = (isClient? (<DndContext
    sensors={sensors}
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    onDragOver={onDragOver}
  >
    <BoardContainer>
      <SortableContext items={columnsId}>
        {columns.map((col) => (
          <BoardColumn
            key={col.id}
            column={col}
            tasks={tasks.filter((task) => task.taskStatusId === col.id || !task.taskStatusId && col.id === -1)}
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
              tasks={tasks.filter(
                (task) => task.taskStatusId === activeColumn.id || !task.taskStatusId && activeColumn.id === -1
              )}
            />
          )}
          {activeTask && <TaskCard task={activeTask} isOverlay />}
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

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
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
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);
        const activeTask = tasks[activeIndex];
        const overTask = tasks[overIndex];
        if (
          activeTask &&
          overTask &&
          activeTask.taskStatusId !== overTask.taskStatusId
        ) {
          activeTask.taskStatusId = overTask.taskStatusId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = overData?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const activeTask = tasks[activeIndex];
        if (activeTask) {
          activeTask.taskStatusId = overId as number;
          return arrayMove(tasks, activeIndex, activeIndex);
        }
        return tasks;
      });
    }
  }
}
