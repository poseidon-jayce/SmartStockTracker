import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, TrendingUp } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { PredictionWithProduct } from '@shared/schema';

interface AIInsightsProps {
  locationId?: number;
}

export default function AIInsights({ locationId }: AIInsightsProps) {
  const [period, setPeriod] = useState<'30days' | '60days' | '90days'>('30days');
  
  const { data: predictions, isLoading } = useQuery<PredictionWithProduct[]>({
    queryKey: ['/api/predictions', locationId],
    // If locationId is provided, add it as a query parameter
    // Othwerwise, don't include it
    ...(locationId 
      ? { queryKey: ['/api/predictions', { locationId }] }
      : { queryKey: ['/api/predictions'] })
  });

  const { data: salesTrends, isLoading: isTrendsLoading } = useQuery({
    queryKey: ['/api/sales/trends', locationId],
    ...(locationId
      ? { queryKey: ['/api/sales/trends', { locationId }] }
      : { queryKey: ['/api/sales/trends'] })
  });

  // Sort predictions by recommended order (descending)
  const sortedPredictions = predictions
    ? [...predictions].sort((a, b) => b.recommendedOrder - a.recommendedOrder).slice(0, 3)
    : [];

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Low Stock':
        return 'text-red-600 font-medium';
      case 'Medium Stock':
        return 'text-amber-600 font-medium';
      case 'In Stock':
        return 'text-green-600 font-medium';
      default:
        return '';
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <CardTitle className="text-lg font-medium">AI Inventory Predictions</CardTitle>
        <Button variant="ghost" size="icon" className="text-primary hover:text-blue-700">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="font-medium mb-2">Predicted Stock Requirements (Next {period.replace('days', ' Days')})</h3>
          <div className="h-64 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            {isTrendsLoading ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Loading forecast data...</p>
              </div>
            ) : salesTrends ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={salesTrends}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1976D2" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1976D2" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    className="text-xs text-gray-500 dark:text-gray-400" 
                  />
                  <YAxis className="text-xs text-gray-500 dark:text-gray-400" />
                  <Tooltip 
                    formatter={(value: number) => [`${value} units`, 'Quantity']}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="quantity" 
                    stroke="#1976D2" 
                    fillOpacity={1} 
                    fill="url(#colorQuantity)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <TrendingUp className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-2" />
                <p className="text-gray-500">Demand Forecast Chart</p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-4">Top Restock Recommendations</h3>
          {isLoading ? (
            <div className="space-y-3">
              <div className="bg-gray-100 dark:bg-gray-800/50 h-16 rounded-lg animate-pulse"></div>
              <div className="bg-gray-100 dark:bg-gray-800/50 h-16 rounded-lg animate-pulse"></div>
              <div className="bg-gray-100 dark:bg-gray-800/50 h-16 rounded-lg animate-pulse"></div>
            </div>
          ) : sortedPredictions.length > 0 ? (
            <div className="space-y-3">
              {sortedPredictions.map((prediction) => (
                <div key={prediction.id} className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{prediction.productName}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Current Stock: <span className={getStatusClasses(prediction.status)}>{prediction.currentStock} units</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm bg-blue-100 dark:bg-blue-900/20 text-primary px-2 py-1 rounded-full mb-1">
                        Order {prediction.recommendedOrder} units
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Predicted demand: {prediction.predictedDemand} units
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No predictions available for this location.
            </div>
          )}
          
          <Button 
            variant="link" 
            className="mt-4 text-primary hover:text-blue-700 text-sm font-medium p-0 h-auto"
            asChild
          >
            <a href="/predictions">
              View all recommendations
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
