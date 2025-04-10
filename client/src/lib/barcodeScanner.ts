import { useState, useEffect, useCallback } from 'react';

interface BarcodeResult {
  barcode: string;
  format?: string;
}

interface UseBarcodeReaderOptions {
  onScan?: (barcode: string) => void;
  onError?: (error: Error) => void;
}

export function useBarcodeReader({ onScan, onError }: UseBarcodeReaderOptions = {}) {
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Mock barcode detection for development (since we can't use a real camera)
  const startScanning = useCallback(() => {
    setScanning(true);
    setBarcode(null);
    setError(null);
  }, []);

  const stopScanning = useCallback(() => {
    setScanning(false);
  }, []);

  const mockScan = useCallback((barcode: string) => {
    if (scanning) {
      setBarcode(barcode);
      onScan?.(barcode);
      setScanning(false);
    } else {
      setError(new Error("Scanner is not active"));
      onError?.(new Error("Scanner is not active"));
    }
  }, [scanning, onScan, onError]);

  // In a real app with camera access, we would use the Barcode Detection API
  // or a library like Quagga.js, but for this example, we'll use a mock
  
  return {
    scanning,
    barcode,
    error,
    startScanning,
    stopScanning,
    mockScan, // This would not be exposed in a real implementation
  };
}

// For manual barcode entry
export function validateBarcode(barcode: string): boolean {
  // Basic validation for common barcode formats
  // UPC-A: 12 digits
  // EAN-13: 13 digits
  // Code 128: Variable length alphanumeric
  
  // Check if it's a UPC-A or EAN-13
  if (/^\d{12,13}$/.test(barcode)) {
    return true;
  }
  
  // Check if it's a Code 128 (allowing alphanumeric)
  if (/^[A-Za-z0-9]{6,}$/.test(barcode)) {
    return true;
  }
  
  return false;
}

export function formatBarcode(barcode: string): string {
  // Format for display purposes based on barcode type
  if (/^\d{12}$/.test(barcode)) {
    // UPC-A: Format as XXXX-XXXX-XXXX
    return barcode.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  
  if (/^\d{13}$/.test(barcode)) {
    // EAN-13: Format as X-XXXXXX-XXXXXX
    return barcode.replace(/(\d{1})(\d{6})(\d{6})/, '$1-$2-$3');
  }
  
  return barcode;
}

// For testing purposes, simulate barcode scanning with sample barcodes
export const SAMPLE_BARCODES = [
  { barcode: '1234567890123', product: 'Premium Wireless Headphones' },
  { barcode: '2345678901234', product: 'Smart Home Hub' },
  { barcode: '3456789012345', product: '4K Action Camera' },
  { barcode: '4567890123456', product: 'Fitness Tracker Watch' },
  { barcode: '5678901234567', product: 'Tablet Pro 11"' },
];
