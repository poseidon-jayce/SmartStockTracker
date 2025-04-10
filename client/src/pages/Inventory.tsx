import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import InventoryTable from '@/components/inventory/InventoryTable';
import BarcodeScanner from '@/components/inventory/BarcodeScanner';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Download, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function Inventory() {
  const [locationId, setLocationId] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  
  const { data: locations } = useQuery({
    queryKey: ['/api/locations'],
  });
  
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });
  
  // Extract unique categories from products
  const categories = products ? 
    Array.from(new Set(products.map((product: any) => product.category))) : 
    [];

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-medium">Inventory Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your product inventory across all locations</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="low">Low Stock</TabsTrigger>
          <TabsTrigger value="reorder">Reorder Needed</TabsTrigger>
          <TabsTrigger value="excess">Excess Stock</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter inventory by location, category, or status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium block mb-1">Location</label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations?.map((location: any) => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium block mb-1">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat: string) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium block mb-1">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Any Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Status</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Medium Stock">Medium Stock</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-auto flex items-end">
              <Button variant="outline" className="mb-0 sm:mb-1" onClick={() => {
                setLocationId('all');
                setCategory('all');
                setStatus('all');
              }}>
                <Filter className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <InventoryTable locationId={locationId ? parseInt(locationId) : undefined} />
      
      <BarcodeScanner />
    </>
  );
}
