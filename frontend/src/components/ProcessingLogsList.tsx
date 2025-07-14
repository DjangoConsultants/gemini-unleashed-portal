import React, { useState } from 'react';
import { useProcessingLogs } from '@/hooks/useProcessingLogs';
import { ProcessingLogCard } from '@/components/ProcessingLogCard';
import { ProcessingLogsFilterPanel } from '@/components/ProcessingLogsFilters';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Loader, AlertCircle, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadProcessingLogFile } from '@/utils/fileDownload';
import type { ProcessingLog } from '@/hooks/useProcessingLogs';

export const ProcessingLogsList: React.FC = () => {
  const {
    logs,
    loading,
    error,
    total,
    currentPage,
    totalPages,
    filters,
    sort,
    setCurrentPage,
    updateFilters,
    updateSort,
    clearFilters
  } = useProcessingLogs();

  const { toast } = useToast();
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  const handleDownloadAttachment = async (log: ProcessingLog) => {
    // Prevent multiple downloads of the same file
    if (downloadingIds.has(log.id)) {
      return;
    }

    // Add to downloading set and show loading state
    setDownloadingIds(prev => new Set(prev).add(log.id));

    try {
      const result = await downloadProcessingLogFile(log);
      
      if (result.success) {
        toast({
          title: "Download Complete! 🎉",
          description: `Successfully downloaded ${log.file_name || 'file'}`,
          className: "border-primary bg-primary/10 text-primary",
        });
      } else {
        toast({
          title: "Download Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected error in download handler:', error);
      toast({
        title: "Download Failed",
        description: "Oh no, something unexpected happened! Please try again or reach out to support.",
        variant: "destructive",
      });
    } finally {
      // Remove from downloading set
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(log.id);
        return newSet;
      });
    }
  };


  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading processing logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/10">
        <CardContent className="flex items-center gap-3 p-6">
          <AlertCircle className="w-6 h-6 text-destructive" />
          <div>
            <h3 className="font-semibold text-destructive">Error Loading Logs</h3>
            <p className="text-sm text-destructive/80">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Panel */}
      <ProcessingLogsFilterPanel
        filters={filters}
        sort={sort}
        onFiltersChange={updateFilters}
        onSortChange={updateSort}
        onClearFilters={clearFilters}
        totalResults={total}
      />

      {/* Results */}
      {total === 0 ? (
        <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Database className="w-12 h-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">No Processing Logs Found</h3>
              <p className="text-muted-foreground">
                {Object.keys(filters).length > 0 
                  ? "No logs match your current filters. Try adjusting your search criteria."
                  : "There are no processing logs to display at the moment."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Logs Grid */}
          <div className="grid gap-6">
            {logs.map((log) => (
              <ProcessingLogCard
                key={log.id}
                log={log}
                onDownloadAttachment={handleDownloadAttachment}
                isDownloading={downloadingIds.has(log.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {generatePageNumbers().map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={pageNum === currentPage}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Results Summary */}
          <div className="text-center text-sm text-muted-foreground">
            Showing {(currentPage - 1) * 15 + 1} to {Math.min(currentPage * 15, total)} of {total} results
          </div>
        </>
      )}
    </div>
  );
};