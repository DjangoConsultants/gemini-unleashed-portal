import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

export const PurchaseOrderDetails: React.FC = () => {
  const { purchaseSupabaseId, processingLogId } = useParams<{
    purchaseSupabaseId: string;
    processingLogId?: string;
  }>();
  const navigate = useNavigate();
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    if (purchaseSupabaseId) {
      fetchPurchaseOrderDetails();
    }
    if (processingLogId) {
      fetchPdfFile();
    }
  }, [purchaseSupabaseId, processingLogId]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

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

  const fetchPdfFile = async () => {
    if (!processingLogId) return;

    setPdfLoading(true);
    setPdfError(null);

    try {
      const { data: fileRecord, error: fileQueryError } = await supabase
        .from('purchase_file')
        .select('file_path, file_name')
        .eq('processing_logs_id', processingLogId)
        .maybeSingle();

      if (fileQueryError) {
        console.error('Error querying purchase_file:', fileQueryError);
        setPdfError('Failed to load PDF file information');
        return;
      }

      if (!fileRecord) {
        setPdfError('No PDF file associated with this order');
        return;
      }

      const { data: fileData, error: downloadError } = await supabase.storage
        .from('uploads')
        .download(fileRecord.file_name);

      if (downloadError) {
        console.error('Error downloading PDF:', downloadError);
        setPdfError('Failed to load PDF file');
        return;
      }

      if (!fileData) {
        setPdfError('PDF file not found');
        return;
      }

      const url = URL.createObjectURL(fileData);
      setPdfUrl(url);

    } catch (error) {
      console.error('Unexpected error during PDF fetch:', error);
      setPdfError('Failed to load PDF file');
    } finally {
      setPdfLoading(false);
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold">Purchase Order Details</h1>
          </div>
          <div className="flex items-center justify-center py-16">
            <Loader className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading purchase order details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold">Purchase Order Details</h1>
          </div>
          <div className="text-center py-16 text-muted-foreground">
            {error || 'No purchase order details available.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Purchase Order Details</h1>
        </div>
        

        {/* Main Content */}
        <div className="flex gap-6 h-[calc(100vh-160px)]">
          {/* Left side - Order Details */}
          {processingLogId && (
            <div className="w-1/2 border-l pl-6 flex flex-col">
              {/* <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Associated PDF</h3>
              </div> */}
              
              {pdfLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading PDF...</span>
                </div>
              )}

              {pdfError && (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>{pdfError}</span>
                </div>
              )}

              {pdfUrl && !pdfLoading && !pdfError && (
                <div className="flex-1 border rounded-lg overflow-hidden bg-card">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full"
                    title="Purchase Order PDF"
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Right side - PDF Viewer */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-4">
            {/* Order Overview */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
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
            </div>

            {/* Financial Summary */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
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
            </div>

            {/* Order Lines */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
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

        </div>
      </div>
    </div>
  );
};