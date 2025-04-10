import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useBarcodeReader, SAMPLE_BARCODES } from '@/lib/barcodeScanner';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, Package, ArrowRight, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ScanInventory() {
  const [locationId, setLocationId] = useState<string>('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [quantityChange, setQuantityChange] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedProducts, setScannedProducts] = useState<any[]>([]);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: locations } = useQuery({
    queryKey: ['/api/locations'],
  });
  
  const { startScanning, stopScanning, mockScan } = useBarcodeReader({
    onScan: (barcode) => {
      handleBarcodeScanned(barcode);
    },
    onError: (error) => {
      setScanError(error.message);
    }
  });
  
  const handleBarcodeScanned = async (barcode: string) => {
    if (!locationId) {
      setScanError('Please select a location first');
      return;
    }
    
    setScanError(null);
    setIsProcessing(true);
    
    try {
      const response = await apiRequest('POST', '/api/inventory/scan', {
        barcode,
        locationId: parseInt(locationId),
        quantityChange
      });
      
      const data = await response.json();
      
      // Add to scanned products list
      setScannedProducts(prev => [
        {
          ...data,
          timestamp: new Date(),
          quantityChange
        },
        ...prev
      ]);
      
      toast({
        title: 'Inventory Updated',
        description: `${data.product.name} quantity ${quantityChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(quantityChange)}`,
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      // Reset form for next scan
      setManualBarcode('');
    } catch (error: any) {
      setScanError(error.message || 'Failed to process barcode');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to process barcode',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode) {
      handleBarcodeScanned(manualBarcode);
    }
  };
  
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-medium">Scan Inventory</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Scan barcodes to update inventory quantities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scan Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select 
                    value={locationId} 
                    onValueChange={setLocationId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations?.map((location: any) => (
                        <SelectItem key={location.id} value={location.id.toString()}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity Change</label>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setQuantityChange(prev => prev - 1)}
                      disabled={quantityChange <= -100}
                    >
                      -
                    </Button>
                    <Input 
                      type="number" 
                      value={quantityChange} 
                      onChange={(e) => setQuantityChange(parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setQuantityChange(prev => prev + 1)}
                      disabled={quantityChange >= 100}
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Barcode</label>
                  <form onSubmit={handleManualSubmit} className="flex space-x-2">
                    <Input 
                      placeholder="Enter barcode manually" 
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                    />
                    <Button type="submit" disabled={!manualBarcode || isProcessing}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Camera Scan</label>
                  <div className="flex flex-col items-center border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="w-full h-48 bg-white dark:bg-gray-700 rounded mb-4 flex items-center justify-center">
                      <QrCode className="h-10 w-10 text-gray-400" />
                    </div>
                    <Button 
                      onClick={() => {
                        if (!locationId) {
                          setScanError('Please select a location first');
                          return;
                        }
                        // Demo scanner - shows sample barcodes to choose from
                        startScanning();
                        
                        // Display sample barcodes for demo purposes
                        setScanError('Demo Mode: Select a sample barcode below');
                      }}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      Start Scanner
                    </Button>
                  </div>
                </div>
                
                {scanError && (
                  <div className={`p-3 rounded-md ${scanError.includes('Demo Mode') ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                    <div className="flex items-start">
                      {!scanError.includes('Demo Mode') && <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />}
                      <p className={`text-sm ${scanError.includes('Demo Mode') ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>{scanError}</p>
                    </div>
                    
                    {/* Sample barcode selection (for demo purposes) */}
                    {scanError.includes('Demo Mode') && (
                      <div className="mt-2 space-y-2">
                        {SAMPLE_BARCODES.map((item, index) => (
                          <Button 
                            key={index} 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-between"
                            onClick={() => mockScan(item.barcode)}
                          >
                            <span>{item.product}</span>
                            <span className="text-xs text-gray-500">{item.barcode}</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scan History</CardTitle>
            </CardHeader>
            <CardContent>
              {scannedProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Quantity Change</TableHead>
                      <TableHead>New Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scannedProducts.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center mr-3 text-gray-500">
                              <Package className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{item.product.name}</div>
                              <div className="text-xs text-gray-500">{item.product.sku}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatTimestamp(item.timestamp)}</TableCell>
                        <TableCell className={item.quantityChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {item.quantityChange >= 0 ? '+' : ''}{item.quantityChange}
                        </TableCell>
                        <TableCell>{item.inventory.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No scanned items yet</p>
                  <p className="text-sm">Scan a barcode to update inventory</p>
                </div>
              )}
              
              {scannedProducts.length > 0 && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setScannedProducts([])}
                >
                  Clear History
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
