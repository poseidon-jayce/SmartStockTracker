import React, { useState } from 'react';
import { ArrowRight, Calendar, Filter, Search, TrendingUp, TrendingDown } from 'lucide-react';
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

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

// Mock data for UI demonstration
const mockRevaluations = [
  {
    id: 1,
    productId: 1,
    productName: 'Premium Wireless Headphones',
    oldPrice: 299.99,
    newPrice: 329.99,
    revaluationDate: new Date('2025-04-02'),
    reason: 'Supply chain cost increase of 10%',
    userId: 1,
    userName: 'John Doe'
  },
  {
    id: 2,
    productId: 2,
    productName: 'Smart Home Hub',
    oldPrice: 129.99,
    newPrice: 119.99,
    revaluationDate: new Date('2025-04-05'),
    reason: 'Competitive pricing adjustment',
    userId: 1,
    userName: 'John Doe'
  },
  {
    id: 3,
    productId: 3,
    productName: '4K Action Camera',
    oldPrice: 249.99,
    newPrice: 279.99,
    revaluationDate: new Date('2025-04-10'),
    reason: 'Component cost increase due to chip shortage',
    userId: 1,
    userName: 'John Doe'
  }
];

// Mock products for dropdown
const mockProducts = [
  { id: 1, name: 'Premium Wireless Headphones', sku: 'WH-1000XM5', unitPrice: 329.99 },
  { id: 2, name: 'Smart Home Hub', sku: 'SHH-200', unitPrice: 119.99 },
  { id: 3, name: '4K Action Camera', sku: 'AC-4K-PRO', unitPrice: 279.99 },
  { id: 4, name: 'Fitness Tracker Watch', sku: 'FTW-350', unitPrice: 89.99 },
  { id: 5, name: 'Tablet Pro 11"', sku: 'TP-11-2023', unitPrice: 499.99 }
];

// Revaluation summary stats
const mockSummaryStats = {
  averageIncrease: 10.0,  // Percentage
  totalRevaluations: mockRevaluations.length,
  mostRevaluedProduct: 'Premium Wireless Headphones',
  revaluationThisMonth: 3
};

