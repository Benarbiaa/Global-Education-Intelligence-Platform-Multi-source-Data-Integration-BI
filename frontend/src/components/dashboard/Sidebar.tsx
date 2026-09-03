import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  DollarSign, 
  Users, 
  Microscope, 
  GraduationCap,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const menuItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'expenditure', label: 'Expenditure', icon: DollarSign },
  { id: 'enrollment', label: 'Enrollment', icon: Users },
  { id: 'research', label: 'Research', icon: Microscope },
  { id: 'tertiary', label: 'Tertiary Education', icon: GraduationCap },
];

export function Sidebar({ activeSection, onSectionChange, collapsed, onCollapsedChange }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg gradient-expenditure flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-sidebar-foreground">Higher Education BI</span>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto h-8 w-8 rounded-lg gradient-expenditure flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className="absolute -right-3 top-20 p-1.5 rounded-full bg-sidebar border border-sidebar-border hover:bg-sidebar-accent text-sidebar-foreground transition-colors shadow-sm"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  'w-full nav-item',
                  isActive
                    ? 'nav-item-active'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        
      </div>
    </aside>
  );
}
