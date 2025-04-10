import { useState } from 'react';
import { useBarcodeReader, SAMPLE_BARCODES } from '@/lib/barcodeScanner';
import { Button } from '@/components/ui/button';
import { QrCode, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function BarcodeScanner() {
  const [open, setOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [locationId, setLocationId] = useState<string>('');
  const [quantityChange, setQuantityChange] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  
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
      setScannedProduct(data);
      
      toast({
        title: 'Inventory Updated',
        description: `${data.product.name} quantity ${quantityChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(quantityChange)}`,
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      // Reset form for next scan
      setManualBarcode('');
      setQuantityChange(1);
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

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-10 rounded-full w-14 h-14 p-0">
            <QrCode className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Inventory</DialogTitle>
            <DialogDescription>
              Scan a barcode or enter the code manually to update inventory.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
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
                  Submit
                </Button>
              </form>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Camera Scan</label>
              <div className="flex justify-center items-center border border-gray-200 dark:border-gray-700 rounded-md h-32 bg-gray-50 dark:bg-gray-800">
                {/* In a real app this would use a camera with barcode detection */}
                <div className="text-center">
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
                  >
                    Start Scanner
                  </Button>
                </div>
              </div>
              
              {/* Sample barcode selection (for demo purposes) */}
              {scanError && scanError.includes('Demo Mode') && (
                <div className="mt-2 p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Demo: Select a product to scan
                  </p>
                  <div className="space-y-2">
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
                </div>
              )}
            </div>
            
            {scanError && !scanError.includes('Demo Mode') && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{scanError}</p>
              </div>
            )}
            
            {scannedProduct && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <h4 className="font-medium text-green-600 dark:text-green-400">Product Scanned</h4>
                <p className="text-sm">{scannedProduct.product.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  New quantity: {scannedProduct.inventory.quantity}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                stopScanning();
                setOpen(false);
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
            <Button 
              onClick={() => {
                setScannedProduct(null);
                setScanError(null);
                setManualBarcode('');
              }}
              variant="ghost"
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
