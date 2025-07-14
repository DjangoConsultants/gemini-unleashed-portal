import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

interface PurchaseOrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseSupabaseId: string | null;
}

interface SalesOrderLine {
  LineTax?: number;
  Product?: {
    ProductCode?: string;
  };
  LineTotal?: number;
  UnitPrice?: number;
  LineNumber?: number;
  OrderQuantity?: number;
}

interface OrderData {
  Total?: number;
  TaxRate?: number;
  Currency?: {
    CurrencyCode?: string;
  };
  Customer?: {
    CustomerCode?: string;
  };
  SubTotal?: number;
  TaxTotal?: number;
  OrderDate?: string;
  OrderNumber?: string;
  OrderStatus?: string;
  RequiredDate?: string | null;
  SalesOrderLines?: SalesOrderLine[];
}

export const PurchaseOrderDetailsDialog: React.FC<PurchaseOrderDetailsDialogProps> = ({
  open,
  onOpenChange,
  purchaseSupabaseId
}) => {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && purchaseSupabaseId) {
      fetchPurchaseOrderDetails();
    }
  }, [open, purchaseSupabaseId]);

  const fetchPurchaseOrderDetails = async () => {
    if (!purchaseSupabaseId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('purchase_order')
        .select('order_data')
        .eq('id', purchaseSupabaseId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching purchase order:', fetchError);
        setError('Failed to load purchase order details');
        return;
      }

      if (!data || !data.order_data) {
        setError('No purchase order details available');
        return;
      }

      setOrderData(data.order_data as OrderData);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to load purchase order details');
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '?';
    }
    return String(value);
  };

  const formatCurrency = (amount: number | undefined, currencyCode: string | undefined): string => {
    if (amount === undefined || amount === null) return '?';
    return `${formatValue(currencyCode)} ${amount}`;
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading purchase order details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !orderData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            {error || 'No purchase order details available.'}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Purchase Order Details</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Order Overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Order Number</p>
              <p className="text-lg font-semibold">{formatValue(orderData.OrderNumber)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Order Date</p>
              <p className="text-lg">{formatValue(orderData.OrderDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Required Date</p>
              <p className="text-lg">{formatValue(orderData.RequiredDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Customer</p>
              <p className="text-lg">{formatValue(orderData.Customer?.CustomerCode)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant="outline">{formatValue(orderData.OrderStatus)}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tax Rate</p>
              <p className="text-lg">{formatValue(orderData.TaxRate)}%</p>
            </div>
          </div>

          <Separator />

          {/* Financial Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Subtotal</p>
              <p className="text-xl font-semibold">{formatCurrency(orderData.SubTotal, orderData.Currency?.CurrencyCode)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tax Total</p>
              <p className="text-xl">{formatCurrency(orderData.TaxTotal, orderData.Currency?.CurrencyCode)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(orderData.Total, orderData.Currency?.CurrencyCode)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Currency</p>
              <p className="text-xl">{formatValue(orderData.Currency?.CurrencyCode)}</p>
            </div>
          </div>

          <Separator />

          {/* Order Lines */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sales Order Lines</h3>
            {orderData.SalesOrderLines && orderData.SalesOrderLines.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Line</th>
                        <th className="text-left p-3 text-sm font-medium">Product Code</th>
                        <th className="text-right p-3 text-sm font-medium">Quantity</th>
                        <th className="text-right p-3 text-sm font-medium">Unit Price</th>
                        <th className="text-right p-3 text-sm font-medium">Line Total</th>
                        <th className="text-right p-3 text-sm font-medium">Line Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderData.SalesOrderLines.map((line, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 text-sm">{formatValue(line.LineNumber)}</td>
                          <td className="p-3 text-sm font-medium">{formatValue(line.Product?.ProductCode)}</td>
                          <td className="p-3 text-sm text-right">{formatValue(line.OrderQuantity)}</td>
                          <td className="p-3 text-sm text-right">{formatCurrency(line.UnitPrice, orderData.Currency?.CurrencyCode)}</td>
                          <td className="p-3 text-sm text-right font-medium">{formatCurrency(line.LineTotal, orderData.Currency?.CurrencyCode)}</td>
                          <td className="p-3 text-sm text-right">{formatCurrency(line.LineTax, orderData.Currency?.CurrencyCode)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No order lines available</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};