import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Active, DataRef, Over } from "@dnd-kit/core";
import { ColumnDragData } from "@/app/_components/KanbanComponents/boardColumn";
import { TaskDragData } from "@/app/_components/KanbanComponents/taskCard";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const buttonStyle = "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:focus-visible:ring-neutral-300 border border-neutral-200 bg-white shadow-sm hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 h-9 px-4 py-2 w-[[240px] pl-3 text-left font-normal";

export const buttonStyleGhost = "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:focus-visible:ring-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 h-8 w-8 p-0";

type DraggableData = ColumnDragData | TaskDragData;

// util hasDraggableaData from react-dnd-kit-tailwind-shadcn-ui
// https://github.com/Georgegriff/react-dnd-kit-tailwind-shadcn-ui
export function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data?.type === "Column" || data?.type === "Task") {
    return true;
  }

  return false;
}

// util function stringToColour with assistance from ChatGPT
export const stringToColour = (str:string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash = hash & hash; 
    }
    hash = Math.abs(hash);

    const returnedColour = '#'+((1<<24) + (hash & 0xFFFFFF)).toString(16).slice(1);

    return returnedColour
}