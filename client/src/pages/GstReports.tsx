import React, { useState } from 'react';
import { Calendar, DownloadCloud, FileText, Filter } from 'lucide-react';

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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Mock data for UI demonstration
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1; // 1-12

const mockGstSummaries = [
  {
    month: 'January',
    year: currentYear,
    outwardSupplies: {
      taxableAmount: 125000.00,
      cgst: 11250.00,
      sgst: 11250.00,
      igst: 4500.00,
      total: 27000.00
    },
    inwardSupplies: {
      taxableAmount: 85000.00,
      cgst: 7650.00,
      sgst: 7650.00,
      igst: 3060.00,
      total: 18360.00
    },
    netTax: {
      cgst: 3600.00,
      sgst: 3600.00,
      igst: 1440.00,
      total: 8640.00
    }
  },
  {
    month: 'February',
    year: currentYear,
    outwardSupplies: {
      taxableAmount: 142000.00,
      cgst: 12780.00,
      sgst: 12780.00,
      igst: 5112.00,
      total: 30672.00
    },
    inwardSupplies: {
      taxableAmount: 92000.00,
      cgst: 8280.00,
      sgst: 8280.00,
      igst: 3312.00,
      total: 19872.00
    },
    netTax: {
      cgst: 4500.00,
      sgst: 4500.00,
      igst: 1800.00,
      total: 10800.00
    }
  },
  {
    month: 'March',
    year: currentYear,
    outwardSupplies: {
      taxableAmount: 165000.00,
      cgst: 14850.00,
      sgst: 14850.00,
      igst: 5940.00,
      total: 35640.00
    },
    inwardSupplies: {
      taxableAmount: 110000.00,
      cgst: 9900.00,
      sgst: 9900.00,
      igst: 3960.00,
      total: 23760.00
    },
    netTax: {
      cgst: 4950.00,
      sgst: 4950.00,
      igst: 1980.00,
      total: 11880.00
    }
  },
  {
    month: 'April',
    year: currentYear,
    outwardSupplies: {
      taxableAmount: 145000.00,
      cgst: 13050.00,
      sgst: 13050.00,
      igst: 5220.00,
      total: 31320.00
    },
    inwardSupplies: {
      taxableAmount: 98000.00,
      cgst: 8820.00,
      sgst: 8820.00,
      igst: 3528.00,
      total: 21168.00
    },
    netTax: {
      cgst: 4230.00,
      sgst: 4230.00,
      igst: 1692.00,
      total: 10152.00
    }
  }
];

// Mock HSN summary data
const mockHsnSummary = [
  {
    hsnCode: '8518',
    description: 'Headphones, earphones and combined microphone/speaker sets',
    uqc: 'NOS',
    totalQuantity: 120,
    totalValue: 35998.80,
    taxableValue: 30507.46,
    integratedTax: 0,
    centralTax: 2745.67,
    stateTax: 2745.67,
    cess: 0
  },
  {
    hsnCode: '8517',
    description: 'Communication apparatus including smart home devices',
    uqc: 'NOS',
    totalQuantity: 85,
    totalValue: 11049.15,
    taxableValue: 9363.69,
    integratedTax: 1685.46,
    centralTax: 0,
    stateTax: 0,
    cess: 0
  },
  {
    hsnCode: '8521',
    description: 'Video recording or reproducing apparatus',
    uqc: 'NOS',
    totalQuantity: 45,
    totalValue: 11249.55,
    taxableValue: 9533.52,
    integratedTax: 0,
    centralTax: 858.02,
    stateTax: 858.02,
    cess: 0
  },
  {
    hsnCode: '9102',
    description: 'Wrist-watches including fitness trackers',
    uqc: 'NOS',
    totalQuantity: 230,
    totalValue: 20697.70,
    taxableValue: 17540.42,
    integratedTax: 0,
    centralTax: 1578.64,
    stateTax: 1578.64,
    cess: 0
  }
];

// Mock B2B invoice data
const mockB2bInvoices = [
  {
    gstin: '27AABCU9603R1ZX',
    name: 'ABC Corporation',
    invoiceNumber: 'INV-2025-001',
    invoiceDate: '05-04-2025',
    invoiceValue: 14750.00,
    placeOfSupply: 'Maharashtra',
    reverseCharge: 'No',
    applicableRate: 18,
    taxableValue: 12500.00,
    cgst: 1125.00,
    sgst: 1125.00,
    igst: 0,
    cess: 0
  },
  {
    gstin: '29AABCU9603R1ZN',
    name: 'XYZ Enterprises',
    invoiceNumber: 'INV-2025-002',
    invoiceDate: '08-04-2025',
    invoiceValue: 10030.00,
    placeOfSupply: 'Karnataka',
    reverseCharge: 'No',
    applicableRate: 18,
    taxableValue: 8500.00,
    cgst: 0,
    sgst: 0,
    igst: 1530.00,
    cess: 0
  },
  {
    gstin: '27AADCT1234R1ZP',
    name: 'Tech Solutions Ltd',
    invoiceNumber: 'INV-2025-003',
    invoiceDate: '10-04-2025',
    invoiceValue: 25960.00,
    placeOfSupply: 'Maharashtra',
    reverseCharge: 'No',
    applicableRate: 18,
    taxableValue: 22000.00,
    cgst: 1980.00,
    sgst: 1980.00,
    igst: 0,
    cess: 0
  }
];

