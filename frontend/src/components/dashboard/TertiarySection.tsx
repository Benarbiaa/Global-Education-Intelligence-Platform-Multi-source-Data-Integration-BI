import { KPICard } from './KPICard';
import { ChartCard } from './ChartCard';
import { GraduationCap, Trophy, Users, Globe, AlertCircle, Filter, Star, Shield, Target, Zap, Search, X } from 'lucide-react';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useState, useMemo } from 'react';
import {
  useTopUniversities,
  useSpecialityDiversity,
  useStudentStaffRatio,
  useFieldDistribution,
} from '@/hooks/useEducationData';

interface TertiarySectionProps {
  isLoading?: boolean;
  searchTerm?: string; // Add searchTerm prop
  year?: number; // Add year prop if needed from parent
}

const MIN_YEAR = 2018;
const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function TertiarySection({ 
  isLoading, 
  searchTerm = '', // Default to empty string
  year 
}: TertiarySectionProps) {
  const { data: universities, isLoading: uniLoading, error: uniError } = useTopUniversities();
  const { data: diversity, isLoading: divLoading, error: divError } = useSpecialityDiversity();
  const { data: staffRatio, isLoading: staffLoading, error: staffError } = useStudentStaffRatio();
  const { data: fieldDist, isLoading: fieldLoading, error: fieldError } = useFieldDistribution();

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Use parent searchTerm or local search term
  const effectiveSearchTerm = searchTerm || localSearchTerm;

  const isDataLoading = uniLoading || divLoading || staffLoading || fieldLoading || isLoading;
  const hasError = uniError || divError || staffError || fieldError;

  // Transform universities data
  const universitiesData = useMemo(() => {
    if (!universities || !Array.isArray(universities)) return [];
    return universities.slice(0, 15); // Top 15
  }, [universities]);

  // Transform diversity data - it has country_id, country_name, year, hhi
  const diversityData = useMemo(() => {
    if (!diversity || !Array.isArray(diversity)) return [];
    return diversity
      .filter((item: any) => item && typeof item === 'object')
      .slice(0, 20);
  }, [diversity]);

  // Transform staff ratio - has country_id, country_name, year, students_per_staff
  const staffRatioData = useMemo(() => {
    if (!staffRatio || !Array.isArray(staffRatio)) return [];
    return staffRatio
      .filter((item: any) => item.year >= MIN_YEAR)
      .sort((a: any, b: any) => a.year - b.year);
  }, [staffRatio]);

  // Transform field distribution - has country_id, country_name, year, field_id, field_name, avg_enrollment_percentage
  const fieldDistData = useMemo(() => {
    if (!fieldDist || !Array.isArray(fieldDist)) return [];
    return fieldDist
      .filter((item: any) => item.year >= MIN_YEAR)
      .sort((a: any, b: any) => a.year - b.year);
  }, [fieldDist]);

  // Get unique countries and years
  const countries = useMemo(() => {
    const uniqueCountries = new Set<string>();
    [staffRatioData, fieldDistData].forEach((dataset) => {
      dataset.forEach((item: any) => {
        if (item.country_name) uniqueCountries.add(item.country_name);
      });
    });
    return Array.from(uniqueCountries).sort();
  }, [staffRatioData, fieldDistData]);

  const years = useMemo(() => {
    const uniqueYears = new Set<number>();
    [staffRatioData, fieldDistData].forEach((dataset) => {
      dataset.forEach((item: any) => {
        if (item.year) uniqueYears.add(item.year);
      });
    });
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [staffRatioData, fieldDistData]);

  // Filter staff ratio data WITH SEARCH
  const filteredStaffRatio = useMemo(() => {
    return staffRatioData.filter((item: any) => {
      if (selectedCountry && item.country_name !== selectedCountry) return false;
      if (selectedYear && item.year !== selectedYear) return false;
      
      // Apply search filter
      if (effectiveSearchTerm.trim()) {
        const term = effectiveSearchTerm.toLowerCase();
        const matchesSearch = (
          (item.country_name && item.country_name.toLowerCase().includes(term)) ||
          (item.year && item.year.toString().includes(term)) ||
          (item.students_per_staff && item.students_per_staff.toString().includes(term))
        );
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [staffRatioData, selectedCountry, selectedYear, effectiveSearchTerm]);

  // Filter field distribution data WITH SEARCH
  const filteredFieldDist = useMemo(() => {
    return fieldDistData.filter((item: any) => {
      if (selectedCountry && item.country_name !== selectedCountry) return false;
      if (selectedYear && item.year !== selectedYear) return false;
      
      // Apply search filter
      if (effectiveSearchTerm.trim()) {
        const term = effectiveSearchTerm.toLowerCase();
        const matchesSearch = (
          (item.country_name && item.country_name.toLowerCase().includes(term)) ||
          (item.year && item.year.toString().includes(term)) ||
          (item.field_name && item.field_name.toLowerCase().includes(term)) ||
          (item.field && item.field.toLowerCase().includes(term)) ||
          (item.field_id && item.field_id.toLowerCase().includes(term)) ||
          (item.avg_enrollment_percentage && item.avg_enrollment_percentage.toString().includes(term))
        );
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [fieldDistData, selectedCountry, selectedYear, effectiveSearchTerm]);

  // Filter universities data WITH SEARCH
  const filteredUniversities = useMemo(() => {
    if (!universitiesData || !Array.isArray(universitiesData)) return [];
    
    return universitiesData.filter((item: any) => {
      // Apply search filter
      if (effectiveSearchTerm.trim()) {
        const term = effectiveSearchTerm.toLowerCase();
        const matchesSearch = (
          (item.university_name && item.university_name.toLowerCase().includes(term)) ||
          (item.country_name && item.country_name.toLowerCase().includes(term)) ||
          (item.country && item.country.toLowerCase().includes(term)) ||
          (item.overall_score && item.overall_score.toString().includes(term))
        );
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [universitiesData, effectiveSearchTerm]);

  // Filter diversity data WITH SEARCH
  const filteredDiversity = useMemo(() => {
    if (!diversityData || !Array.isArray(diversityData)) return [];
    
    return diversityData.filter((item: any) => {
      // Apply search filter
      if (effectiveSearchTerm.trim()) {
        const term = effectiveSearchTerm.toLowerCase();
        const matchesSearch = (
          (item.country_name && item.country_name.toLowerCase().includes(term)) ||
          (item.year && item.year.toString().includes(term)) ||
          (item.hhi && item.hhi.toString().includes(term))
        );
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [diversityData, effectiveSearchTerm]);

  // STATIC KPI CALCULATIONS - Using unfiltered data
  const staticStaffRatioKPI = useMemo(() => {
    if (staffRatioData.length === 0) {
      return { value: 'N/A', trend: 0, trendLabel: 'Latest' };
    }
    
    // Group by year and calculate average for each year
    const byYear: { [key: number]: { total: number, count: number } } = {};
    staffRatioData.forEach((item: any) => {
      if (!byYear[item.year]) {
        byYear[item.year] = { total: 0, count: 0 };
      }
      byYear[item.year].total += item.students_per_staff;
      byYear[item.year].count += 1;
    });
    
    // Sort years descending
    const sortedYears = Object.keys(byYear).map(Number).sort((a, b) => b - a);
    
    if (sortedYears.length === 0) {
      return { value: 'N/A', trend: 0, trendLabel: 'Latest' };
    }
    
    const latestYear = sortedYears[0];
    const latestAvg = byYear[latestYear].total / byYear[latestYear].count;
    
    // Calculate trend: compare with previous year if available
    let trend = 0;
    let trendLabel = `Year ${latestYear}`;
    
    if (sortedYears.length >= 2) {
      const previousYear = sortedYears[1];
      const previousAvg = byYear[previousYear].total / byYear[previousYear].count;
      
      if (previousAvg > 0) {
        trend = ((latestAvg - previousAvg) / previousAvg) * 100;
        trendLabel = `vs ${previousYear}`;
      }
    }
    
    // Calculate rating based on ratio (lower is better)
    let rating = 'Very High';
    if (latestAvg > 20) rating = 'High';
    if (latestAvg > 30) rating = 'Moderate';
    if (latestAvg > 40) rating = 'Low';
    
    return {
      value: latestAvg.toFixed(2),
      trend: Number(trend.toFixed(1)),
      trendLabel: `${rating} Quality`
    };
  }, [staffRatioData]); // Using unfiltered data

  // Calculate Speciality Diversity Index KPI data (Static)
  const staticDiversityKPI = useMemo(() => {
    if (diversityData.length === 0) {
      return { value: 'N/A', trend: 0, trendLabel: 'Available countries' };
    }
    
    // Sort by HHI index (ascending for most diverse, or use latest year if available)
    const sortedDiversity = [...diversityData].sort((a: any, b: any) => {
      // Try to sort by year first (most recent)
      if (a.year && b.year) {
        return b.year - a.year;
      }
      // Then by HHI (lower HHI = more diverse)
      return (a.hhi || 1) - (b.hhi || 1);
    });
    
    const topCountry = sortedDiversity[0];
    
    // Determine diversity level based on HHI
    let diversityLevel = 'Very High';
    if (topCountry.hhi > 0.15) diversityLevel = 'High';
    if (topCountry.hhi > 0.25) diversityLevel = 'Moderate';
    if (topCountry.hhi > 0.35) diversityLevel = 'Low';
    
    return {
      value: topCountry.country_name?.substring(0, 12) || 'N/A',
      trend: topCountry.hhi ? Number(topCountry.hhi.toFixed(3)) : 0,
      trendLabel: `${diversityLevel} Diversity`
    };
  }, [diversityData]); // Using unfiltered data

  // Calculate Field Distribution KPI data (Static)
  const staticFieldDistributionKPI = useMemo(() => {
    if (fieldDistData.length === 0) {
      return { value: 'N/A', trend: 0, trendLabel: 'Total records' };
    }
    
    // Get the field with highest enrollment percentage
    let topField = null;
    let maxPercentage = 0;
    
    // Group by field to find the most popular field
    const fieldMap: { [key: string]: { total: number, count: number, name: string } } = {};
    
    fieldDistData.forEach((item: any) => {
      const fieldName = item.field_name || item.field || item.field_id || 'Unknown';
      const percentage = item.avg_enrollment_percentage || 0;
      
      if (!fieldMap[fieldName]) {
        fieldMap[fieldName] = { total: 0, count: 0, name: fieldName };
      }
      fieldMap[fieldName].total += percentage;
      fieldMap[fieldName].count += 1;
    });
    
    // Find field with highest average percentage
    Object.values(fieldMap).forEach(field => {
      const avgPercentage = field.total / field.count;
      if (avgPercentage > maxPercentage) {
        maxPercentage = avgPercentage;
        topField = field.name;
      }
    });
    
    // Calculate trend: compare latest year with previous year
    let trend = 0;
    const trendLabel = `${maxPercentage.toFixed(1)}% share`;
    
    // Group by year to calculate trend
    const byYear: { [key: number]: number } = {};
    fieldDistData.forEach((item: any) => {
      if (!byYear[item.year]) {
        byYear[item.year] = 0;
      }
      byYear[item.year] += item.avg_enrollment_percentage || 0;
    });
    
    const sortedYears = Object.keys(byYear).map(Number).sort((a, b) => b - a);
    
    if (sortedYears.length >= 2) {
      const latestYear = sortedYears[0];
      const previousYear = sortedYears[1];
      const latestTotal = byYear[latestYear];
      const previousTotal = byYear[previousYear];
      
      // Count records for each year to get average
      const countByYear: { [key: number]: number } = {};
      fieldDistData.forEach((item: any) => {
        countByYear[item.year] = (countByYear[item.year] || 0) + 1;
      });
      
      const latestAvg = latestTotal / (countByYear[latestYear] || 1);
      const previousAvg = previousTotal / (countByYear[previousYear] || 1);
      
      if (previousAvg > 0) {
        trend = ((latestAvg - previousAvg) / previousAvg) * 100;
      }
    }
    
    return {
      value: topField?.substring(0, 12) || 'N/A',
      trend: Number(trend.toFixed(1)),
      trendLabel
    };
  }, [fieldDistData]); // Using unfiltered data

  // Get top university for KPI (Static)
  const staticTopUniversity = useMemo(() => {
    if (!universitiesData || universitiesData.length === 0) return null;
    const topUni = universitiesData[0]; // Get the top university
    
    // Calculate rating based on score
    let rating = 'Very High';
    if (topUni.overall_score < 90) rating = 'High';
    if (topUni.overall_score < 80) rating = 'Moderate';
    if (topUni.overall_score < 70) rating = 'Low';
    
    return {
      ...topUni,
      rating
    };
  }, [universitiesData]); // Using unfiltered data

  // Calculate search results summary
  const totalSearchResults = filteredStaffRatio.length + filteredFieldDist.length + filteredUniversities.length + filteredDiversity.length;

  const handleClearSearch = () => {
    setLocalSearchTerm('');
  };

  // Helper function to get diversity badge styling
  const getDiversityBadgeStyle = (hhi: number) => {
    if (hhi < 0.15) return "bg-green-100 text-green-800 border-green-200";
    if (hhi < 0.25) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (hhi < 0.35) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  // Helper function to get diversity level text
  const getDiversityLevel = (hhi: number) => {
    if (hhi < 0.15) return "Very High";
    if (hhi < 0.25) return "High";
    if (hhi < 0.35) return "Moderate";
    return "Low";
  };

  // Prepare chart data for staff ratio
  const staffChartData = useMemo(() => {
    // Don't prepare trend data if a specific year is selected
    if (selectedYear !== null) return [];
    
    const byYear: { [key: number]: any } = {};
    filteredStaffRatio.forEach((item: any) => {
      if (!byYear[item.year]) byYear[item.year] = { year: item.year, avg: 0, count: 0 };
      byYear[item.year].total = (byYear[item.year].total || 0) + item.students_per_staff;
      byYear[item.year].count += 1;
    });
    return Object.values(byYear)
      .map((item: any) => ({ ...item, ratio: item.total / item.count }))
      .sort((a: any, b: any) => a.year - b.year);
  }, [filteredStaffRatio, selectedYear]);

  // Prepare field distribution pie chart data
  const fieldChartData = useMemo(() => {
    if (filteredFieldDist.length === 0) return [];
    
    // Get latest year data
    const latestYear = Math.max(...filteredFieldDist.map((item: any) => item.year));
    const latestData = filteredFieldDist.filter((item: any) => item.year === latestYear);
    
    // Group by field (prefer human-readable name, fallback to id)
    const byField: { [key: string]: any } = {};
    latestData.forEach((item: any) => {
      const fname = item.field_name || item.field || item.field_id || 'Field';
      if (!byField[fname]) {
        byField[fname] = { name: fname, value: 0 };
      }
      byField[fname].value += item.avg_enrollment_percentage;
    });
    
    return Object.values(byField);
  }, [filteredFieldDist]);

  // Prepare field distribution line chart
  const fieldTrendData = useMemo(() => {
    const byYear: { [key: number]: any } = {};
    filteredFieldDist.forEach((item: any) => {
      if (!byYear[item.year]) byYear[item.year] = { year: item.year };
      const fieldName = (item.field_name || item.field || item.field_id || 'Field').substring(0, 20);
      byYear[item.year][fieldName] = item.avg_enrollment_percentage;
    });
    return Object.values(byYear).sort((a: any, b: any) => a.year - b.year);
  }, [filteredFieldDist]);

  // Determine if trend chart should be shown
  const showStaffTrendChart = selectedYear === null;

  return (
    <div className="space-y-6">
      {hasError && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div className="text-sm">
            <p className="font-semibold text-red-900">Data Issue</p>
            <p className="text-red-800">Some tertiary education data may be unavailable.</p>
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
                Showing tertiary results for: <span className="font-bold">"{searchTerm}"</span>
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
                placeholder="Search within tertiary data..."
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

      {/* STATIC KPI Cards - Using static calculations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Student-Staff Ratio"
          value={staticStaffRatioKPI.value}
          trend={staticStaffRatioKPI.trend}
          trendLabel={staticStaffRatioKPI.trendLabel}
          icon={<Users className="h-6 w-6" />}
          variant="tertiary"
          isLoading={staffLoading}
        />
        <KPICard
          title="Speciality Diversity Index"
          value={staticDiversityKPI.value}
          trend={staticDiversityKPI.trend}
          trendLabel={staticDiversityKPI.trendLabel}
          icon={<Globe className="h-6 w-6" />}
          variant="tertiary"
          isLoading={divLoading}
        />
        <KPICard
          title="Top University"
          value={staticTopUniversity?.university_name?.substring(0, 12) || 'N/A'}
          trend={staticTopUniversity?.overall_score || 0}
          trendLabel={`${staticTopUniversity?.rating || 'N/A'} Rating`}
          icon={<Trophy className="h-6 w-6" />}
          variant="tertiary"
          isLoading={uniLoading}
        />
        <KPICard
          title="Field Distribution"
          value={staticFieldDistributionKPI.value}
          trend={staticFieldDistributionKPI.trend}
          trendLabel={staticFieldDistributionKPI.trendLabel}
          icon={<GraduationCap className="h-6 w-6" />}
          variant="tertiary"
          isLoading={fieldLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {showStaffTrendChart ? (
          <ChartCard
            title="Student-Staff Ratio Trend"
            subtitle={selectedCountry ? selectedCountry : 'All Countries'}
            isLoading={isDataLoading}
          >
            {staffChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={staffChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: 'Ratio', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: any) => (value as number)?.toFixed(2)}
                    labelFormatter={(label) => `Year: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ratio" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Students per Staff"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-300 text-muted-foreground">
                {effectiveSearchTerm ? 'No staff ratio data matches your search' : 'No staff ratio data available'}
              </div>
            )}
          </ChartCard>
        ) : (
          <ChartCard
            title={`Student-Staff Ratio (${selectedYear})`}
            subtitle={selectedCountry ? selectedCountry : 'All Countries'}
            isLoading={isDataLoading}
          >
            {filteredStaffRatio.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredStaffRatio.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="country_name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    label={{ value: 'Students per Staff', angle: -90, position: 'insideLeft' }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: any) => (value as number)?.toFixed(2)}
                    labelFormatter={(label) => `Country: ${label}`}
                  />
                  <Bar 
                    dataKey="students_per_staff" 
                    fill="hsl(var(--chart-1))" 
                    name="Students per Staff"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-300 text-muted-foreground">
                {effectiveSearchTerm ? 'No staff ratio data matches your search' : 'No staff ratio data available for selected filters'}
              </div>
            )}
          </ChartCard>
        )}

        <ChartCard
          title="Field Distribution (Latest Year)"
          subtitle={selectedCountry ? selectedCountry : 'All Countries'}
          isLoading={isDataLoading}
        >
          {fieldChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fieldChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name.substring(0, 15)}: ${value.toFixed(1)}%`}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {fieldChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(value: any) => `${(value as number).toFixed(1)}%`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-300 text-muted-foreground">
              {effectiveSearchTerm ? 'No field distribution data matches your search' : 'No field distribution data available'}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Field Distribution Trend */}
      {fieldTrendData.length > 0 && selectedYear === null ? (
        <ChartCard
          title="Field Enrollment Trends"
          subtitle={selectedCountry ? selectedCountry : 'All Countries'}
          isLoading={isDataLoading}
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={fieldTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: '% Enrollment', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                formatter={(value: any) => `${((value as number)?.toFixed(1))}%`}
                labelFormatter={(label) => `Year: ${label}`}
              />
              <Legend />
              {Object.keys(fieldTrendData[0] || {})
                .filter(key => key !== 'year')
                .slice(0, 4)
                .map((field, idx) => (
                  <Bar key={field} dataKey={field} fill={COLORS[idx % COLORS.length]} name={field} />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      ) : effectiveSearchTerm && selectedYear === null ? (
        <div className="p-4 border rounded-lg">
          <div className="text-center text-muted-foreground">
            No field trend data matches "{effectiveSearchTerm}"
          </div>
        </div>
      ) : null}

      {/* Top Universities Table */}
      {filteredUniversities.length > 0 ? (
        <ChartCard 
          title={effectiveSearchTerm ? `Top Universities Search Results (${filteredUniversities.length} records)` : "Top Universities by Overall Score"} 
          isLoading={false}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Rank</th>
                  <th className="text-left py-3 px-4">University Name</th>
                  <th className="text-left py-3 px-4">Country</th>
                  <th className="text-right py-3 px-4">Score</th>
                  <th className="text-center py-3 px-4">Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredUniversities.map((item: any, idx: number) => {
                  const score = item.overall_score || 0;
                  let ratingColor = "bg-red-100 text-red-800";
                  let ratingText = "Low";
                  
                  if (score >= 90) {
                    ratingColor = "bg-green-100 text-green-800";
                    ratingText = "Very High";
                  } else if (score >= 80) {
                    ratingColor = "bg-blue-100 text-blue-800";
                    ratingText = "High";
                  } else if (score >= 70) {
                    ratingColor = "bg-yellow-100 text-yellow-800";
                    ratingText = "Moderate";
                  }
                  
                  return (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50">
                      <td className="py-2 px-4 font-medium">#{idx + 1}</td>
                      <td className="py-2 px-4 font-medium">{item.university_name}</td>
                      <td className="py-2 px-4">{item.country_name || item.country || 'N/A'}</td>
                      <td className="text-right py-2 px-4 font-semibold">{score.toFixed(1)}</td>
                      <td className="text-center py-2 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ratingColor}`}>
                          {ratingText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredUniversities.length > 15 && (
              <div className="p-3 text-center text-sm text-muted-foreground border-t">
                Showing {filteredUniversities.length} of {universitiesData.length} universities
              </div>
            )}
          </div>
        </ChartCard>
      ) : effectiveSearchTerm ? (
        <div className="p-4 border rounded-lg">
          <div className="text-center text-muted-foreground">
            No universities match "{effectiveSearchTerm}"
          </div>
        </div>
      ) : null}

      {/* Diversity Countries Table */}
      {filteredDiversity.length > 0 ? (
        <ChartCard 
          title={effectiveSearchTerm ? `Diversity Index Search Results (${filteredDiversity.length} records)` : "Speciality Diversity Index by Country"} 
          isLoading={false}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Rank</th>
                  <th className="text-left py-3 px-4">Country</th>
                  <th className="text-right py-3 px-4">HHI Index</th>
                  <th className="text-center py-3 px-4">Diversity Level</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiversity.slice(0, 15).map((item: any, idx: number) => {
                  const hhi = item.hhi || 0;
                  const badgeStyle = getDiversityBadgeStyle(hhi);
                  const diversityLevel = getDiversityLevel(hhi);
                  
                  return (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50">
                      <td className="py-2 px-4 font-medium">#{idx + 1}</td>
                      <td className="py-2 px-4 font-medium">{item.country_name}</td>
                      <td className="text-right py-2 px-4 font-mono">{hhi.toFixed(4)}</td>
                      <td className="text-center py-2 px-4">
                        <div className="flex items-center justify-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badgeStyle}`}>
                            {diversityLevel}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredDiversity.length > 15 && (
              <div className="p-3 text-center text-sm text-muted-foreground border-t">
                Showing 15 of {filteredDiversity.length} records
              </div>
            )}
          </div>
        </ChartCard>
      ) : effectiveSearchTerm ? (
        <div className="p-4 border rounded-lg">
          <div className="text-center text-muted-foreground">
            No diversity data matches "{effectiveSearchTerm}"
          </div>
        </div>
      ) : null}

      {/* Staff Ratio Detailed Table */}
      {filteredStaffRatio.length > 0 ? (
        <ChartCard 
          title={effectiveSearchTerm ? `Staff Ratio Search Results (${filteredStaffRatio.length} records)` : "Student-Staff Ratio Details"} 
          isLoading={false}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Country</th>
                  <th className="text-left py-3 px-4">Year</th>
                  <th className="text-right py-3 px-4">Students per Staff</th>
                  <th className="text-center py-3 px-4">Quality Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaffRatio.slice(0, 20).map((item: any, idx: number) => {
                  const ratio = item.students_per_staff || 0;
                  let ratingColor = "bg-green-100 text-green-800";
                  let ratingText = "Very High";
                  
                  if (ratio > 20) {
                    ratingColor = "bg-blue-100 text-blue-800";
                    ratingText = "High";
                  }
                  if (ratio > 30) {
                    ratingColor = "bg-yellow-100 text-yellow-800";
                    ratingText = "Moderate";
                  }
                  if (ratio > 40) {
                    ratingColor = "bg-red-100 text-red-800";
                    ratingText = "Low";
                  }
                  
                  return (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50">
                      <td className="py-2 px-4">{item.country_name}</td>
                      <td className="py-2 px-4">{item.year}</td>
                      <td className="text-right py-2 px-4 font-semibold">{ratio.toFixed(2)}</td>
                      <td className="text-center py-2 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ratingColor}`}>
                          {ratingText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredStaffRatio.length > 20 && (
              <div className="p-3 text-center text-sm text-muted-foreground border-t">
                Showing 20 of {filteredStaffRatio.length} records
              </div>
            )}
          </div>
        </ChartCard>
      ) : effectiveSearchTerm ? (
        <div className="p-4 border rounded-lg">
          <div className="text-center text-muted-foreground">
            No staff ratio data matches "{effectiveSearchTerm}"
          </div>
        </div>
      ) : null}

      {/* No Results Message */}
      {effectiveSearchTerm && 
       filteredStaffRatio.length === 0 && 
       filteredUniversities.length === 0 && 
       filteredDiversity.length === 0 && 
       filteredFieldDist.length === 0 && (
        <div className="p-8 text-center border rounded-lg">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No matching tertiary records found</h3>
          <p className="text-muted-foreground">
            No tertiary education data matches "{effectiveSearchTerm}". Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}