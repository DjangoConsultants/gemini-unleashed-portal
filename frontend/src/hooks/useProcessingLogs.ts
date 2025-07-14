import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type ProcessingLog = Tables<'processing_logs'>;

export interface ProcessingLogsFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  fromEmail?: string;
  fileName?: string;
  stage?: string;
  status?: string;
}

export interface ProcessingLogsSort {
  column: keyof ProcessingLog;
  ascending: boolean;
}

export const useProcessingLogs = () => {
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ProcessingLogsFilters>({});
  const [sort, setSort] = useState<ProcessingLogsSort>({
    column: '_processing_timestamp',
    ascending: false
  });

  const pageSize = 15;

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('processing_logs')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.dateRange?.start && filters.dateRange?.end) {
        query = query
          .gte('_processing_timestamp', filters.dateRange.start)
          .lte('_processing_timestamp', filters.dateRange.end);
      }

      if (filters.fromEmail) {
        query = query.ilike('from_email', `%${filters.fromEmail}%`);
      }

      if (filters.fileName) {
        query = query.ilike('file_name', `%${filters.fileName}%`);
      }

      if (filters.stage) {
        query = query.eq('stage', filters.stage);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Apply sorting
      query = query.order(sort.column, { ascending: sort.ascending });

      // Apply pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: queryError, count } = await query;

      if (queryError) {
        throw queryError;
      }

      setLogs(data || []);
      setTotal(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters, sort]);

  const updateFilters = (newFilters: Partial<ProcessingLogsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const updateSort = (column: keyof ProcessingLog) => {
    setSort(prev => ({
      column,
      ascending: prev.column === column ? !prev.ascending : false
    }));
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  return {
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
    clearFilters,
    refetch: fetchLogs
  };
};