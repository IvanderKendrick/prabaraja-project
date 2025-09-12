    import React from "react";
    import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    } from "@/components/ui/pagination";

    interface ProductPaginationProps {
    currentPage: number;
    totalProductPages: number;
    setCurrentPage: (page: number) => void;
    }

    export const ProductPagination: React.FC<ProductPaginationProps> = ({
    currentPage,
    totalProductPages,
    setCurrentPage,
    }) => {
    return (
        <Pagination>
        <PaginationContent>
            <PaginationItem>
            <PaginationPrevious
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
            </PaginationItem>
            {/* Show pagination with ellipsis for better UX */}
            {(() => {
              const pages = [];
              const showEllipsis = totalProductPages > 7;
              
              if (!showEllipsis) {
                // Show all pages if 7 or fewer
                for (let i = 1; i <= totalProductPages; i++) {
                  pages.push(
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i)}
                        isActive={currentPage === i}
                        className="cursor-pointer"
                      >
                        {i}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
              } else {
                // Show smart pagination with ellipsis
                pages.push(
                  <PaginationItem key={1}>
                    <PaginationLink
                      onClick={() => setCurrentPage(1)}
                      isActive={currentPage === 1}
                      className="cursor-pointer"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                );

                if (currentPage > 3) {
                  pages.push(
                    <PaginationItem key="ellipsis1">
                      <span className="flex h-9 w-9 items-center justify-center text-sm">...</span>
                    </PaginationItem>
                  );
                }

                const start = Math.max(2, currentPage - 1);
                const end = Math.min(totalProductPages - 1, currentPage + 1);

                for (let i = start; i <= end; i++) {
                  if (i !== 1 && i !== totalProductPages) {
                    pages.push(
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i)}
                          isActive={currentPage === i}
                          className="cursor-pointer"
                        >
                          {i}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                }

                if (currentPage < totalProductPages - 2) {
                  pages.push(
                    <PaginationItem key="ellipsis2">
                      <span className="flex h-9 w-9 items-center justify-center text-sm">...</span>
                    </PaginationItem>
                  );
                }

                if (totalProductPages > 1) {
                  pages.push(
                    <PaginationItem key={totalProductPages}>
                      <PaginationLink
                        onClick={() => setCurrentPage(totalProductPages)}
                        isActive={currentPage === totalProductPages}
                        className="cursor-pointer"
                      >
                        {totalProductPages}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
              }
              
              return pages;
            })()}
            <PaginationItem>
            <PaginationNext
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalProductPages))}
                className={currentPage === totalProductPages ? "pointer-events-none opacity-50" : ""}
            />
            </PaginationItem>
        </PaginationContent>
        </Pagination>
    );
    };