export default function GstReports() {
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  const [selectedTab, setSelectedTab] = useState('summary');
  
  // Find the selected month's data
  const selectedMonthData = mockGstSummaries.find(
    summary => summary.month === getMonthName(parseInt(selectedMonth)) && summary.year.toString() === selectedYear
  );

  // Helper function to get month name
  function getMonthName(monthNumber: number) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[monthNumber - 1];
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">GST Reports</h1>
          <p className="text-gray-500">Generate and review GST reports and filings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">January</SelectItem>
                <SelectItem value="2">February</SelectItem>
                <SelectItem value="3">March</SelectItem>
                <SelectItem value="4">April</SelectItem>
                <SelectItem value="5">May</SelectItem>
                <SelectItem value="6">June</SelectItem>
                <SelectItem value="7">July</SelectItem>
                <SelectItem value="8">August</SelectItem>
                <SelectItem value="9">September</SelectItem>
                <SelectItem value="10">October</SelectItem>
                <SelectItem value="11">November</SelectItem>
                <SelectItem value="12">December</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={(currentYear - 1).toString()}>{currentYear - 1}</SelectItem>
                <SelectItem value={currentYear.toString()}>{currentYear}</SelectItem>
                <SelectItem value={(currentYear + 1).toString()}>{currentYear + 1}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button className="flex items-center gap-2">
            <DownloadCloud size={16} />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Output Tax</CardTitle>
            <CardDescription>Tax collected on sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{selectedMonthData?.outwardSupplies.total.toLocaleString('en-IN') || '0.00'}
            </div>
            <Progress 
              value={70} 
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Input Tax</CardTitle>
            <CardDescription>Tax paid on purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{selectedMonthData?.inwardSupplies.total.toLocaleString('en-IN') || '0.00'}
            </div>
            <Progress 
              value={45} 
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net GST Payable</CardTitle>
            <CardDescription>Final tax liability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{selectedMonthData?.netTax.total.toLocaleString('en-IN') || '0.00'}
            </div>
            <Progress 
              value={60} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Filing Status</CardTitle>
            <CardDescription>GSTR-1 and GSTR-3B</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-yellow-500">Pending</div>
            <div className="text-xs text-gray-500 mt-1">Due on 20th May, 2025</div>
            <Button variant="outline" size="sm" className="mt-2 w-full">
              Mark as Filed
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="summary" onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="summary">GST Summary</TabsTrigger>
          <TabsTrigger value="b2b">B2B Invoices</TabsTrigger>
          <TabsTrigger value="hsn">HSN Summary</TabsTrigger>
          <TabsTrigger value="prepare">Prepare Return</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>GST Summary for {getMonthName(parseInt(selectedMonth))} {selectedYear}</CardTitle>
              <CardDescription>Overview of outward supplies, inward supplies, and net tax</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Outward Supplies (Sales)</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Taxable Value:</span>
                      <span>₹{selectedMonthData?.outwardSupplies.taxableAmount.toLocaleString('en-IN') || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">CGST:</span>
                      <span>₹{selectedMonthData?.outwardSupplies.cgst.toLocaleString('en-IN') || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">SGST:</span>
                      <span>₹{selectedMonthData?.outwardSupplies.sgst.toLocaleString('en-IN') || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">IGST:</span>
                      <span>₹{selectedMonthData?.outwardSupplies.igst.toLocaleString('en-IN') || '0.00'}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>Total:</span>
                      <span>₹{selectedMonthData?.outwardSupplies.total.toLocaleString('en-IN') || '0.00'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4">Inward Supplies (Purchases)</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Taxable Value:</span>
                      <span>₹{selectedMonthData?.inwardSupplies.taxableAmount.toLocaleString('en-IN') || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">CGST:</span>
                      <span>₹{selectedMonthData?.inwardSupplies.cgst.toLocaleString('en-IN') || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">SGST:</span>
                      <span>₹{selectedMonthData?.inwardSupplies.sgst.toLocaleString('en-IN') || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">IGST:</span>
                      <span>₹{selectedMonthData?.inwardSupplies.igst.toLocaleString('en-IN') || '0.00'}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>Total:</span>
                      <span>₹{selectedMonthData?.inwardSupplies.total.toLocaleString('en-IN') || '0.00'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4">Net Tax Liability</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">CGST:</span>
                      <span>₹{selectedMonthData?.netTax.cgst.toLocaleString('en-IN') || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">SGST:</span>
                      <span>₹{selectedMonthData?.netTax.sgst.toLocaleString('en-IN') || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">IGST:</span>
                      <span>₹{selectedMonthData?.netTax.igst.toLocaleString('en-IN') || '0.00'}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>Total GST Payable:</span>
                      <span>₹{selectedMonthData?.netTax.total.toLocaleString('en-IN') || '0.00'}</span>
                    </div>
                    <div className="pt-4">
                      <Button className="w-full">Pay Tax</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="b2b">
          <Card>
            <CardHeader>
              <CardTitle>B2B Invoices</CardTitle>
              <CardDescription>Details of invoices to registered businesses for {getMonthName(parseInt(selectedMonth))} {selectedYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>GSTIN</TableHead>
                      <TableHead>Recipient Name</TableHead>
                      <TableHead>Invoice Number</TableHead>
                      <TableHead>Invoice Date</TableHead>
                      <TableHead>Place of Supply</TableHead>
                      <TableHead>Taxable Value</TableHead>
                      <TableHead>CGST</TableHead>
                      <TableHead>SGST</TableHead>
                      <TableHead>IGST</TableHead>
                      <TableHead>Invoice Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockB2bInvoices.map((invoice, index) => (
                      <TableRow key={index}>
                        <TableCell>{invoice.gstin}</TableCell>
                        <TableCell>{invoice.name}</TableCell>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.invoiceDate}</TableCell>
                        <TableCell>{invoice.placeOfSupply}</TableCell>
                        <TableCell>₹{invoice.taxableValue.toLocaleString('en-IN')}</TableCell>
                        <TableCell>₹{invoice.cgst.toLocaleString('en-IN')}</TableCell>
                        <TableCell>₹{invoice.sgst.toLocaleString('en-IN')}</TableCell>
                        <TableCell>₹{invoice.igst.toLocaleString('en-IN')}</TableCell>
                        <TableCell>₹{invoice.invoiceValue.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <FileText size={14} className="mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hsn">
          <Card>
            <CardHeader>
              <CardTitle>HSN Summary</CardTitle>
              <CardDescription>Product-wise summary by HSN code for {getMonthName(parseInt(selectedMonth))} {selectedYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>HSN Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>UQC</TableHead>
                      <TableHead>Total Quantity</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Taxable Value</TableHead>
                      <TableHead>IGST</TableHead>
                      <TableHead>CGST</TableHead>
                      <TableHead>SGST</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockHsnSummary.map((hsn, index) => (
                      <TableRow key={index}>
                        <TableCell>{hsn.hsnCode}</TableCell>
                        <TableCell>{hsn.description}</TableCell>
                        <TableCell>{hsn.uqc}</TableCell>
                        <TableCell>{hsn.totalQuantity}</TableCell>
                        <TableCell>₹{hsn.totalValue.toLocaleString('en-IN')}</TableCell>
                        <TableCell>₹{hsn.taxableValue.toLocaleString('en-IN')}</TableCell>
                        <TableCell>₹{hsn.integratedTax.toLocaleString('en-IN')}</TableCell>
                        <TableCell>₹{hsn.centralTax.toLocaleString('en-IN')}</TableCell>
                        <TableCell>₹{hsn.stateTax.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="prepare">
          <Card>
            <CardHeader>
              <CardTitle>Prepare GST Return</CardTitle>
              <CardDescription>Ready to file returns for {getMonthName(parseInt(selectedMonth))} {selectedYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <h3 className="text-amber-800 font-semibold flex items-center gap-2">
                    <Calendar size={16} />
                    Filing Due Dates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div className="bg-white p-3 rounded border border-amber-100">
                      <div className="text-sm font-semibold">GSTR-1</div>
                      <div className="text-xs text-gray-500">Outward supplies</div>
                      <div className="text-lg font-bold mt-1">11th May, 2025</div>
                    </div>
                    <div className="bg-white p-3 rounded border border-amber-100">
                      <div className="text-sm font-semibold">GSTR-3B</div>
                      <div className="text-xs text-gray-500">Monthly return and payment</div>
                      <div className="text-lg font-bold mt-1">20th May, 2025</div>
                    </div>
                    <div className="bg-white p-3 rounded border border-amber-100">
                      <div className="text-sm font-semibold">ITC-04</div>
                      <div className="text-xs text-gray-500">Input tax credit for job work</div>
                      <div className="text-lg font-bold mt-1">25th May, 2025</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Pre-filing Checklist</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
                        <span>All invoices recorded</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
                        <span>HSN codes verified</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-amber-400 mr-2"></div>
                        <span>Reconcile with e-way bills</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-red-500 mr-2"></div>
                        <span>Tax calculation verified</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-red-500 mr-2"></div>
                        <span>ITC claims checked</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Return Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Number of Invoices:</span>
                        <span>29</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Taxable Value:</span>
                        <span>₹{(selectedMonthData?.outwardSupplies.taxableAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total GST Collected:</span>
                        <span>₹{(selectedMonthData?.outwardSupplies.total || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total ITC Available:</span>
                        <span>₹{(selectedMonthData?.inwardSupplies.total || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Net GST Liability:</span>
                        <span>₹{(selectedMonthData?.netTax.total || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline">Download JSON for Filing</Button>
                  <Button variant="secondary">Prepare Draft</Button>
                  <Button>Ready to File</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}