import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cva } from "class-variance-authority";
import { GripVertical} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Task } from "@prisma/client";
import TaskOptions from "../taskComponents/taskOptions";
import { useState } from "react";

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
  onTaskModify: (arg: boolean) => void;
}

export type TaskType = "Task";

export interface TaskDragData {
  type: TaskType;
  task: Task;
}

export function TaskCard({ task, isOverlay, onTaskModify }: TaskCardProps) {
  const {setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    } satisfies TaskDragData,
    attributes: {
      roleDescription: "Task",
    },
  });

  const [viewTaskDialog, setViewTaskDialog] = useState(false);
  const [taskDialogData, setTaskDialogData] = useState<Task|undefined>(undefined);
  const [deleteTaskDialog, setDeleteTaskDialog] = useState(false);
  const taskOptionProps = {
    task: task,
    setViewTaskDialog: setViewTaskDialog,
    viewTaskDialog: viewTaskDialog,
    setTaskDialogData: setTaskDialogData,
    setDeleteTaskDialog: setDeleteTaskDialog,
    deleteTaskDialog: deleteTaskDialog,
    onTaskModify: onTaskModify
  }
  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva("", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary",
      },
    },
  });

  return (
    <>
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
    >
      <CardHeader className="px-3 py-3 space-between flex flex-row border-b-2 border-secondary relative">
        <Button
          variant={"ghost"}
          {...attributes}
          {...listeners}
          className="p-1 text-secondary-foreground/50 -ml-2 h-auto cursor-grab"
        >
          <span className="sr-only">Move task</span>
          <GripVertical />
        </Button>
        <Badge variant={"outline"} className="ml-auto font-semibold">
          {task.title}
        </Badge>
      </CardHeader>
      <CardContent className="px-3 pt-3 pb-6 text-left whitespace-pre-wrap">
        {task.description}
      </CardContent>
      <CardFooter>
        <div className="flex ml-auto ">
        <TaskOptions {...taskOptionProps} />
        </div>
      </CardFooter>
    </Card>
    </>
  );
}
