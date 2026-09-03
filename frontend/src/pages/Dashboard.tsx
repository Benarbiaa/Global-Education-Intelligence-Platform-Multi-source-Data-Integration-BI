import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { OverviewSection } from '@/components/dashboard/OverviewSection';
import { ExpenditureSection } from '@/components/dashboard/ExpenditureSection';
import { EnrollmentSection } from '@/components/dashboard/EnrollmentSection';
import { ResearchSection } from '@/components/dashboard/ResearchSection';
import { TertiarySection } from '@/components/dashboard/TertiarySection';
import { cn } from '@/lib/utils';

const sectionTitles: Record<string, { title: string; subtitle: string }> = {
  overview: { title: 'WorldWide Overview', subtitle: 'Ministry of Higher Education and Research' },
  expenditure: { title: 'Education Expenditure', subtitle: 'Budget and spending analysis' },
  enrollment: { title: 'Student Enrollment', subtitle: 'Enrollment metrics and trends' },
  research: { title: 'Research Output', subtitle: 'Publications, patents and collaborations' },
  tertiary: { title: 'Tertiary Education', subtitle: 'Higher education and university rankings' },
};

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedYear, setSelectedYear] = useState(2024);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    // Simulate API delay for demo
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, [queryClient]);

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection year={selectedYear} />;
      case 'expenditure':
        return <ExpenditureSection year={selectedYear} />;
      case 'enrollment':
        return <EnrollmentSection year={selectedYear} />;
      case 'research':
        return <ResearchSection year={selectedYear} />;
      case 'tertiary':
        return <TertiarySection year={selectedYear} />;
      default:
        return <OverviewSection year={selectedYear} />;
    }
  };

  const currentSection = sectionTitles[activeSection] || sectionTitles.overview;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      
      <main className={cn(
        'transition-all duration-300',
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      )}>
        <Header
          title={currentSection.title}
          subtitle={currentSection.subtitle}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        
        <div className="p-6">
          {renderSection()}
        </div>

        {/* Footer */}
        <footer className="border-t px-6 py-4 mt-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2025 Team 1 - BI Dashboard</p>
            <p>Data last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </footer>
      </main>

      {/* API Connection Status */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border shadow-sm text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-muted-foreground">Backend: localhost:8000</span>
        </div>
      </div>
    </div>
  );
}
