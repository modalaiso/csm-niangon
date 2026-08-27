import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
}

export function TablePagination(props: Readonly<TablePaginationProps>) {
  if (props.totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-full"
        disabled={props.page === 1}
        onClick={() => props.onPageChange(Math.max(1, props.page - 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="px-3 text-sm text-muted-foreground">
        Page {props.page} / {props.totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-full"
        disabled={props.page === props.totalPages}
        onClick={() =>
          props.onPageChange(Math.min(props.totalPages, props.page + 1))
        }
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
