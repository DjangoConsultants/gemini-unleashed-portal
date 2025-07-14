import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, FileText, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { useLogStatistics } from '@/hooks/useLogStatistics';

const STATUS_COLORS = {
  success: 'hsl(var(--chart-1))',
  error: 'hsl(var(--destructive))',
  warning: 'hsl(var(--chart-3))',
  pending: 'hsl(var(--chart-4))',
  processing: 'hsl(var(--chart-5))',
} as const;

export const LogsReportingSection: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { totalLogs, statusBreakdown, loading, error } = useLogStatistics(selectedDate);

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const chartData = statusBreakdown.map(item => ({
    ...item,
    fill: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || 'hsl(var(--muted))'
  }));

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Log Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Viewing data for {format(selectedDate, 'MMMM d, yyyy')}
            {isToday && ' (Today)'}
          </p>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date > new Date()}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Logs {isToday ? 'Today' : 'Selected Date'}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-16 mb-1"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
            ) : error ? (
              <div className="text-destructive text-sm">Error loading data</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{totalLogs.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {statusBreakdown.length} different statuses
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Common Status
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-20 mb-1"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
            ) : statusBreakdown.length > 0 ? (
              <>
                <div className="text-2xl font-bold text-foreground capitalize">
                  {statusBreakdown[0]?.status}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statusBreakdown[0]?.count} logs ({statusBreakdown[0]?.percentage}%)
                </p>
              </>
            ) : (
              <div className="text-muted-foreground text-sm">No data</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status Diversity
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-12 mb-1"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{statusBreakdown.length}</div>
                <p className="text-xs text-muted-foreground">
                  Unique status types
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {!loading && !error && statusBreakdown.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Status Distribution</CardTitle>
              <CardDescription>Breakdown of log statuses by percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                      label={({ status, percentage }) => `${status}: ${percentage}%`}
                      labelLine={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Status Count</CardTitle>
              <CardDescription>Number of logs per status type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="status" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No data state */}
      {!loading && !error && statusBreakdown.length === 0 && (
        <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No logs found</h3>
              <p className="text-muted-foreground">
                No logs were recorded for {format(selectedDate, 'MMMM d, yyyy')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};