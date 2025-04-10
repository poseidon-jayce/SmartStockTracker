import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Mail, Phone, MapPin, MoreVertical, Calendar, CheckCircle, Clock, Truck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Suppliers() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: suppliers, isLoading: isSuppliersLoading } = useQuery({
    queryKey: ['/api/suppliers'],
  });
  
  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['/api/supplier-orders'],
  });

  const { data: activity } = useQuery({
    queryKey: ['/api/supplier-activity'],
  });
  
  // Filter suppliers based on search term
  const filteredSuppliers = suppliers?.filter((supplier: any) => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400';
      case 'confirmed':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'shipped':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'canceled':
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'shipped':
        return <Truck className="h-4 w-4 mr-1" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'canceled':
        return <Clock className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-medium">Supplier Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your suppliers and orders</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
          <Button variant="outline">
            Create Order
          </Button>
        </div>
      </div>

      <Tabs defaultValue="suppliers" className="mb-6">
        <TabsList>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="suppliers" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2">
              <CardTitle className="text-lg">Supplier Directory</CardTitle>
              <div className="mt-2 sm:mt-0 relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search suppliers..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isSuppliersLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800/50 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : filteredSuppliers.length > 0 ? (
                <div className="space-y-4">
                  {filteredSuppliers.map((supplier: any) => (
                    <Card key={supplier.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row md:items-center p-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{supplier.name}</h3>
                          <div className="mt-2 space-y-1">
                            {supplier.contactName && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Contact: {supplier.contactName}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                              {supplier.email && (
                                <div className="flex items-center">
                                  <Mail className="h-3.5 w-3.5 mr-1" />
                                  <span>{supplier.email}</span>
                                </div>
                              )}
                              {supplier.phone && (
                                <div className="flex items-center">
                                  <Phone className="h-3.5 w-3.5 mr-1" />
                                  <span>{supplier.phone}</span>
                                </div>
                              )}
                              {supplier.address && (
                                <div className="flex items-center">
                                  <MapPin className="h-3.5 w-3.5 mr-1" />
                                  <span>{supplier.address}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center">
                          <span className={`px-3 py-1 rounded-full text-sm mr-4 ${supplier.active ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                            {supplier.active ? 'Active' : 'Inactive'}
                          </span>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline">New Order</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>New Order from {supplier.name}</DialogTitle>
                                <DialogDescription>
                                  Create a new order request to send to this supplier.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Order form would go here in a real application.
                                </p>
                              </div>
                              <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button>Create Order</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit Supplier</DropdownMenuItem>
                              <DropdownMenuItem>View Orders</DropdownMenuItem>
                              <DropdownMenuItem>View Products</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Delete Supplier</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No suppliers found.</p>
                  {searchTerm && <p className="text-sm">Try a different search term.</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supplier Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {isOrdersLoading ? (
                <div className="h-96 bg-gray-100 dark:bg-gray-800/50 rounded-lg animate-pulse"></div>
              ) : orders && orders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expected Delivery</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id + 4470}</TableCell>
                        <TableCell>
                          {suppliers?.find((s: any) => s.id === order.supplierId)?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>{formatDate(order.orderDate)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full flex items-center w-fit ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {order.expectedDelivery ? formatDate(order.expectedDelivery) : '-'}
                        </TableCell>
                        <TableCell>{order.items?.length || 0} items</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Order</DropdownMenuItem>
                              <DropdownMenuItem>Update Status</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Cancel Order</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No orders found.</p>
                  <p className="text-sm">Create an order to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Responses</CardTitle>
              </CardHeader>
              <CardContent>
                {activity?.pending && activity.pending.length > 0 ? (
                  <div className="space-y-3">
                    {activity.pending.map((supplier: any) => (
                      <div key={supplier.id} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-primary mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{supplier.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Requested {supplier.requestedAgo}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No pending responses.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Updates</CardTitle>
              </CardHeader>
              <CardContent>
                {activity?.updates && activity.updates.length > 0 ? (
                  <div className="space-y-4">
                    {activity.updates.map((update: any, index: number) => (
                      <div key={index} className="flex">
                        <div className="mr-3 relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center
                            ${update.action.includes('confirmed') ? 'bg-green-100 dark:bg-green-900/20 text-green-600' :
                              update.action.includes('shipped') ? 'bg-blue-100 dark:bg-blue-900/20 text-primary' :
                              'bg-amber-100 dark:bg-amber-900/20 text-amber-600'}`}
                          >
                            {update.action.includes('confirmed') ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : update.action.includes('shipped') ? (
                              <Truck className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                          </div>
                          {index < activity.updates.length - 1 && (
                            <div className="absolute top-8 bottom-0 left-1/2 w-0.5 -ml-px bg-gray-200 dark:bg-gray-700"></div>
                          )}
                        </div>
                        <div className={index < activity.updates.length - 1 ? "pb-4" : ""}>
                          <p className="text-sm">
                            <span className="font-medium">{update.name}</span> {update.action} {update.orderNumber}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{update.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent updates.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
