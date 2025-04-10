import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductWithInventory } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MoreVertical, Plus } from 'lucide-react';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface InventoryTableProps {
  locationId?: number;
}

export default function InventoryTable({ locationId }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: inventoryData, isLoading } = useQuery<ProductWithInventory[]>({
    queryKey: ['/api/inventory', locationId],
    ...(locationId 
      ? { queryKey: ['/api/inventory', { locationId }] }
      : { queryKey: ['/api/inventory'] })
  });

  // Filter items based on search term
  const filteredItems = inventoryData?.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get product icon based on category
  const getProductIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'electronics':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'smart home':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'photography':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'wearables':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
    }
  };

  // Get status classes
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Low Stock':
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      case 'Medium Stock':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400';
      case 'In Stock':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between pb-2">
        <CardTitle className="text-lg font-medium mb-4 md:mb-0">Inventory Overview</CardTitle>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search items..."
              className="pr-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <Button className="flex items-center justify-center">
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Product Name</TableHead>
                <TableHead className="font-medium">SKU</TableHead>
                <TableHead className="font-medium">Category</TableHead>
                <TableHead className="font-medium">In Stock</TableHead>
                <TableHead className="font-medium">Reorder Point</TableHead>
                <TableHead className="font-medium">Unit Price</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="text-right font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={8}>
                      <div className="h-10 bg-gray-100 dark:bg-gray-800/50 rounded animate-pulse"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center mr-3 text-gray-500">
                          {getProductIcon(item.category)}
                        </div>
                        <span>{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className={
                      item.status === 'Low Stock' 
                        ? 'text-red-600 dark:text-red-400 font-medium' 
                        : item.status === 'Medium Stock'
                          ? 'text-amber-600 dark:text-amber-400 font-medium'
                          : 'text-green-600 dark:text-green-400 font-medium'
                    }>
                      {item.quantity}
                    </TableCell>
                    <TableCell>{item.reorderPoint}</TableCell>
                    <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusClasses(item.status)}`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Item</DropdownMenuItem>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Update Stock</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete Item</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                    {searchTerm ? 'No items match your search.' : 'No inventory items found.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredItems.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between mt-6">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => {
                  // Show first page, last page, and pages around current page
                  if (
                    i === 0 || 
                    i === totalPages - 1 || 
                    (i >= currentPage - 2 && i <= currentPage)
                  ) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(i + 1);
                          }}
                          isActive={currentPage === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  
                  // Show ellipsis for skipped pages
                  if (
                    (i === 1 && currentPage > 3) || 
                    (i === totalPages - 2 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink href="#" onClick={(e) => e.preventDefault()}>
                          ...
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  
                  return null;
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
