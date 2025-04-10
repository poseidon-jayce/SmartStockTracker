import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import KPICard from '@/components/dashboard/KPICard';
import AIInsights from '@/components/dashboard/AIInsights';
import SupplierActivity from '@/components/dashboard/SupplierActivity';
import InventoryTable from '@/components/inventory/InventoryTable';
import BarcodeScanner from '@/components/inventory/BarcodeScanner';
import {
  Package2,
  AlertTriangle,
  ShoppingCart,
  Handshake
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Dashboard() {
  const [locationId, setLocationId] = useState<string>('all');
  const [period, setPeriod] = useState<string>('30');
  
  const { data: locations } = useQuery({
    queryKey: ['/api/locations'],
  });
  
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats', locationId ? parseInt(locationId) : undefined],
    ...(locationId 
      ? { queryKey: ['/api/dashboard/stats', { locationId: parseInt(locationId) }] }
      : { queryKey: ['/api/dashboard/stats'] })
  });

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-medium">Dashboard Overview</h1>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
          <div className="flex items-center bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Location:</span>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger className="bg-transparent border-none shadow-none h-7 w-[130px]">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations?.map((location: any) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Period:</span>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="bg-transparent border-none shadow-none h-7 w-[130px]">
                <SelectValue placeholder="Last 30 Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last quarter</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Stock Value"
          value={isStatsLoading ? '...' : `$${stats?.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<Package2 className="h-5 w-5 text-primary" />}
          iconBgColor="bg-blue-100 dark:bg-blue-900/20"
          change={{
            value: 4.5,
            type: 'increase'
          }}
        />
        
        <KPICard
          title="Low Stock Items"
          value={isStatsLoading ? '...' : `${stats?.lowStockCount} items`}
          icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
          iconBgColor="bg-amber-100 dark:bg-amber-900/20"
          change={{
            value: 12,
            type: 'increase'
          }}
        />
        
        <KPICard
          title="Orders Pending"
          value={isStatsLoading ? '...' : `${stats?.pendingOrders} orders`}
          icon={<ShoppingCart className="h-5 w-5 text-orange-500" />}
          iconBgColor="bg-orange-100 dark:bg-orange-900/20"
          change={{
            value: 8.3,
            type: 'decrease'
          }}
        />
        
        <KPICard
          title="Active Suppliers"
          value={isStatsLoading ? '...' : `${stats?.activeSuppliers} suppliers`}
          icon={<Handshake className="h-5 w-5 text-teal-500" />}
          iconBgColor="bg-teal-100 dark:bg-teal-900/20"
          change={{
            value: 2,
            type: 'increase',
            text: 'new this month'
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <AIInsights locationId={locationId ? parseInt(locationId) : undefined} />
        </div>
        <div>
          <SupplierActivity />
        </div>
      </div>

      <InventoryTable locationId={locationId ? parseInt(locationId) : undefined} />
      
      <BarcodeScanner />
    </>
  );
}
