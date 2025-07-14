import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface LogStatistics {
  totalLogs: number;
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  loading: boolean;
  error: string | null;
}

export const useLogStatistics = (selectedDate: Date = new Date()) => {
  const [statistics, setStatistics] = useState<LogStatistics>({
    totalLogs: 0,
    statusBreakdown: [],
    loading: true,
    error: null
  });

  const fetchStatistics = async () => {
    setStatistics(prev => ({ ...prev, loading: true, error: null }));

    try {
      const dateStart = format(selectedDate, 'yyyy-MM-dd') + ' 00:00:00+00';
      const dateEnd = format(selectedDate, 'yyyy-MM-dd') + ' 23:59:59+00';

      // Get total logs for the selected date
      const { data: totalData, error: totalError } = await supabase
        .from('processing_logs')
        .select('id', { count: 'exact' })
        .gte('_processing_timestamp', dateStart)
        .lte('_processing_timestamp', dateEnd);

      if (totalError) throw totalError;

      // Get status breakdown
      const { data: statusData, error: statusError } = await supabase
        .from('processing_logs')
        .select('status')
        .gte('_processing_timestamp', dateStart)
        .lte('_processing_timestamp', dateEnd);

      if (statusError) throw statusError;

      const totalCount = totalData?.length || 0;
      
      // Calculate status breakdown
      const statusCounts: Record<string, number> = {};
      statusData?.forEach(log => {
        statusCounts[log.status] = (statusCounts[log.status] || 0) + 1;
      });

      const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
      }));

      setStatistics({
        totalLogs: totalCount,
        statusBreakdown,
        loading: false,
        error: null
      });
    } catch (err) {
      setStatistics(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch statistics'
      }));
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [selectedDate]);

  return { ...statistics, refetch: fetchStatistics };
};