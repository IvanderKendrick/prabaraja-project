import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50],
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  const renderPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      // Adjust start if we're near the end
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/10 shadow-sm">
      {/* Items per page selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Items per page:
        </span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
        >
          <SelectTrigger className="w-20 h-8 bg-white/80 dark:bg-[#1F2937] text-foreground dark:text-[#FFFFFF] border border-white/20 dark:border-[#374151] hover:bg-white/90 dark:hover:bg-[#374151] focus:ring-2 focus:ring-[#22C55E]/50 transition-all duration-200 [&_svg]:text-foreground dark:[&_svg]:text-[#E5E7EB] [&_svg]:opacity-100">
            <SelectValue className="dark:text-[#FFFFFF]" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 dark:bg-[#1F2937] text-foreground dark:text-[#FFFFFF] border border-white/20 dark:border-[#374151] shadow-lg backdrop-blur-sm">
            {itemsPerPageOptions.map((option) => (
              <SelectItem
                key={option}
                value={option.toString()}
                className="hover:bg-gray-100 dark:hover:bg-[#374151] focus:bg-[#22C55E]/10 dark:focus:bg-[#22C55E]/10 focus:text-[#22C55E] dark:focus:text-[#22C55E] data-[state=checked]:bg-[#22C55E]/10 data-[state=checked]:text-[#22C55E] dark:text-[#FFFFFF] cursor-pointer"
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Current range display */}
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="h-8 px-3 border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {renderPageNumbers().map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "ghost"}
              size="sm"
              onClick={() => handlePageClick(page)}
              className={`h-8 w-8 p-0 text-sm font-medium transition-all duration-200 ${
                currentPage === page
                  ? "bg-white text-black dark:text-white dark:bg-white dark:text-black shadow-sm"
                  : "hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="h-8 px-3 border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
