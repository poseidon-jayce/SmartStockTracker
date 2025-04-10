import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, ChevronRight, CheckCircle, Clock, Truck, Building } from 'lucide-react';
import { SupplierActivity as SupplierActivityType } from '@shared/schema';

export default function SupplierActivity() {
  const { data: activity, isLoading, refetch } = useQuery<SupplierActivityType>({
    queryKey: ['/api/supplier-activity'],
  });

  const getStatusIcon = (action: string) => {
    if (action.includes('confirmed')) {
      return <CheckCircle className="text-green-500 h-4 w-4" />;
    } else if (action.includes('updated')) {
      return <Clock className="text-amber-500 h-4 w-4" />;
    } else if (action.includes('shipped')) {
      return <Truck className="text-primary h-4 w-4" />;
    } else {
      return <Building className="text-gray-500 h-4 w-4" />;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <CardTitle className="text-lg font-medium">Supplier Activity</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary hover:text-blue-700"
          onClick={() => refetch()}
        >
          <RefreshCcw className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Pending Responses</h3>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-16 bg-gray-100 dark:bg-gray-800/50 rounded-lg animate-pulse"></div>
                <div className="h-16 bg-gray-100 dark:bg-gray-800/50 rounded-lg animate-pulse"></div>
              </div>
            ) : activity?.pending && activity.pending.length > 0 ? (
              <div className="space-y-3">
                {activity.pending.map((supplier) => (
                  <div key={supplier.id} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-primary mr-3">
                      <Building className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{supplier.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Requested {supplier.requestedAgo}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-primary hover:text-blue-700">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No pending responses from suppliers.
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Recent Updates</h3>
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex">
                  <div className="mr-3">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800/50 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 dark:bg-gray-800/50 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex">
                  <div className="mr-3">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800/50 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 dark:bg-gray-800/50 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : activity?.updates && activity.updates.length > 0 ? (
              <div className="space-y-4">
                {activity.updates.map((update, index) => (
                  <div key={index} className="flex">
                    <div className="mr-3 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center
                        ${update.action.includes('confirmed') ? 'bg-green-100 dark:bg-green-900/20 text-green-500' :
                          update.action.includes('shipped') ? 'bg-blue-100 dark:bg-blue-900/20 text-primary' :
                          'bg-amber-100 dark:bg-amber-900/20 text-amber-500'}`}
                      >
                        {getStatusIcon(update.action)}
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
              <div className="text-center py-4 text-gray-500">
                No recent supplier activity.
              </div>
            )}
          </div>
        </div>
        
        <Button 
          variant="link" 
          className="mt-6 text-primary hover:text-blue-700 text-sm font-medium p-0 h-auto"
          asChild
        >
          <a href="/suppliers">
            View supplier portal
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
