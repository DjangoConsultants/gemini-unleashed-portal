import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { ProcessingLogsFilters, ProcessingLogsSort, ProcessingLog } from '@/hooks/useProcessingLogs';

interface ProcessingLogsFiltersComponentProps {
  filters: ProcessingLogsFilters;
  sort: ProcessingLogsSort;
  onFiltersChange: (filters: Partial<ProcessingLogsFilters>) => void;
  onSortChange: (column: keyof ProcessingLog) => void;
  onClearFilters: () => void;
  totalResults: number;
}

export const ProcessingLogsFilterPanel: React.FC<ProcessingLogsFiltersComponentProps> = ({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  onClearFilters,
  totalResults
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Local state for pending changes
  const [pendingFilters, setPendingFilters] = React.useState<ProcessingLogsFilters>(filters);
  const [pendingSort, setPendingSort] = React.useState<ProcessingLogsSort>(sort);
  
  // Update pending state when props change (e.g., when filters are cleared)
  React.useEffect(() => {
    setPendingFilters(filters);
  }, [filters]);
  
  React.useEffect(() => {
    setPendingSort(sort);
  }, [sort]);
  
  const handleApplyFilters = () => {
    onFiltersChange(pendingFilters);
    if (pendingSort.column !== sort.column || pendingSort.ascending !== sort.ascending) {
      onSortChange(pendingSort.column);
    }
  };
  
  const handleClearFilters = () => {
    const emptyFilters = {};
    const defaultSort = { column: '_processing_timestamp' as keyof ProcessingLog, ascending: false };
    setPendingFilters(emptyFilters);
    setPendingSort(defaultSort);
    onClearFilters();
  };

  const stages = [
    'processing_email',
    'processing_attachments',
    'ai_parsing',
    'parse_json_ai_response',
    'unleashed_sync',
    'customer_sync'
  ];

  const statuses = ['error', 'info', 'success'];

  const sortOptions = [
    { value: '_processing_timestamp', label: 'Timestamp' },
    { value: 'from_email', label: 'From Email' },
    { value: 'file_name', label: 'File Name' },
    { value: 'stage', label: 'Stage' },
    { value: 'status', label: 'Status' }
  ];

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && 
    (typeof value === 'object' ? Object.values(value).some(v => v !== '') : true)
  );

  return (
    <Card className="border-0 shadow-lg bg-card/95 backdrop-blur mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="w-5 h-5 text-primary" />
                Filters & Sorting
                {hasActiveFilters && (
                  <span className="text-sm text-primary">({totalResults} results)</span>
                )}
              </CardTitle>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Date Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Start Date</label>
                <Input
                  type="datetime-local"
                  value={pendingFilters.dateRange?.start || ''}
                  onChange={(e) => setPendingFilters(prev => ({
                    ...prev,
                    dateRange: {
                      start: e.target.value,
                      end: prev.dateRange?.end || ''
                    }
                  }))}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">End Date</label>
                <Input
                  type="datetime-local"
                  value={pendingFilters.dateRange?.end || ''}
                  onChange={(e) => setPendingFilters(prev => ({
                    ...prev,
                    dateRange: {
                      start: prev.dateRange?.start || '',
                      end: e.target.value
                    }
                  }))}
                  className="bg-background"
                />
              </div>
            </div>

            {/* Text Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">From Email</label>
                <Input
                  placeholder="Search by email..."
                  value={pendingFilters.fromEmail || ''}
                  onChange={(e) => setPendingFilters(prev => ({ ...prev, fromEmail: e.target.value }))}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">File Name</label>
                <Input
                  placeholder="Search by filename..."
                  value={pendingFilters.fileName || ''}
                  onChange={(e) => setPendingFilters(prev => ({ ...prev, fileName: e.target.value }))}
                  className="bg-background"
                />
              </div>
            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Stage</label>
                <Select
                  value={pendingFilters.stage || 'all-stages'}
                  onValueChange={(value) => setPendingFilters(prev => ({ ...prev, stage: value === 'all-stages' ? undefined : value }))}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select stage..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-stages">All Stages</SelectItem>
                    {stages.map(stage => (
                      <SelectItem key={stage} value={stage}>
                        {stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <Select
                  value={pendingFilters.status || 'all-statuses'}
                  onValueChange={(value) => setPendingFilters(prev => ({ ...prev, status: value === 'all-statuses' ? undefined : value }))}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-statuses">All Statuses</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sorting */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Sort By</label>
                <Select
                  value={pendingSort.column}
                  onValueChange={(value) => setPendingSort(prev => ({ ...prev, column: value as keyof ProcessingLog }))}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Order</label>
                <Select
                  value={pendingSort.ascending ? 'asc' : 'desc'}
                  onValueChange={(value) => setPendingSort(prev => ({ ...prev, ascending: value === 'asc' }))}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleApplyFilters}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Apply
              </Button>
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="flex items-center gap-2"
                disabled={!hasActiveFilters}
              >
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
              <div className="flex-1 text-right">
                <span className="text-sm text-muted-foreground">
                  {totalResults} {totalResults === 1 ? 'result' : 'results'} found
                </span>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};