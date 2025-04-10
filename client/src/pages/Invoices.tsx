import React, { useState } from 'react';
import { PlusCircle, FileText, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for UI demonstration
const mockInvoices = [
  {
    id: 1,
    invoiceNumber: 'INV-2025-001',
    customerName: 'ABC Corporation',
    customerGstin: '27AABCU9603R1ZX',
    invoiceDate: new Date('2025-04-05'),
    dueDate: new Date('2025-05-05'),
    subtotal: 12500.00,
    cgstAmount: 1125.00,
    sgstAmount: 1125.00,
    igstAmount: 0,
    totalAmount: 14750.00,
    status: 'paid'
  },
  {
    id: 2,
    invoiceNumber: 'INV-2025-002',
    customerName: 'XYZ Enterprises',
    customerGstin: '29AABCU9603R1ZN',
    invoiceDate: new Date('2025-04-08'),
    dueDate: new Date('2025-05-08'),
    subtotal: 8500.00,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 1530.00,
    totalAmount: 10030.00,
    status: 'unpaid'
  },
  {
    id: 3,
    invoiceNumber: 'INV-2025-003',
    customerName: 'Tech Solutions Ltd',
    customerGstin: '27AADCT1234R1ZP',
    invoiceDate: new Date('2025-04-10'),
    dueDate: new Date('2025-05-10'),
    subtotal: 22000.00,
    cgstAmount: 1980.00,
    sgstAmount: 1980.00,
    igstAmount: 0,
    totalAmount: 25960.00,
    status: 'partial'
  }
];

// Mock data for invoice items
const mockInvoiceItems = [
  {
    id: 1,
    invoiceId: 1,
    productId: 1,
    productName: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    quantity: 10,
    unitPrice: 299.99,
    hsnCode: '8518',
    gstRate: 18,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 0,
    amount: 2999.90,
    totalAmount: 3539.88
  },
  {
    id: 2,
    invoiceId: 1,
    productId: 2,
    productName: 'Smart Home Hub',
    description: 'Central hub for controlling smart home devices',
    quantity: 15,
    unitPrice: 129.99,
    hsnCode: '8517',
    gstRate: 18,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 0,
    amount: 1949.85,
    totalAmount: 2300.82
  }
];

export default function Invoices() {
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter invoices based on selected tab and status filter
  const filteredInvoices = mockInvoices.filter(invoice => {
    if (statusFilter !== 'all' && invoice.status !== statusFilter) {
      return false;
    }
    
    if (selectedTab === 'all') return true;
    if (selectedTab === 'recent') {
      // Show invoices from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return invoice.invoiceDate >= thirtyDaysAgo;
    }
    if (selectedTab === 'unpaid') {
      return invoice.status === 'unpaid' || invoice.status === 'partial';
    }
    
    return true;
  });

  // Get the selected invoice details
  const invoiceDetail = selectedInvoice ? mockInvoices.find(inv => inv.id === selectedInvoice) : null;
  const invoiceItems = selectedInvoice ? mockInvoiceItems.filter(item => item.invoiceId === selectedInvoice) : [];

  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'unpaid':
        return <Badge className="bg-red-500">Unpaid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500">Partially Paid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-gray-500">Create, manage, and track customer invoices</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} />
            New Invoice
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockInvoices.length}</div>
            <p className="text-xs text-muted-foreground">For current financial year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{mockInvoices
                .filter(inv => inv.status === 'paid')
                .reduce((sum, inv) => sum + inv.totalAmount, 0)
                .toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{mockInvoices
                .filter(inv => inv.status !== 'paid')
                .reduce((sum, inv) => sum + inv.totalAmount, 0)
                .toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">From {mockInvoices.filter(inv => inv.status !== 'paid').length} invoices</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Tabs defaultValue="all" onValueChange={setSelectedTab}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All Invoices</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partially Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map(invoice => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{format(invoice.invoiceDate, 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{format(invoice.dueDate, 'MMM dd, yyyy')}</TableCell>
                        <TableCell>₹{invoice.totalAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{renderStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice.id)}
                            className="flex items-center gap-1"
                          >
                            <FileText size={14} />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recent" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map(invoice => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{format(invoice.invoiceDate, 'MMM dd, yyyy')}</TableCell>
                        <TableCell>₹{invoice.totalAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{renderStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice.id)}
                            className="flex items-center gap-1"
                          >
                            <FileText size={14} />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="unpaid" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map(invoice => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{format(invoice.dueDate, 'MMM dd, yyyy')}</TableCell>
                        <TableCell>₹{invoice.totalAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{renderStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice.id)}
                            className="flex items-center gap-1"
                          >
                            <FileText size={14} />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invoice Detail Dialog */}
      {invoiceDetail && (
        <Dialog open={selectedInvoice !== null} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Invoice #{invoiceDetail.invoiceNumber}</DialogTitle>
              <DialogDescription>
                Invoice details and items for {invoiceDetail.customerName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <h3 className="font-semibold">Invoice Information</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Invoice Number:</span>
                    <span>{invoiceDetail.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span>{format(invoiceDetail.invoiceDate, 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Due Date:</span>
                    <span>{format(invoiceDetail.dueDate, 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span>{renderStatusBadge(invoiceDetail.status)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold">Customer Information</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span>{invoiceDetail.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">GSTIN:</span>
                    <span>{invoiceDetail.customerGstin}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>HSN</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">GST %</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.hsnCode}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">₹{item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{item.gstRate}%</TableCell>
                      <TableCell className="text-right">₹{item.totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-end mt-4">
              <div className="w-1/3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{invoiceDetail.subtotal.toFixed(2)}</span>
                </div>
                {invoiceDetail.cgstAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>CGST:</span>
                    <span>₹{invoiceDetail.cgstAmount.toFixed(2)}</span>
                  </div>
                )}
                {invoiceDetail.sgstAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>SGST:</span>
                    <span>₹{invoiceDetail.sgstAmount.toFixed(2)}</span>
                  </div>
                )}
                {invoiceDetail.igstAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>IGST:</span>
                    <span>₹{invoiceDetail.igstAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>₹{invoiceDetail.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline">Record Payment</Button>
              <Button variant="secondary">Print Invoice</Button>
              <Button>Download PDF</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Enter invoice details and add products to create a new invoice.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input id="customerName" placeholder="Enter customer name" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerGstin">Customer GSTIN</Label>
                <Input id="customerGstin" placeholder="Enter GSTIN" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerState">Customer State</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MH">Maharashtra</SelectItem>
                    <SelectItem value="KA">Karnataka</SelectItem>
                    <SelectItem value="TN">Tamil Nadu</SelectItem>
                    <SelectItem value="DL">Delhi</SelectItem>
                    <SelectItem value="GJ">Gujarat</SelectItem>
                    {/* Add other states */}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input id="invoiceNumber" placeholder="Auto-generated" disabled />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date</Label>
                <Input id="invoiceDate" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" defaultValue={format(new Date(new Date().setDate(new Date().getDate() + 30)), 'yyyy-MM-dd')} />
              </div>
            </div>
          </div>
          
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Invoice Items</h3>
              <Button variant="outline" size="sm">Add Item</Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">GST %</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Premium Wireless Headphones</SelectItem>
                        <SelectItem value="2">Smart Home Hub</SelectItem>
                        <SelectItem value="3">4K Action Camera</SelectItem>
                        <SelectItem value="4">Fitness Tracker Watch</SelectItem>
                        <SelectItem value="5">Tablet Pro 11"</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input type="number" min="1" defaultValue="1" className="text-right" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" min="0" defaultValue="299.99" className="text-right" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" min="0" defaultValue="18" className="text-right" disabled />
                  </TableCell>
                  <TableCell className="text-right">₹353.99</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-red-500">Remove</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end mt-4">
            <div className="w-1/3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹299.99</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>CGST (9%):</span>
                <span>₹27.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>SGST (9%):</span>
                <span>₹27.00</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total:</span>
                <span>₹353.99</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button>Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}