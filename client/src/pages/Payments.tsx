import React, { useState } from "react";
import { Calendar, Clock, DollarSign, Filter, Plus, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { format, addDays } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

// Mock data for UI demonstration
const mockPayments = [
  {
    id: 1,
    entityType: "invoice",
    entityId: 1,
    entityName: "ABC Corporation",
    entityReference: "INV-2025-001",
    amount: 14750.00,
    paymentDate: new Date('2025-04-07'),
    paymentMethod: "bank_transfer",
    reference: "NEFT12345678",
    notes: "Full payment received"
  },
  {
    id: 2,
    entityType: "supplierOrder",
    entityId: 3,
    entityName: "Electronics Wholesale",
    entityReference: "PO-2025-003",
    amount: 8500.00,
    paymentDate: new Date('2025-04-05'),
    paymentMethod: "check",
    reference: "CHK002546",
    notes: "Payment for March supplies"
  },
  {
    id: 3,
    entityType: "invoice",
    entityId: 3,
    entityName: "Tech Solutions Ltd",
    entityReference: "INV-2025-003",
    amount: 15000.00,
    paymentDate: new Date('2025-04-08'),
    paymentMethod: "credit_card",
    reference: "TXID45678901",
    notes: "Partial payment"
  }
];

// Mock data for upcoming payments
const mockUpcomingPayments = [
  {
    id: 1,
    entityType: "invoice",
    entityId: 2,
    entityName: "XYZ Enterprises",
    entityReference: "INV-2025-002",
    amount: 10030.00,
    dueDate: addDays(new Date(), 5),
    daysRemaining: 5,
    status: "unpaid"
  },
  {
    id: 2,
    entityType: "supplierOrder",
    entityId: 1,
    entityName: "Tech Distributors Inc.",
    entityReference: "PO-2025-001",
    amount: 4550.00,
    dueDate: addDays(new Date(), 2),
    daysRemaining: 2,
    status: "pending"
  },
  {
    id: 3,
    entityType: "invoice",
    entityId: 3,
    entityName: "Tech Solutions Ltd",
    entityReference: "INV-2025-003",
    amount: 10960.00,
    dueDate: addDays(new Date(), -2),
    daysRemaining: -2,
    status: "partial"
  },
  {
    id: 4,
    entityType: "supplierOrder",
    entityId: 2,
    entityName: "Global Gadget Supply",
    entityReference: "PO-2025-002",
    amount: 12500.00,
    dueDate: addDays(new Date(), 10),
    daysRemaining: 10,
    status: "pending"
  }
];

// Mock payment summary
const mockSummary = {
  toPay: 17050.00,
  toReceive: 20990.00,
  overdueCount: 1
};

export default function Payments() {
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [filterEntity, setFilterEntity] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [paymentType, setPaymentType] = useState("receive"); // 'receive' or 'pay'

  // Filter payments based on selected filters
  const filteredPayments = mockPayments.filter(payment => {
    if (filterEntity !== "all" && payment.entityType !== filterEntity) {
      return false;
    }
    if (filterMethod !== "all" && payment.paymentMethod !== filterMethod) {
      return false;
    }
    return true;
  });

  // Filter upcoming payments by type (to pay/to receive)
  const toPayPayments = mockUpcomingPayments.filter(payment => 
    payment.entityType === "supplierOrder"
  );
  
  const toReceivePayments = mockUpcomingPayments.filter(payment => 
    payment.entityType === "invoice"
  );

  // Helper function to render the payment method
  const renderPaymentMethod = (method: string) => {
    switch(method) {
      case "bank_transfer":
        return "Bank Transfer";
      case "check":
        return "Check";
      case "credit_card":
        return "Credit Card";
      case "cash":
        return "Cash";
      case "upi":
        return "UPI";
      default:
        return method;
    }
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    switch(status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "unpaid":
        return <Badge className="bg-red-500">Unpaid</Badge>;
      case "partial":
        return <Badge className="bg-yellow-500">Partial</Badge>;
      case "pending":
        return <Badge className="bg-blue-500">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Function to get amount card class based on days remaining
  const getDueDateClass = (daysRemaining: number) => {
    if (daysRemaining < 0) {
      return "text-red-500 font-bold";
    } else if (daysRemaining <= 3) {
      return "text-amber-500 font-bold";
    } else {
      return "text-gray-700";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-gray-500">Track and manage all payments</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setPaymentType("receive"); 
              setIsCreateDialogOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <TrendingUp size={16} />
            Record Incoming
          </Button>
          <Button 
            onClick={() => {
              setPaymentType("pay"); 
              setIsCreateDialogOpen(true);
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <TrendingDown size={16} />
            Record Outgoing
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">To Receive</CardTitle>
            <CardDescription>Outstanding customer payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{mockSummary.toReceive.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">From {toReceivePayments.length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">To Pay</CardTitle>
            <CardDescription>Due to suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{mockSummary.toPay.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">For {toPayPayments.length} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <CardDescription>Payments past due date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {mockSummary.overdueCount}
            </div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming Payments</TabsTrigger>
          <TabsTrigger value="payment-history">Payment History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Upcoming Payments</CardTitle>
                  <CardDescription>
                    Payments due in the next 30 days
                  </CardDescription>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="receive">To Receive</SelectItem>
                    <SelectItem value="pay">To Pay</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUpcomingPayments.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.entityReference}</TableCell>
                      <TableCell>{payment.entityName}</TableCell>
                      <TableCell>
                        {payment.entityType === "invoice" ? 
                          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">To Receive</Badge> : 
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">To Pay</Badge>
                        }
                      </TableCell>
                      <TableCell className={getDueDateClass(payment.daysRemaining)}>
                        {format(payment.dueDate, 'MMM dd, yyyy')}
                        <div className="text-xs">
                          {payment.daysRemaining < 0 
                            ? `${Math.abs(payment.daysRemaining)} days overdue` 
                            : payment.daysRemaining === 0 
                              ? "Due today"
                              : `${payment.daysRemaining} days remaining`
                          }
                        </div>
                      </TableCell>
                      <TableCell>{renderStatusBadge(payment.status)}</TableCell>
                      <TableCell>₹{payment.amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setPaymentType(payment.entityType === "invoice" ? "receive" : "pay");
                            setIsCreateDialogOpen(true);
                          }}
                        >
                          Record Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment-history">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    Record of all payments
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filterEntity} onValueChange={setFilterEntity}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Entities</SelectItem>
                      <SelectItem value="invoice">Invoices</SelectItem>
                      <SelectItem value="supplierOrder">Supplier Orders</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterMethod} onValueChange={setFilterMethod}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference #</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell>{format(payment.paymentDate, 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{payment.entityReference}</TableCell>
                      <TableCell>{payment.entityName}</TableCell>
                      <TableCell>
                        {payment.entityType === "invoice" ? 
                          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Received</Badge> : 
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Paid</Badge>
                        }
                      </TableCell>
                      <TableCell>{renderPaymentMethod(payment.paymentMethod)}</TableCell>
                      <TableCell>{payment.reference}</TableCell>
                      <TableCell>₹{payment.amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>{payment.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Payment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {paymentType === "receive" ? "Record Incoming Payment" : "Record Outgoing Payment"}
            </DialogTitle>
            <DialogDescription>
              {paymentType === "receive" 
                ? "Record a payment received from a customer" 
                : "Record a payment made to a supplier"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="entityType">
                {paymentType === "receive" ? "Select Invoice" : "Select Supplier Order"}
              </Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {paymentType === "receive" ? (
                    <>
                      <SelectItem value="1">INV-2025-002 - XYZ Enterprises (₹10,030.00)</SelectItem>
                      <SelectItem value="2">INV-2025-003 - Tech Solutions Ltd (₹10,960.00)</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="1">PO-2025-001 - Tech Distributors Inc. (₹4,550.00)</SelectItem>
                      <SelectItem value="2">PO-2025-002 - Global Gadget Supply (₹12,500.00)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input id="amount" className="pl-8" placeholder="0.00" type="number" step="0.01" min="0" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  id="paymentDate" 
                  className="pl-8" 
                  type="date" 
                  defaultValue={format(new Date(), 'yyyy-MM-dd')} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup defaultValue="bank_transfer">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label htmlFor="bank_transfer">Bank Transfer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="check" id="check" />
                    <Label htmlFor="check">Check</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <Label htmlFor="credit_card">Credit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash">Cash</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi">UPI</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number</Label>
              <Input id="reference" placeholder="Transaction ID, Check #, etc." />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Add any additional details..." />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}