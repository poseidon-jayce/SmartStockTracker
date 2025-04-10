import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  ChevronDown, 
  Package2
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const [location, setLocation] = useLocation();
  
  // Get initial theme from localStorage or system preference
  const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (storedTheme) {
        return storedTheme;
      }
      
      // Check for system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light'; // Default theme
  };
  
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme());
  const [searchValue, setSearchValue] = useState('');
  
  // Apply the theme when component mounts
  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Update document classes for global theme
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save to localStorage for persistence
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('theme', newTheme);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log('Searching for:', searchValue);
  };

  return (
    <header className="bg-primary text-white shadow-md fixed top-0 w-full z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 md:hidden text-white hover:bg-blue-700"
              onClick={toggleSidebar}
            >
              <Menu />
            </Button>
            <div className="flex items-center" onClick={() => setLocation('/')} style={{ cursor: 'pointer' }}>
              <Package2 className="mr-2" />
              <span className="font-medium text-xl">StockSmart</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search inventory..."
                className="bg-blue-700 text-white placeholder:text-blue-200 border-none rounded-full py-1 px-4 w-64 focus:outline-none focus:ring-2 focus:ring-white"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-blue-200" />
            </form>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="p-1 rounded-full hover:bg-blue-700 text-white"
              onClick={toggleTheme}
            >
              {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="p-1 rounded-full hover:bg-blue-700 text-white">
                    <Bell />
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Low stock: Premium Wireless Headphones</DropdownMenuItem>
                  <DropdownMenuItem>Order #4582 has been delivered</DropdownMenuItem>
                  <DropdownMenuItem>New price update from Tech Distributors</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer">
                  <Avatar className="h-8 w-8 bg-blue-800">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span className="ml-2">John Doe</span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              className="p-1 text-white hover:bg-blue-700"
              onClick={() => {
                // Open mobile search
                console.log('Open mobile search');
              }}
            >
              <Search />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="p-1 text-white hover:bg-blue-700 relative"
            >
              <Bell />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