export default function PriceRevaluation() {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<string>('month');
  const [filterDirection, setFilterDirection] = useState<string>('all');
  
  // State for the form
  const [newPrice, setNewPrice] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  
  // Get the product's current price when selected
  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    const product = mockProducts.find(p => p.id.toString() === productId);
    if (product) {
      setCurrentPrice(product.unitPrice);
      setNewPrice(product.unitPrice.toString());
    } else {
      setCurrentPrice(null);
      setNewPrice('');
    }
  };
  
  // Filter revaluations based on time range and direction
  const filteredRevaluations = mockRevaluations.filter(rev => {
    // Apply time filter
    if (timeRange === 'month') {
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);
      if (rev.revaluationDate < oneMonthAgo) return false;
    } else if (timeRange === 'quarter') {
      const today = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      if (rev.revaluationDate < threeMonthsAgo) return false;
    }
    
    // Apply direction filter
    if (filterDirection === 'increase' && rev.newPrice <= rev.oldPrice) return false;
    if (filterDirection === 'decrease' && rev.newPrice >= rev.oldPrice) return false;
    
    return true;
  });
  
  // Function to calculate percentage change
  const calculatePercentageChange = (oldPrice: number, newPrice: number) => {
    const percentChange = ((newPrice - oldPrice) / oldPrice) * 100;
    return percentChange.toFixed(2);
  };
  
  // Render price change with arrow and color
  const renderPriceChange = (oldPrice: number, newPrice: number) => {
    const percentChange = calculatePercentageChange(oldPrice, newPrice);
    const isIncrease = newPrice > oldPrice;
    
    return (
      <div className={`flex items-center ${isIncrease ? 'text-red-500' : 'text-green-500'}`}>
        {isIncrease ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
        <span>{isIncrease ? '+' : ''}{percentChange}%</span>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Price Revaluation</h1>
          <p className="text-gray-500">Manage and track product price changes</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <TrendingUp size={16} />
          New Price Adjustment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Price Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{mockSummaryStats.averageIncrease.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">Based on all revaluations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revaluations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockSummaryStats.totalRevaluations}
            </div>
            <p className="text-xs text-muted-foreground">Across all products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Revalued Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {mockSummaryStats.mostRevaluedProduct}
            </div>
            <p className="text-xs text-muted-foreground">Highest price volatility</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockSummaryStats.revaluationThisMonth}
            </div>
            <p className="text-xs text-muted-foreground">Recent price adjustments</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Price Revaluation History</CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Select value={filterDirection} onValueChange={setFilterDirection}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Change direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Changes</SelectItem>
                  <SelectItem value="increase">Price Increases</SelectItem>
                  <SelectItem value="decrease">Price Decreases</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Old Price</TableHead>
                <TableHead>New Price</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Updated By</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRevaluations.map(rev => (
                <TableRow key={rev.id}>
                  <TableCell>{rev.productName}</TableCell>
                  <TableCell>{format(rev.revaluationDate, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>₹{rev.oldPrice.toFixed(2)}</TableCell>
                  <TableCell>₹{rev.newPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    {renderPriceChange(rev.oldPrice, rev.newPrice)}
                  </TableCell>
                  <TableCell>{rev.userName}</TableCell>
                  <TableCell className="max-w-xs truncate" title={rev.reason}>
                    {rev.reason}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Price Impact Analysis Card */}
      <Card>
        <CardHeader>
          <CardTitle>Price Impact Analysis</CardTitle>
          <CardDescription>
            Analyze how price changes affect inventory valuation and margins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Inventory Value Impact</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  Recent price revaluations have resulted in:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-green-600">
                    <TrendingUp size={16} className="mr-2" />
                    <span>5.2% increase in total inventory value</span>
                  </li>
                  <li className="flex items-center text-amber-600">
                    <ArrowRight size={16} className="mr-2" />
                    <span>8.3% increase in high-turnover products</span>
                  </li>
                  <li className="flex items-center text-blue-600">
                    <TrendingDown size={16} className="mr-2" />
                    <span>2.1% decrease in slow-moving products</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  Projected market trends suggest:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <ArrowRight size={16} className="mr-2" />
                    <span>Electronics prices likely to increase by 3-5% over next quarter</span>
                  </li>
                  <li className="flex items-center">
                    <ArrowRight size={16} className="mr-2" />
                    <span>Consider preemptive adjustments for high-demand items</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product Categories Revaluation</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Electronics</span>
                    <span className="text-sm text-red-500">+8.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Smart Home</span>
                    <span className="text-sm text-green-500">-2.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '23%' }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Wearables</span>
                    <span className="text-sm text-red-500">+5.7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '57%' }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Photography</span>
                    <span className="text-sm text-red-500">+12.0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Revaluation Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Price Adjustment</DialogTitle>
            <DialogDescription>
              Update the price of a product and record the reason for the change.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select value={selectedProduct} onValueChange={handleProductChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {mockProducts.map(product => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} - {product.sku}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {currentPrice !== null && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="currentPrice">Current Price</Label>
                  <Input 
                    id="currentPrice" 
                    value={`₹${currentPrice.toFixed(2)}`} 
                    disabled 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPrice">New Price</Label>
                  <Input 
                    id="newPrice" 
                    type="number" 
                    value={newPrice} 
                    onChange={(e) => setNewPrice(e.target.value)}
                    step="0.01" 
                    min="0"
                  />
                  {newPrice && currentPrice && (
                    <p className="text-sm mt-1">
                      {parseFloat(newPrice) > currentPrice ? (
                        <span className="text-red-500">
                          Price increase of {calculatePercentageChange(currentPrice, parseFloat(newPrice))}%
                        </span>
                      ) : parseFloat(newPrice) < currentPrice ? (
                        <span className="text-green-500">
                          Price decrease of {calculatePercentageChange(currentPrice, parseFloat(newPrice))}%
                        </span>
                      ) : (
                        <span className="text-gray-500">No price change</span>
                      )}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Price Change</Label>
                  <Textarea 
                    id="reason" 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Supplier cost increase, competitive pricing, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="effectiveDate">Effective Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input 
                      id="effectiveDate" 
                      className="pl-8" 
                      type="date" 
                      defaultValue={format(new Date(), 'yyyy-MM-dd')} 
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!selectedProduct || !newPrice || !reason}
            >
              Update Price
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}