import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Store, Warehouse, ArrowUpDown, MoreVertical } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Locations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const { data: locations, isLoading } = useQuery({
    queryKey: ['/api/locations'],
  });
  
  const { data: inventoryData } = useQuery({
    queryKey: ['/api/inventory'],
  });
  
  // Filter locations based on search term
  const filteredLocations = locations?.filter((location: any) => 
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  // Sort locations
  const sortedLocations = [...filteredLocations].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a[sortBy].localeCompare(b[sortBy]);
    } else {
      return b[sortBy].localeCompare(a[sortBy]);
    }
  });
  
  // Toggle sort
  const toggleSort = (column: 'name' | 'type') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };
  
  // Get location icon
  const getLocationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'warehouse':
        return <Warehouse className="h-5 w-5" />;
      case 'store':
        return <Store className="h-5 w-5" />;
      default:
        return <Store className="h-5 w-5" />;
    }
  };
  
  // Get inventory count for location
  const getInventoryCount = (locationId: number) => {
    if (!inventoryData) return 0;
    return inventoryData.filter((item: any) => item.locationId === locationId).length;
  };
  
  // Get inventory value for location
  const getInventoryValue = (locationId: number) => {
    if (!inventoryData) return 0;
    return inventoryData
      .filter((item: any) => item.locationId === locationId)
      .reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
  };

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-medium">Location Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your warehouses and stores</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Location</DialogTitle>
                <DialogDescription>
                  Enter the details for the new location.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location Name</label>
                  <Input placeholder="e.g., Warehouse B" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md">
                    <option value="warehouse">Warehouse</option>
                    <option value="store">Store</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input placeholder="Enter full address" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Create Location</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2">
          <CardTitle className="text-lg">Locations</CardTitle>
          <div className="mt-2 sm:mt-0 relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search locations..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800/50 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : sortedLocations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => toggleSort('name')}
                    >
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => toggleSort('type')}
                    >
                      Type
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLocations.map((location: any) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 mr-2">
                          {getLocationIcon(location.type)}
                        </div>
                        <span className="capitalize">{location.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{location.address || '-'}</TableCell>
                    <TableCell>{getInventoryCount(location.id)} items</TableCell>
                    <TableCell>${getInventoryValue(location.id).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Location</DropdownMenuItem>
                          <DropdownMenuItem>View Inventory</DropdownMenuItem>
                          <DropdownMenuItem>Manage Transfers</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete Location</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Warehouse className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No locations found.</p>
              {searchTerm && <p className="text-sm">Try a different search term.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
