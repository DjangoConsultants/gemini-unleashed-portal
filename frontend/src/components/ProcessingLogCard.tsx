import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Download, Eye, Clock, Mail, File, Settings, Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { ProcessingLog } from '@/hooks/useProcessingLogs';

interface ProcessingLogCardProps {
  log: ProcessingLog;
  onDownloadAttachment: (log: ProcessingLog) => void;
  isDownloading?: boolean;
  onOrderStatusUpdate?: (logId: string, newStatus: string) => void;
}

export const ProcessingLogCard: React.FC<ProcessingLogCardProps> = ({
  log,
  onDownloadAttachment,
  isDownloading = false,
  onOrderStatusUpdate
}) => {
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      case 'info':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'processing_email':
        return <Mail className="w-4 h-4" />;
      case 'processing_attachments':
        return <File className="w-4 h-4" />;
      case 'ai_parsing':
      case 'parse_json_ai_response':
        return <Settings className="w-4 h-4" />;
      case 'unleashed_sync':
        return <Settings className="w-4 h-4" />;
      case 'customer_sync':
        return <Settings className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const isDetailsDisabled = log.purchase_supabase_id == null;
  const canUpdateOrderStatus = log.purchase_order_guid != null;
  const orderStatuses = ['Parked', 'Placed', 'Backordered'];

  const handleDetailsClick = () => {
    if (isDetailsDisabled) return;
    
    const url = `/purchase-order/${log.purchase_supabase_id}${log.id ? `/${log.id}` : ''}`;
    navigate(url);
  };

  const handleOrderStatusUpdate = async (newStatus: string) => {
    if (!canUpdateOrderStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase.functions.invoke('update-Sales-Orders', {
        body: {
          processingLogId: log.id,
          orderStatus: newStatus,
          purchaseOrderGuid: log.purchase_order_guid || null
        }
      });

      if (error) {
        console.error('Error updating order status:', error);
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });

      // Call the optional callback to refresh data
      log.order_status = newStatus;
      onOrderStatusUpdate?.(log.id, newStatus);

    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-card/95 backdrop-blur hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            {getStageIcon(log.stage)}
            {log.file_name ?? 'N/A'}
          </CardTitle>
          <Badge className={getStatusColor(log.status)} variant="secondary">
            {log.status.toUpperCase()}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimestamp(log._processing_timestamp)}
          </div>
          <div className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {log.from_email}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stage Information */}
        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
          <div>
            <p className="text-sm font-medium text-foreground">Processing Stage</p>
            <p className="text-sm text-muted-foreground capitalize">
              {log.stage.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        {/* Order Status Section */}
        {canUpdateOrderStatus && (
          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Order Status</p>
              <div className="mt-2">
                <Select
                  value={log.order_status || ''}
                  onValueChange={handleOrderStatusUpdate}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {isUpdatingStatus && (
              <Loader className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
        )}

        {/* Collapsible Logs Section */}
        {log.logs && log.logs.length > 0 && (
          <Collapsible open={isLogsOpen} onOpenChange={setIsLogsOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-between hover:bg-accent hover:text-accent-foreground"
              >
                <span>Logs ({log.logs.length})</span>
                {isLogsOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="bg-background/30 rounded-lg p-3 max-h-60 overflow-y-auto border">
                {log.logs.map((logEntry, index) => (
                  <div 
                    key={index} 
                    className="text-sm text-muted-foreground py-1 border-b border-border/30 last:border-b-0"
                  >
                    {logEntry}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleDetailsClick}
            disabled={isDetailsDisabled}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 flex-1"
          >
            <Eye className="w-4 h-4" />
            Details
          </Button>
          
          <Button
            onClick={() => onDownloadAttachment(log)}
            disabled={isDownloading}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2 flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};