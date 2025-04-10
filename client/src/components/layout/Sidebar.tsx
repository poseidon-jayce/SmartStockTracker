import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  QrCode,
  Package,
  TrendingUp,
  Truck,
  Store,
  Settings,
  Users,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

interface NavItem {
  title: string;
  icon: React.ReactNode;
  href: string;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();

  const mainNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
      href: '/'
    },
    {
      title: 'Scan Inventory',
      icon: <QrCode className="mr-3 h-5 w-5" />,
      href: '/scan'
    },
    {
      title: 'Inventory',
      icon: <Package className="mr-3 h-5 w-5" />,
      href: '/inventory'
    },
    {
      title: 'Sales Analysis',
      icon: <TrendingUp className="mr-3 h-5 w-5" />,
      href: '/sales'
    },
    {
      title: 'Suppliers',
      icon: <Truck className="mr-3 h-5 w-5" />,
      href: '/suppliers'
    },
    {
      title: 'Locations',
      icon: <Store className="mr-3 h-5 w-5" />,
      href: '/locations'
    }
  ];

  const settingsNavItems: NavItem[] = [
    {
      title: 'General Settings',
      icon: <Settings className="mr-3 h-5 w-5" />,
      href: '/settings'
    },
    {
      title: 'User Management',
      icon: <Users className="mr-3 h-5 w-5" />,
      href: '/users'
    },
    {
      title: 'Help & Support',
      icon: <HelpCircle className="mr-3 h-5 w-5" />,
      href: '/help'
    }
  ];

  const NavItem = ({ item }: { item: NavItem }) => {
    const isActive = location === item.href;
    
    return (
      <li>
        <Link href={item.href}>
          <div
            className={cn(
              "flex items-center px-4 py-2 rounded-lg transition-colors cursor-pointer",
              isActive 
                ? "text-primary bg-blue-50 dark:bg-blue-900/20" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
            )}
          >
            {item.icon}
            <span>{item.title}</span>
          </div>
        </Link>
      </li>
    );
  };

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-10 w-64 bg-white dark:bg-gray-900 shadow-lg transition-transform duration-300 ease-in-out pt-16",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <nav className="px-4 py-4 h-full overflow-y-auto">
        <div className="mb-8">
          <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-4">Main Menu</p>
          <ul className="space-y-2">
            {mainNavItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </ul>
        </div>
        
        <div className="mb-8">
          <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-4">Settings</p>
          <ul className="space-y-2">
            {settingsNavItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
