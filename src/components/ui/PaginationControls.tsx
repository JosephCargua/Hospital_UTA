import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  onNext: () => void;
  onPrev: () => void;
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  totalItems,
  indexOfFirstItem,
  indexOfLastItem,
  onNext,
  onPrev
}: PaginationControlsProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
      <p className="text-xs text-slate-500 font-medium">
        Mostrando <span className="font-bold text-slate-700">{indexOfFirstItem + 1}</span> al <span className="font-bold text-slate-700">{Math.min(indexOfLastItem, totalItems)}</span> de <span className="font-bold text-slate-700">{totalItems}</span> registros
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0 rounded-lg border-slate-200"
        >
          <ChevronLeft size={16} />
        </Button>
        <div className="text-xs font-bold text-slate-700 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
          Pág. {currentPage} de {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0 rounded-lg border-slate-200"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};
