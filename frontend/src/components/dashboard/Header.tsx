import { Bell, Search, Calendar, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  selectedYear: number;
  onYearChange: (year: number) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onSearch?: (searchTerm: string) => void;  // NEW: Add search handler
  searchPlaceholder?: string;               // NEW: Customizable placeholder
}

const years = [2024, 2023, 2022, 2021, 2020, 2019];

export function Header({
  title,
  subtitle,
  selectedYear,
  onYearChange,
  onRefresh,
  isRefreshing,
  onSearch,                  // NEW: Add to props
  searchPlaceholder = "Search KPIs..." // NEW: Default placeholder
}: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search handler
  useEffect(() => {
    if (onSearch) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (searchTerm.trim() === '') {
        onSearch('');
        return;
      }

      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        onSearch(searchTerm);
        setIsSearching(false);
      }, 300); // 300ms debounce delay
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, onSearch]);

  const handleClearSearch = () => {
    setSearchTerm('');
    if (onSearch) onSearch('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClearSearch();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between h-16 px-6">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

       

    
          

          

         
    
      </div>
    </header>
  );
}