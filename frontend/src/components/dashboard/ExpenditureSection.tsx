import { KPICard } from './KPICard';
import { ChartCard } from './ChartCard';
import { DollarSign, PiggyBank, Building, TrendingUp, AlertCircle, Filter, Trophy, Award, Percent, Globe, Search, X } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { useState, useMemo } from 'react';
import {
  useScholarshipInvestment,
  useTertiaryExpenditure,
} from '@/hooks/useEducationData';

interface ExpenditureSectionProps {
  isLoading?: boolean;
  searchTerm?: string; // Add searchTerm prop
  year?: number; // Add year prop if needed from parent
}

const MIN_YEAR = 2018;

export function ExpenditureSection({ 
  isLoading, 
  searchTerm = '', // Default to empty string
  year 
}: ExpenditureSectionProps) {
  const { data: scholarship, isLoading: scholarLoading, error: scholarError } = useScholarshipInvestment();
  const { data: tertiary, isLoading: tertiaryLoading, error: tertiaryError } = useTertiaryExpenditure();
  
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Use parent searchTerm or local search term
  const effectiveSearchTerm = searchTerm || localSearchTerm;

  const isDataLoading = scholarLoading || tertiaryLoading || isLoading;
  const hasError = scholarError || tertiaryError;

  // Transform and filter scholarship data
  const scholarshipData = useMemo(() => {
    if (!scholarship || !Array.isArray(scholarship)) return [];
    return scholarship
      .filter((item: any) => item.year >= MIN_YEAR)
      .sort((a: any, b: any) => a.year - b.year);
  }, [scholarship]);

  // Transform and filter tertiary data
  const tertiaryData = useMemo(() => {
    if (!tertiary || !Array.isArray(tertiary)) return [];
    return tertiary
      .filter((item: any) => item.year >= MIN_YEAR)
      .sort((a: any, b: any) => a.year - b.year);
  }, [tertiary]);

  // Get unique countries
  const countries = useMemo(() => {
    const uniqueCountries = new Set<string>();
    scholarshipData.forEach((item: any) => {
      if (item.country_name) uniqueCountries.add(item.country_name);
    });
    tertiaryData.forEach((item: any) => {
      if (item.country_name) uniqueCountries.add(item.country_name);
    });
    return Array.from(uniqueCountries).sort();
  }, [scholarshipData, tertiaryData]);

  // Get unique years
  const years = useMemo(() => {
    const uniqueYears = new Set<number>();
    scholarshipData.forEach((item: any) => {
      if (item.year) uniqueYears.add(item.year);
    });
    tertiaryData.forEach((item: any) => {
      if (item.year) uniqueYears.add(item.year);
    });
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [scholarshipData, tertiaryData]);

  // Filter data by selected country/year WITH SEARCH
  const filteredScholarship = useMemo(() => {
    return scholarshipData.filter((item: any) => {
      if (selectedCountry && item.country_name !== selectedCountry) return false;
      if (selectedYear && item.year !== selectedYear) return false;
      
      // Apply search filter
      if (effectiveSearchTerm.trim()) {
        const term = effectiveSearchTerm.toLowerCase();
        const matchesSearch = (
          (item.country_name && item.country_name.toLowerCase().includes(term)) ||
          (item.year && item.year.toString().includes(term)) ||
          (item.total_scholarships && item.total_scholarships.toString().toLowerCase().includes(term))
        );
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [scholarshipData, selectedCountry, selectedYear, effectiveSearchTerm]);

  const filteredTertiary = useMemo(() => {
    return tertiaryData.filter((item: any) => {
      if (selectedCountry && item.country_name !== selectedCountry) return false;
      if (selectedYear && item.year !== selectedYear) return false;
      
      // Apply search filter
      if (effectiveSearchTerm.trim()) {
        const term = effectiveSearchTerm.toLowerCase();
        const matchesSearch = (
          (item.country_name && item.country_name.toLowerCase().includes(term)) ||
          (item.year && item.year.toString().includes(term)) ||
          (item.tertiary_expenditure && item.tertiary_expenditure.toString().toLowerCase().includes(term))
        );
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [tertiaryData, selectedCountry, selectedYear, effectiveSearchTerm]);

  // STATIC KPI CALCULATIONS - Use unfiltered data (search doesn't affect KPIs)
  // Helper function to find latest non-zero data - using unfiltered data for static KPIs
  const findLatestNonZeroDataStatic = (data: any[], valueKey: string) => {
    if (!data || data.length === 0) return null;
    
    // Sort by year descending
    const sortedData = [...data].sort((a: any, b: any) => b.year - a.year);
    
    // Find first item with non-zero value
    for (const item of sortedData) {
      const value = item[valueKey];
      if (value !== undefined && value !== null && value > 0) {
        return item;
      }
    }
    
    // If no non-zero values, return the latest item
    return sortedData[0] || null;
  };

  // Calculate Tertiary Expenditure KPI (Static)
  const staticTertiaryExpenditureKPI = useMemo(() => {
    const latestItem = findLatestNonZeroDataStatic(tertiaryData, 'tertiary_expenditure');
    
    if (!latestItem || !latestItem.tertiary_expenditure) {
      return { value: 'No Data', trend: 0, trendLabel: 'No recent data' };
    }
    
    const value = latestItem.tertiary_expenditure;
    
    // Find previous year non-zero data for trend calculation
    const previousYearData = tertiaryData
      .filter((item: any) => 
        item.year < latestItem.year && 
        item.tertiary_expenditure && 
        item.tertiary_expenditure > 0
      )
      .sort((a: any, b: any) => b.year - a.year)[0];
    
    let trend = 0;
    let trendLabel = `Year ${latestItem.year}`;
    
    if (previousYearData && previousYearData.tertiary_expenditure > 0) {
      trend = ((value - previousYearData.tertiary_expenditure) / 
               previousYearData.tertiary_expenditure) * 100;
      trendLabel = `vs ${previousYearData.year}`;
    }
    
    return {
      value: `${value.toFixed(1)}`,
      trend: Number(trend.toFixed(1)),
      trendLabel: latestItem.country_name || 'Country'
    };
  }, [tertiaryData]); // Using unfiltered tertiaryData

  // Calculate Scholarship Investment KPI (Static)
  const staticScholarshipKPI = useMemo(() => {
    const latestItem = findLatestNonZeroDataStatic(scholarshipData, 'total_scholarships');
    
    if (!latestItem || !latestItem.total_scholarships) {
      return { value: 'No Data', trend: 0, trendLabel: 'No recent data' };
    }
    
    const value = latestItem.total_scholarships;
    
    // Check value size to determine format
    const isLargeValue = value >= 1000000;
    
    // Find previous year non-zero data for trend calculation
    const previousYearData = scholarshipData
      .filter((item: any) => 
        item.year < latestItem.year && 
        item.total_scholarships && 
        item.total_scholarships > 0
      )
      .sort((a: any, b: any) => b.year - a.year)[0];
    
    let trend = 0;
    let trendLabel = `Year ${latestItem.year}`;
    
    if (previousYearData && previousYearData.total_scholarships > 0) {
      trend = ((value - previousYearData.total_scholarships) / 
               previousYearData.total_scholarships) * 100;
      trendLabel = `vs ${previousYearData.year}`;
    }
    
    // Format value
    let formattedValue = '';
    if (isLargeValue) {
      formattedValue = `$${(value / 1000000).toFixed(1)}M`;
    } else {
      formattedValue = `$${(value / 1000).toFixed(1)}K`;
    }
    
    return {
      value: formattedValue,
      trend: Number(trend.toFixed(1)),
      trendLabel: latestItem.country_name || 'Country'
    };
  }, [scholarshipData]); // Using unfiltered scholarshipData

  // Calculate Investment Efficiency KPI (Static)
  const staticInvestmentRatioKPI = useMemo(() => {
    // Get latest non-zero data for both datasets
    const latestTertiary = findLatestNonZeroDataStatic(tertiaryData, 'tertiary_expenditure');
    const latestScholarship = findLatestNonZeroDataStatic(scholarshipData, 'total_scholarships');
    
    if (!latestTertiary && !latestScholarship) {
      return { value: 'No Data', trend: 0, trendLabel: 'No data' };
    }
    
    // If we only have one type of data
    if (!latestTertiary && latestScholarship) {
      return { 
        value: `$${(latestScholarship.total_scholarships / 1000000).toFixed(1)}M`, 
        trend: 0, 
        trendLabel: `${latestScholarship.country_name || 'Country'} (Scholarship)` 
      };
    }
    
    if (latestTertiary && !latestScholarship) {
      return { 
        value: `${latestTertiary.tertiary_expenditure.toFixed(1)}`, 
        trend: 0, 
        trendLabel: `${latestTertiary.country_name || 'Country'} (Tertiary)` 
      };
    }
    
    // We have both - calculate normalized ratio
    const tertiaryValue = latestTertiary!.tertiary_expenditure;
    const scholarshipValue = latestScholarship!.total_scholarships;
    
    // NORMALIZE: Scale scholarship to match tertiary scale
    const normalizedScholarship = scholarshipValue / 100000;
    
    let ratio = 0;
    if (tertiaryValue > 0) {
      ratio = (normalizedScholarship / tertiaryValue) * 100;
    }
    
    // Cap at reasonable percentage
    const displayRatio = Math.min(ratio, 1000);
    
    const countryName = latestTertiary!.country_name || latestScholarship!.country_name || 'Country';
    
    return {
      value: `${displayRatio.toFixed(1)}%`,
      trend: 0,
      trendLabel: `${countryName}`
    };
  }, [tertiaryData, scholarshipData]); // Using unfiltered data

  // Helper function to find latest non-zero data for charts (uses filtered data)
  const findLatestNonZeroData = (data: any[], valueKey: string) => {
    if (!data || data.length === 0) return null;
    
    // Sort by year descending
    const sortedData = [...data].sort((a: any, b: any) => b.year - a.year);
    
    // Find first item with non-zero value
    for (const item of sortedData) {
      const value = item[valueKey];
      if (value !== undefined && value !== null && value > 0) {
        return item;
      }
    }
    
    // If no non-zero values, return the latest item
    return sortedData[0] || null;
  };

  // Calculate Tertiary Expenditure KPI for display (uses filtered data for charts)
  const tertiaryExpenditureKPI = useMemo(() => {
    const latestItem = findLatestNonZeroData(filteredTertiary, 'tertiary_expenditure');
    
    if (!latestItem || !latestItem.tertiary_expenditure) {
      return { value: 'No Data', trend: 0, trendLabel: 'No recent data' };
    }
    
    const value = latestItem.tertiary_expenditure;
    
    // Find previous year non-zero data for trend calculation
    const previousYearData = filteredTertiary
      .filter((item: any) => 
        item.year < latestItem.year && 
        item.tertiary_expenditure && 
        item.tertiary_expenditure > 0
      )
      .sort((a: any, b: any) => b.year - a.year)[0];
    
    let trend = 0;
    let trendLabel = `Year ${latestItem.year}`;
    
    if (previousYearData && previousYearData.tertiary_expenditure > 0) {
      trend = ((value - previousYearData.tertiary_expenditure) / 
               previousYearData.tertiary_expenditure) * 100;
      trendLabel = `vs ${previousYearData.year}`;
    }
    
    return {
      value: `${value.toFixed(1)}`,
      trend: Number(trend.toFixed(1)),
      trendLabel: latestItem.country_name || 'Country'
    };
  }, [filteredTertiary]);

  // Calculate search results summary
  const totalSearchResults = filteredTertiary.length + filteredScholarship.length;

  const handleClearSearch = () => {
    setLocalSearchTerm('');
  };

  // Prepare country comparison data for scatter plot
  const countryComparisonData = useMemo(() => {
    if (selectedYear === null || filteredScholarship.length === 0 || filteredTertiary.length === 0) {
      return [];
    }
    
    // Get data for selected year
    const scholarshipByCountry = new Map();
    filteredScholarship
      .filter(item => item.year === selectedYear && item.total_scholarships > 0)
      .forEach(item => {
        scholarshipByCountry.set(item.country_name, item.total_scholarships);
      });
    
    const tertiaryByCountry = new Map();
    filteredTertiary
      .filter(item => item.year === selectedYear && item.tertiary_expenditure > 0)
      .forEach(item => {
        tertiaryByCountry.set(item.country_name, item.tertiary_expenditure);
      });
    
    // Combine data for countries with both values
    const comparisonData = [];
    scholarshipByCountry.forEach((scholarshipVal, country) => {
      const tertiaryVal = tertiaryByCountry.get(country);
      if (tertiaryVal && tertiaryVal > 0) {
        comparisonData.push({
          country,
          tertiary: tertiaryVal,
          scholarships: scholarshipVal / 1000000, // Convert to millions for scaling
          efficiency: (scholarshipVal / 1000000) / tertiaryVal
        });
      }
    });
    
    return comparisonData.sort((a, b) => b.scholarships - a.scholarships).slice(0, 20);
  }, [filteredTertiary, filteredScholarship, selectedYear]);

  // Prepare chart data for individual trends
  const scholarshipChartData = useMemo(() => {
    // Don't prepare trend data if a specific year is selected
    if (selectedYear !== null) return [];
    
    const byYear: { [key: number]: any } = {};
    
    filteredScholarship.forEach((item: any) => {
      if (!byYear[item.year]) byYear[item.year] = { year: item.year };
      byYear[item.year].scholarships = item.total_scholarships / 1000000; // Convert to millions
    });

    return Object.values(byYear).sort((a: any, b: any) => a.year - b.year);
  }, [filteredScholarship, selectedYear]);

  const tertiaryChartData = useMemo(() => {
    // Don't prepare trend data if a specific year is selected
    if (selectedYear !== null) return [];
    
    const byYear: { [key: number]: any } = {};
    
    filteredTertiary.forEach((item: any) => {
      if (!byYear[item.year]) byYear[item.year] = { year: item.year };
      byYear[item.year].tertiary = item.tertiary_expenditure;
    });

    return Object.values(byYear).sort((a: any, b: any) => a.year - b.year);
  }, [filteredTertiary, selectedYear]);

  // Determine if charts should be shown
  const showCharts = selectedYear === null;

  return (
    <div className="space-y-6">
      {hasError && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div className="text-sm">
            <p className="font-semibold text-red-900">Data Issue</p>
            <p className="text-red-800">Some expenditure data may be unavailable.</p>
          </div>
        </div>
      )}

      {/* Search Indicator (if searching from parent) */}
      {searchTerm && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-900">
                Showing results for: <span className="font-bold">"{searchTerm}"</span>
              </p>
              <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                {totalSearchResults} total records
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Local Search (if not provided from parent) */}
      {!searchTerm && (
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search within expenditure data..."
                className="px-3 py-1 text-sm border border-border rounded-md bg-background flex-1"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
              />
              {localSearchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <select
          value={selectedYear || ''}
          onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
          className="px-3 py-1 text-sm border border-border rounded-md bg-background"
        >
          <option value="">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={selectedCountry || ''}
          onChange={(e) => setSelectedCountry(e.target.value || null)}
          className="px-3 py-1 text-sm border border-border rounded-md bg-background flex-1"
        >
          <option value="">All Countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      {/* STATIC KPI Cards - Use static calculations (not affected by search) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          title="Tertiary Expenditure"
          value={staticTertiaryExpenditureKPI.value}
          trend={staticTertiaryExpenditureKPI.trend}
          trendLabel={staticTertiaryExpenditureKPI.trendLabel}
          icon={<Percent className="h-6 w-6" />}
          variant="expenditure"
          isLoading={tertiaryLoading}
        />
        <KPICard
          title="Scholarship Investment"
          value={staticScholarshipKPI.value}
          trend={staticScholarshipKPI.trend}
          trendLabel={staticScholarshipKPI.trendLabel}
          icon={<Award className="h-6 w-6" />}
          variant="expenditure"
          isLoading={scholarLoading}
        />
        <KPICard
          title="Investment Ratio"
          value={staticInvestmentRatioKPI.value}
          trend={0}
          trendLabel={staticInvestmentRatioKPI.trendLabel}
          icon={<TrendingUp className="h-6 w-6" />}
          variant="expenditure"
          isLoading={false}
        />
      </div>

      {/* Charts - Only show when no specific year is selected */}
      {showCharts ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Tertiary Expenditure Trend"
              subtitle={selectedCountry ? `${selectedCountry}` : 'All Countries'}
              isLoading={tertiaryLoading}
            >
              {tertiaryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={tertiaryChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="year" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: any) => `${value.toFixed(1)}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="tertiary" 
                      stroke="hsl(var(--chart-1))" 
                      name="Tertiary Expenditure"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-300 text-muted-foreground">
                  {effectiveSearchTerm ? 'No data matches your search' : 'No data available'}
                </div>
              )}
            </ChartCard>

            <ChartCard
              title="Scholarship Investment Trend"
              subtitle={selectedCountry ? selectedCountry : 'All Countries'}
              isLoading={isDataLoading}
            >
              {scholarshipChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scholarshipChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="year" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      label={{ value: 'Amount ($M)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: any) => `$${value.toFixed(2)}M`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="scholarships" 
                      stroke="hsl(var(--chart-2))" 
                      name="Scholarships ($M)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-300 text-muted-foreground">
                  {effectiveSearchTerm ? 'No data matches your search' : 'No data available'}
                </div>
              )}
            </ChartCard>
          </div>
        </>
      ) : (
        // Show country comparison when specific year is selected
        <div>
          {countryComparisonData.length > 0 ? (
            <ChartCard
              title={`Country Investment Comparison (${selectedYear})`}
              subtitle="Tertiary vs Scholarship Investment"
              isLoading={isDataLoading}
            >
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    dataKey="tertiary" 
                    name="Tertiary Expenditure" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    label={{ value: 'Tertiary Expenditure', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="scholarships" 
                    name="Scholarships ($M)" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    label={{ value: 'Scholarship Investment ($M)', angle: -90, position: 'insideLeft' }}
                  />
                  <ZAxis 
                    type="number" 
                    dataKey="efficiency" 
                    range={[50, 400]} // Bubble size range
                    name="Efficiency"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any, name: string, props: any) => {
                      if (name === 'Country') return [props.payload.country, name];
                      if (name === 'Tertiary Expenditure') return [`${value.toFixed(1)}`, name];
                      if (name === 'Scholarships ($M)') return [`$${value.toFixed(2)}M`, name];
                      if (name === 'Efficiency') return [`${value.toFixed(2)}`, name];
                      return [value, name];
                    }}
                    labelFormatter={() => ''}
                  />
                  <Legend />
                  <Scatter 
                    name="Countries" 
                    data={countryComparisonData} 
                    fill="hsl(var(--chart-3))"
                    shape="circle"
                  />
                </ScatterChart>
              </ResponsiveContainer>
              <div className="text-xs text-muted-foreground mt-2 text-center">
                Bubble size represents investment efficiency (larger = more scholarships per tertiary unit)
              </div>
            </ChartCard>
          ) : (
            <div className="p-4 bg-card border border-border rounded-lg text-center">
              <p className="text-muted-foreground">
                {effectiveSearchTerm 
                  ? 'No country comparison data matches your search' 
                  : 'Country comparison data is available when viewing a specific year with both tertiary and scholarship data.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Data Table */}
      {(filteredTertiary.length > 0 || filteredScholarship.length > 0) ? (
        <ChartCard 
          title={effectiveSearchTerm ? `Search Results (${filteredTertiary.length + filteredScholarship.length} records)` : "Detailed Expenditure Data"} 
          isLoading={false}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-4">Country</th>
                  <th className="text-left py-2 px-4">Year</th>
                  <th className="text-right py-2 px-4">Tertiary</th>
                  <th className="text-right py-2 px-4">Scholarships</th>
                </tr>
              </thead>
              <tbody>
                {filteredTertiary.slice(0, 20).map((item: any, idx: number) => {
                  const scholarshipItem = filteredScholarship.find(
                    s => s.country_name === item.country_name && s.year === item.year
                  );
                  
                  const tertiaryValue = item.tertiary_expenditure ? 
                    `${item.tertiary_expenditure.toFixed(1)}` : '-';
                  
                  let scholarshipValue = '-';
                  if (scholarshipItem?.total_scholarships) {
                    const val = scholarshipItem.total_scholarships;
                    if (val >= 1000000) {
                      scholarshipValue = `$${(val / 1000000).toFixed(1)}M`;
                    } else if (val >= 1000) {
                      scholarshipValue = `$${(val / 1000).toFixed(1)}K`;
                    } else {
                      scholarshipValue = `$${val.toFixed(1)}`;
                    }
                  }
                  
                  return (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50">
                      <td className="py-2 px-4">{item.country_name}</td>
                      <td className="py-2 px-4">{item.year}</td>
                      <td className="text-right py-2 px-4">{tertiaryValue}</td>
                      <td className="text-right py-2 px-4">{scholarshipValue}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(filteredTertiary.length > 20) && (
              <div className="p-3 text-center text-sm text-muted-foreground border-t">
                Showing 20 of {filteredTertiary.length} records
              </div>
            )}
          </div>
        </ChartCard>
      ) : effectiveSearchTerm ? (
        <div className="p-8 text-center border rounded-lg">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No matching expenditure records found</h3>
          <p className="text-muted-foreground">
            No expenditure data matches "{effectiveSearchTerm}". Try a different search term.
          </p>
        </div>
      ) : null}
    </div>
  );
}