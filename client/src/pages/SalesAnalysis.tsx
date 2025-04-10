import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { Download, Filter, TrendingUp, Package, RefreshCw } from 'lucide-react';

export default function SalesAnalysis() {
  const [period, setPeriod] = useState('30');
  const [locationId, setLocationId] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  
  const { data: locations } = useQuery({
    queryKey: ['/api/locations'],
  });
  
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });
  
  const { data: salesTrends, isLoading: isTrendsLoading } = useQuery({
    queryKey: ['/api/sales/trends', locationId, productId, period],
    ...(locationId || productId
      ? { 
          queryKey: [
            '/api/sales/trends', 
            { 
              ...(locationId && { locationId: parseInt(locationId) }),
              ...(productId && { productId: parseInt(productId) })
            }
          ] 
        }
      : { queryKey: ['/api/sales/trends'] })
  });
  
  const { data: predictions } = useQuery({
    queryKey: ['/api/predictions', locationId],
    ...(locationId 
      ? { queryKey: ['/api/predictions', { locationId: parseInt(locationId) }] }
      : { queryKey: ['/api/predictions'] })
  });
  
  // Prepare top product data for pie chart
  const getTopProductsData = () => {
    if (!salesTrends) return [];
    
    // In a real app, this would be parsed from sales data grouped by product
    // For now, we'll simulate it with the available data
    return [
      { name: 'Premium Wireless Headphones', value: 35 },
      { name: 'Smart Home Hub', value: 25 },
      { name: '4K Action Camera', value: 20 },
      { name: 'Fitness Tracker Watch', value: 15 },
      { name: 'Tablet Pro 11"', value: 5 },
    ];
  };
  
  const COLORS = ['#1976D2', '#26A69A', '#FF5722', '#FFC107', '#9C27B0'];
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-md">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-primary">{`Quantity: ${payload[0].value}`}</p>
          {payload[1] && <p className="text-teal-500">{`Value: $${payload[1].value}`}</p>}
        </div>
      );
    }
  
    return null;
  };
  
  const CustomPieTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-md">
          <p className="font-medium">{`${payload[0].name}`}</p>
          <p style={{ color: payload[0].color }}>{`${payload[0].value}%`}</p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-medium">Sales Analysis</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Analyze sales trends and forecast demand</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Analysis Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium block mb-1">Time Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last quarter</SelectItem>
                  <SelectItem value="180">Last 6 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium block mb-1">Location</label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  {locations?.map((location: any) => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium block mb-1">Product</label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products?.map((product: any) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium block mb-1">Chart Type</label>
              <Select value={chartType} onValueChange={(value: 'line' | 'bar') => setChartType(value)}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-auto flex items-end">
              <Button variant="outline" className="mb-0 sm:mb-1" onClick={() => {
                setPeriod('30');
                setLocationId('');
                setProductId('');
                setChartType('line');
              }}>
                <Filter className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isTrendsLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">Loading sales data...</p>
                  </div>
                ) : salesTrends ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                      <LineChart data={salesTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          className="text-xs text-gray-500 dark:text-gray-400" 
                        />
                        <YAxis className="text-xs text-gray-500 dark:text-gray-400" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="quantity" 
                          stroke="#1976D2" 
                          activeDot={{ r: 8 }} 
                          name="Units Sold"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#26A69A" 
                          name="Sales Value ($)"
                        />
                      </LineChart>
                    ) : (
                      <BarChart data={salesTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          className="text-xs text-gray-500 dark:text-gray-400" 
                        />
                        <YAxis className="text-xs text-gray-500 dark:text-gray-400" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="quantity" fill="#1976D2" name="Units Sold" />
                        <Bar dataKey="value" fill="#26A69A" name="Sales Value ($)" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <TrendingUp className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-2" />
                    <p className="text-gray-500">No sales data available for the selected filters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Top Products by Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getTopProductsData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getTopProductsData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI-Generated Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
              <h3 className="font-medium text-blue-700 dark:text-blue-400 flex items-center mb-2">
                <TrendingUp className="mr-2 h-5 w-5" />
                Sales Trends Analysis
              </h3>
              <p className="text-blue-600 dark:text-blue-300">
                {productId ? 'This product has shown a steady growth pattern over the selected period with occasional spikes in demand.' : 'Overall sales have been trending upward with a 12% increase compared to the previous period.'}
              </p>
            </div>
            
            <div className="p-4 bg-teal-50 dark:bg-teal-900/10 rounded-lg border border-teal-100 dark:border-teal-800">
              <h3 className="font-medium text-teal-700 dark:text-teal-400 flex items-center mb-2">
                <Package className="mr-2 h-5 w-5" />
                Product Performance
              </h3>
              <p className="text-teal-600 dark:text-teal-300">
                Top performers include Premium Wireless Headphones and Smart Home Hub, which account for over 50% of total sales. Consider increasing inventory for these items.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800">
              <h3 className="font-medium text-purple-700 dark:text-purple-400 flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Forecast Recommendations
              </h3>
              <p className="text-purple-600 dark:text-purple-300">
                Based on current trends and seasonal patterns, we recommend increasing stock of 4K Action Cameras by 20% for the upcoming holiday season.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
