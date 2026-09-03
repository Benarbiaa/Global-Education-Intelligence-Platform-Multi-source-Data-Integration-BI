import { KPICard } from './KPICard';
import { ChartCard } from './ChartCard';
import { Users, UserCheck, Plane, Building, AlertCircle, Filter, GraduationCap, TrendingUp, Search, X } from 'lucide-react';
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useState, useMemo } from 'react';
import {
  useGrossEnrollmentRatio,
  usePublicPrivateShare,
  useAbroadMobility,
  useGraduationRateByGender,
} from '@/hooks/useEducationData';

interface EnrollmentSectionProps {
  isLoading?: boolean;
  searchTerm?: string; // Add searchTerm prop
  year?: number; // Add year prop if needed from parent
}

const MIN_YEAR = 2018;
const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function EnrollmentSection({ 
  isLoading, 
  searchTerm = '', // Default to empty string
  year 
}: EnrollmentSectionProps) {
  const { data: enrollment, isLoading: enrollLoading, error: enrollError } = useGrossEnrollmentRatio();
  const { data: publicPrivate, isLoading: ppLoading, error: ppError } = usePublicPrivateShare();
  const { data: mobility, isLoading: mobLoading, error: mobError } = useAbroadMobility();
  const { data: genderGrad, isLoading: genderLoading, error: genderError } = useGraduationRateByGender();

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Use parent searchTerm or local search term
  const effectiveSearchTerm = searchTerm || localSearchTerm;

  const isDataLoading = enrollLoading || ppLoading || mobLoading || genderLoading || isLoading;
  const hasError = enrollError || ppError || mobError || genderError;

  // Transform enrollment data - filter and sort
  const enrollmentData = useMemo(() => {
    if (!enrollment || !Array.isArray(enrollment)) return [];
    return enrollment
      .filter((item: any) => item.year >= MIN_YEAR)
      .sort((a: any, b: any) => a.year - b.year);
  }, [enrollment]);

  // Transform public/private data
  const ppData = useMemo(() => {
    if (!publicPrivate || !Array.isArray(publicPrivate)) return [];
    return publicPrivate
      .filter((item: any) => item.year >= MIN_YEAR)
      .sort((a: any, b: any) => a.year - b.year);
  }, [publicPrivate]);

  // Transform mobility data
  const mobilityData = useMemo(() => {
    if (!mobility || !Array.isArray(mobility)) return [];
    return mobility
      .filter((item: any) => item.year >= MIN_YEAR)
      .sort((a: any, b: any) => a.year - b.year);
  }, [mobility]);

  // Transform gender graduation data
  const genderData = useMemo(() => {
    if (!genderGrad || !Array.isArray(genderGrad)) return [];
    return genderGrad
      .filter((item: any) => item.year >= MIN_YEAR)
      .sort((a: any, b: any) => a.year - b.year);
  }, [genderGrad]);

  // Get unique countries and years
  const countries = useMemo(() => {
    const uniqueCountries = new Set<string>();
    enrollmentData.forEach((item: any) => {
      if (item.country_name) uniqueCountries.add(item.country_name);
    });
    return Array.from(uniqueCountries).sort();
  }, [enrollmentData]);

  const years = useMemo(() => {
    const uniqueYears = new Set<number>();
    [enrollmentData, ppData, mobilityData, genderData].forEach((dataset) => {
      dataset.forEach((item: any) => {
        if (item.year) uniqueYears.add(item.year);
      });
    });
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [enrollmentData, ppData, mobilityData, genderData]);

  // Filter data WITH SEARCH
  const filteredEnrollment = useMemo(() => {
    return enrollmentData.filter((item: any) => {
      if (selectedCountry && item.country_name !== selectedCountry) return false;
      if (selectedYear && item.year !== selectedYear) return false;
      
      // Apply search filter
      if (effectiveSearchTerm.trim()) {
        const term = effectiveSearchTerm.toLowerCase();
        const matchesSearch = (
          (item.country_name && item.country_name.toLowerCase().includes(term)) ||
          (item.year && item.year.toString().includes(term)) ||
          (item.yoy_growth && item.yoy_growth.toString().toLowerCase().includes(term))
        );
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [enrollmentData, selectedCountry, selectedYear, effectiveSearchTerm]);

  const filteredPP = useMemo(() => {
    return ppData.filter((item: any) => {
      if (selectedCountry && item.country_name !== selectedCountry) return false;
      if (selectedYear && item.year !== selectedYear) return false;
      
      // Apply search filter
      if (effectiveSearchTerm.trim()) {
        const term = effectiveSearchTerm.toLowerCase();
        const matchesSearch = (
          (item.country_name && item.country_name.toLowerCase().includes(term)) ||
          (item.year && item.year.toString().includes(term)) ||
          (item.public_share && item.public_share.toString().toLowerCase().includes(term)) ||
          (item.private_share && item.private_share.toString().toLowerCase().includes(term))
        );
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [ppData, selectedCountry, selectedYear, effectiveSearchTerm]);

  const filteredMobility = useMemo(() => {
    return mobilityData.filter((item: any) => {
      if (selectedCountry && item.country_name !== selectedCountry) return false;
      if (selectedYear && item.year !== selectedYear) return false;
      
      // Apply search filter
      if (effectiveSearchTerm.trim()) {
        const term = effectiveSearchTerm.toLowerCase();
        const matchesSearch = (
          (item.country_name && item.country_name.toLowerCase().includes(term)) ||
          (item.year && item.year.toString().includes(term)) ||
          (item.outbound_mobility_ratio && item.outbound_mobility_ratio.toString().toLowerCase().includes(term))
        );
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [mobilityData, selectedCountry, selectedYear, effectiveSearchTerm]);

  const filteredGender = useMemo(() => {
    return genderData.filter((item: any) => {
      if (selectedCountry && item.country_name !== selectedCountry) return false;
      if (selectedYear && item.year !== selectedYear) return false;
      
      // Apply search filter
      if (effectiveSearchTerm.trim()) {
        const term = effectiveSearchTerm.toLowerCase();
        const matchesSearch = (
          (item.country_name && item.country_name.toLowerCase().includes(term)) ||
          (item.year && item.year.toString().includes(term)) ||
          (item.gender && item.gender.toLowerCase().includes(term)) ||
          (item.average_graduation_rate && item.average_graduation_rate.toString().toLowerCase().includes(term))
        );
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [genderData, selectedCountry, selectedYear, effectiveSearchTerm]);

  // STATIC KPI CALCULATIONS - Use unfiltered data (search doesn't affect KPIs)
  const staticEnrollmentKPI = useMemo(() => {
    if (enrollmentData.length === 0) {
      return { value: 'N/A', trend: 0, trendLabel: 'Latest' };
    }
    
    // Group by year
    const byYear: { [key: number]: { total: number, count: number } } = {};
    enrollmentData.forEach((item: any) => {
      if (!byYear[item.year]) {
        byYear[item.year] = { total: 0, count: 0 };
      }
      byYear[item.year].total += item.yoy_growth || 0;
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
      
      // Calculate change in growth rate (acceleration/deceleration of growth)
      trend = latestAvg - previousAvg;
      trendLabel = `vs ${previousYear}`;
    }
    
    return {
      value: latestAvg.toFixed(2) + '%',
      trend: Number(trend.toFixed(2)),
      trendLabel
    };
  }, [enrollmentData]);

  // Calculate Public Share KPI (Static - using latest available data)
  const staticPublicShareKPI = useMemo(() => {
    if (ppData.length === 0) {
      return { value: 'N/A', trend: 0, trendLabel: 'Latest' };
    }
    
    // Get latest year data
    const latestYear = Math.max(...ppData.map((item: any) => item.year));
    const latestData = ppData.filter((item: any) => item.year === latestYear);
    
    if (latestData.length === 0) {
      return { value: 'N/A', trend: 0, trendLabel: 'Latest' };
    }
    
    // Calculate average public share for latest year
    const latestTotal = latestData.reduce((sum: number, item: any) => sum + (item.public_share || 0), 0);
    const latestAvg = latestTotal / latestData.length;
    
    // Get country with highest public share
    let highestCountry = 'Global Avg';
    let highestShare = latestAvg;
    
    latestData.forEach((item: any) => {
      if (item.public_share > highestShare) {
        highestShare = item.public_share;
        highestCountry = item.country_name || 'Unknown';
      }
    });
    
    // Calculate trend: compare with previous year
    let trend = 0;
    const previousYear = Math.max(...ppData.map((item: any) => item.year).filter(y => y < latestYear));
    
    if (previousYear) {
      const previousData = ppData.filter((item: any) => item.year === previousYear);
      if (previousData.length > 0) {
        const previousTotal = previousData.reduce((sum: number, item: any) => sum + (item.public_share || 0), 0);
        const previousAvg = previousTotal / previousData.length;
        
        if (previousAvg > 0) {
          trend = ((latestAvg - previousAvg) / previousAvg) * 100;
        }
      }
    }
    
    return {
      value: highestShare.toFixed(1) + '%',
      trend: Number(trend.toFixed(1)),
      trendLabel: highestCountry
    };
  }, [ppData]);

  // Calculate Outbound Mobility KPI (Static - using latest available data)
  const staticMobilityKPI = useMemo(() => {
    if (mobilityData.length === 0) {
      return { value: 'N/A', trend: 0, trendLabel: 'Latest' };
    }
    
    // Group by year
    const byYear: { [key: number]: { total: number, count: number } } = {};
    mobilityData.forEach((item: any) => {
      if (!byYear[item.year]) {
        byYear[item.year] = { total: 0, count: 0 };
      }
      byYear[item.year].total += item.outbound_mobility_ratio || 0;
      byYear[item.year].count += 1;
    });
    
    // Sort years descending
    const sortedYears = Object.keys(byYear).map(Number).sort((a, b) => b - a);
    
    if (sortedYears.length === 0) {
      return { value: 'N/A', trend: 0, trendLabel: 'Latest' };
    }
    
    const latestYear = sortedYears[0];
    const latestAvg = byYear[latestYear].total / byYear[latestYear].count;
    
    // Calculate trend: compare with previous year
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
    
    return {
      value: latestAvg.toFixed(2) + '%',
      trend: Number(trend.toFixed(1)),
      trendLabel
    };
  }, [mobilityData]);

  // Calculate Gender Gap KPI (Static - using latest available data)
  const staticGenderGapKPI = useMemo(() => {
    if (genderData.length === 0) {
      return { value: 'N/A', trend: 0, trendLabel: 'Latest' };
    }
    
    // Get latest year data
    const latestYear = Math.max(...genderData.map((item: any) => item.year));
    const latestData = genderData.filter((item: any) => item.year === latestYear);
    
    if (latestData.length < 2) {
      return { value: 'N/A', trend: 0, trendLabel: `Year ${latestYear}` };
    }
    
    // Calculate female and male graduation rates
    let femaleRate = 0;
    let maleRate = 0;
    
    latestData.forEach((item: any) => {
      if (item.gender === 'Female') {
        femaleRate = item.average_graduation_rate || 0;
      } else if (item.gender === 'Male') {
        maleRate = item.average_graduation_rate || 0;
      }
    });
    
    // Calculate gender gap (difference)
    const gap = femaleRate - maleRate;
    const gapPercentage = (gap / Math.max(femaleRate, maleRate)) * 100;
    
    // Determine trend direction
    let trend = 0;
    const previousYear = Math.max(...genderData.map((item: any) => item.year).filter(y => y < latestYear));
    
    if (previousYear) {
      const previousData = genderData.filter((item: any) => item.year === previousYear);
      if (previousData.length >= 2) {
        let prevFemale = 0;
        let prevMale = 0;
        
        previousData.forEach((item: any) => {
          if (item.gender === 'Female') {
            prevFemale = item.average_graduation_rate || 0;
          } else if (item.gender === 'Male') {
            prevMale = item.average_graduation_rate || 0;
          }
        });
        
        const prevGap = prevFemale - prevMale;
        const prevGapPercentage = (prevGap / Math.max(prevFemale, prevMale)) * 100;
        
        if (prevGapPercentage !== 0) {
          trend = ((gapPercentage - prevGapPercentage) / Math.abs(prevGapPercentage)) * 100;
        }
      }
    }
    
    // Determine gap description
    let gapDescription = 'Equal';
    if (gap > 2) gapDescription = 'Female Lead';
    else if (gap < -2) gapDescription = 'Male Lead';
    
    return {
      value: gapDescription,
      trend: Number(trend.toFixed(1)),
      trendLabel: `Gap: ${gap.toFixed(1)}%`
    };
  }, [genderData]);

  // Prepare chart data - conditionally return empty arrays for trend charts when year is selected
  const enrollmentChartData = useMemo(() => {
    // Don't prepare trend data if a specific year is selected
    if (selectedYear !== null) return [];
    
    const byYear: { [key: number]: any } = {};
    filteredEnrollment.forEach((item: any) => {
      if (!byYear[item.year]) byYear[item.year] = { year: item.year };
      byYear[item.year].yoy = item.yoy_growth;
    });
    return Object.values(byYear).sort((a: any, b: any) => a.year - b.year);
  }, [filteredEnrollment, selectedYear]);

  // Prepare public/private chart data
  const ppChartData = useMemo(() => {
    // If a year is selected, prepare pie chart data
    if (selectedYear !== null) {
      // Calculate average public and private share for selected year
      const yearData = filteredPP.filter((item: any) => item.year === selectedYear);
      
      if (yearData.length === 0) return [];
      
      const totalPublic = yearData.reduce((sum: number, item: any) => sum + (item.public_share || 0), 0);
      const totalPrivate = yearData.reduce((sum: number, item: any) => sum + (item.private_share || 0), 0);
      const avgPublic = totalPublic / yearData.length;
      const avgPrivate = totalPrivate / yearData.length;
      
      return [
        { name: 'Public', value: avgPublic, color: 'hsl(var(--chart-1))' },
        { name: 'Private', value: avgPrivate, color: 'hsl(var(--chart-2))' }
      ];
    }
    
    // Otherwise prepare trend data for bar chart
    const byYear: { [key: number]: any } = {};
    filteredPP.forEach((item: any) => {
      if (!byYear[item.year]) byYear[item.year] = { year: item.year };
      byYear[item.year].public = item.public_share;
      byYear[item.year].private = item.private_share;
    });
    return Object.values(byYear).sort((a: any, b: any) => a.year - b.year);
  }, [filteredPP, selectedYear]);

  const mobilityChartData = useMemo(() => {
    // Don't prepare trend data if a specific year is selected
    if (selectedYear !== null) return [];
    
    const byYear: { [key: number]: any } = {};
    filteredMobility.forEach((item: any) => {
      if (!byYear[item.year]) byYear[item.year] = { year: item.year };
      byYear[item.year].outbound = item.outbound_mobility_ratio;
    });
    return Object.values(byYear).sort((a: any, b: any) => a.year - b.year);
  }, [filteredMobility, selectedYear]);

  // Prepare gender data
  const genderTrendChartData = useMemo(() => {
    // Always prepare trend data, but only use it when no year is selected
    const byYear: { [key: number]: any } = {};
    filteredGender.forEach((item: any) => {
      if (!byYear[item.year]) byYear[item.year] = { year: item.year };
      if (item.gender === 'Female') byYear[item.year].female = item.average_graduation_rate;
      else if (item.gender === 'Male') byYear[item.year].male = item.average_graduation_rate;
    });
    return Object.values(byYear).sort((a: any, b: any) => a.year - b.year);
  }, [filteredGender]);

  const genderBarChartData = useMemo(() => {
    // Bar chart data for when a specific year is selected
    if (selectedYear === null) return [];
    
    const genderMap: { [key: string]: number } = {};
    filteredGender.forEach((item: any) => {
      if (item.gender && item.average_graduation_rate !== undefined) {
        genderMap[item.gender] = item.average_graduation_rate;
      }
    });
    
    // Convert to array format for bar chart
    return Object.entries(genderMap).map(([gender, rate]) => ({
      gender,
      rate: Number(rate.toFixed(2))
    }));
  }, [filteredGender, selectedYear]);

  // Determine if trend charts should be shown
  const showTrendCharts = selectedYear === null;

  // Calculate search results summary
  const totalSearchResults = filteredEnrollment.length + filteredPP.length + filteredMobility.length + filteredGender.length;

  const handleClearSearch = () => {
    setLocalSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {hasError && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div className="text-sm">
            <p className="font-semibold text-red-900">Data Issue</p>
            <p className="text-red-800">Some enrollment data may be unavailable.</p>
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
                placeholder="Search within enrollment data..."
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="YoY Enrollment Growth"
          value={staticEnrollmentKPI.value}
          trend={staticEnrollmentKPI.trend}
          trendLabel={staticEnrollmentKPI.trendLabel}
          icon={<TrendingUp className="h-6 w-6" />}
          variant="enrollment"
          isLoading={enrollLoading}
        />
        <KPICard
          title="Public Share"
          value={staticPublicShareKPI.value}
          trend={staticPublicShareKPI.trend}
          trendLabel={staticPublicShareKPI.trendLabel}
          icon={<Building className="h-6 w-6" />}
          variant="enrollment"
          isLoading={ppLoading}
        />
        <KPICard
          title="Outbound Mobility"
          value={staticMobilityKPI.value}
          trend={staticMobilityKPI.trend}
          trendLabel={staticMobilityKPI.trendLabel}
          icon={<Plane className="h-6 w-6" />}
          variant="enrollment"
          isLoading={mobLoading}
        />
        <KPICard
          title="Graduation Gender Gap"
          value={staticGenderGapKPI.value}
          trend={staticGenderGapKPI.trend}
          trendLabel={staticGenderGapKPI.trendLabel}
          icon={<GraduationCap className="h-6 w-6" />}
          variant="enrollment"
          isLoading={genderLoading}
        />
      </div>

      {/* Charts - These will reflect search results */}
      {showTrendCharts ? (
        // Show all trend charts when no year is selected
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Enrollment YoY Growth"
              subtitle={selectedCountry ? selectedCountry : 'All Countries'}
              isLoading={isDataLoading}
              searchTerm={effectiveSearchTerm}
            >
              {enrollmentChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={enrollmentChartData}>
                    <defs>
                      <linearGradient id="enrollGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: '% Change', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: any) => (value as number)?.toFixed(2)}
                    />
                    <Area type="monotone" dataKey="yoy" fill="url(#enrollGradient)" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-300 text-muted-foreground">
                  {effectiveSearchTerm ? 'No data matches your search' : 'No data available'}
                </div>
              )}
            </ChartCard>

            <ChartCard
              title="Public vs Private Enrollment"
              subtitle={selectedCountry ? selectedCountry : 'All Countries'}
              isLoading={isDataLoading}
              searchTerm={effectiveSearchTerm}
            >
              {ppChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ppChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: any) => `${((value as number)?.toFixed(1))}%`}
                    />
                    <Legend />
                    <Bar dataKey="public" fill="hsl(var(--chart-1))" name="Public %" stackId="a" />
                    <Bar dataKey="private" fill="hsl(var(--chart-2))" name="Private %" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-300 text-muted-foreground">
                  {effectiveSearchTerm ? 'No data matches your search' : 'No data available'}
                </div>
              )}
            </ChartCard>
          </div>

          {/* Mobility and Gender Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Student Outbound Mobility"
              subtitle={selectedCountry ? selectedCountry : 'All Countries'}
              isLoading={isDataLoading}
              searchTerm={effectiveSearchTerm}
            >
              {mobilityChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mobilityChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: '% Ratio', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: any) => `${((value as number)?.toFixed(2))}%`}
                    />
                    <Line type="monotone" dataKey="outbound" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 4 }} name="Outbound %" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-300 text-muted-foreground">
                  {effectiveSearchTerm ? 'No data matches your search' : 'No data available'}
                </div>
              )}
            </ChartCard>

            <ChartCard
              title="Graduation Rate by Gender (Trend)"
              subtitle={selectedCountry ? selectedCountry : 'All Countries'}
              isLoading={isDataLoading}
              searchTerm={effectiveSearchTerm}
            >
              {genderTrendChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={genderTrendChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: 'Rate %', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: any) => `${((value as number)?.toFixed(2))}%`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="female" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} name="Female" />
                    <Line type="monotone" dataKey="male" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4 }} name="Male" />
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
        // Show alternative view when a specific year is selected
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Public vs Private Pie Chart */}
          {ppChartData.length > 0 ? (
            <ChartCard
              title={`Public vs Private Enrollment (${selectedYear})`}
              subtitle={selectedCountry ? selectedCountry : 'All Countries'}
              isLoading={ppLoading}
              searchTerm={effectiveSearchTerm}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ppChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {ppChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))', 
                      borderRadius: '8px' 
                    }}
                    formatter={(value: any) => `${((value as number)?.toFixed(1))}%`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          ) : (
            <ChartCard
              title={`Public vs Private Enrollment (${selectedYear})`}
              subtitle={selectedCountry ? selectedCountry : 'All Countries'}
              isLoading={ppLoading}
            >
              <div className="flex items-center justify-center h-300 text-muted-foreground">
                {effectiveSearchTerm ? 'No data matches your search' : 'No data available'}
              </div>
            </ChartCard>
          )}

          {/* Gender Bar Chart */}
          {genderBarChartData.length > 0 ? (
            <ChartCard
              title={`Graduation Rate by Gender (${selectedYear})`}
              subtitle={selectedCountry ? selectedCountry : 'All Countries'}
              isLoading={genderLoading}
              searchTerm={effectiveSearchTerm}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={genderBarChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="gender" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    label={{ value: 'Rate %', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))', 
                      borderRadius: '8px' 
                    }}
                    formatter={(value: any) => `${((value as number)?.toFixed(2))}%`}
                  />
                  <Bar 
                    dataKey="rate" 
                    fill="hsl(var(--chart-3))" 
                    name="Graduation Rate"
                    radius={[4, 4, 0, 0]}
                  >
                    {genderBarChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index % 2 === 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          ) : (
            <ChartCard
              title={`Graduation Rate by Gender (${selectedYear})`}
              subtitle={selectedCountry ? selectedCountry : 'All Countries'}
              isLoading={genderLoading}
            >
              <div className="flex items-center justify-center h-300 text-muted-foreground">
                {effectiveSearchTerm ? 'No data matches your search' : 'No data available'}
              </div>
            </ChartCard>
          )}
        </div>
      )}

      {/* Data Table */}
      {filteredEnrollment.length > 0 ? (
        <ChartCard 
          title={effectiveSearchTerm ? `Search Results (${filteredEnrollment.length} records)` : "Detailed Enrollment Data"} 
          isLoading={false}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-4">Country</th>
                  <th className="text-left py-2 px-4">Year</th>
                  <th className="text-right py-2 px-4">YoY Growth %</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollment.slice(0, 20).map((item: any, idx: number) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/50">
                    <td className="py-2 px-4">{item.country_name}</td>
                    <td className="py-2 px-4">{item.year}</td>
                    <td className="text-right py-2 px-4">{item.yoy_growth?.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEnrollment.length > 20 && (
              <div className="p-3 text-center text-sm text-muted-foreground border-t">
                Showing 20 of {filteredEnrollment.length} records
              </div>
            )}
          </div>
        </ChartCard>
      ) : effectiveSearchTerm ? (
        <div className="p-8 text-center border rounded-lg">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No matching enrollment records found</h3>
          <p className="text-muted-foreground">
            No enrollment data matches "{effectiveSearchTerm}". Try a different search term.
          </p>
        </div>
      ) : null}
    </div>
  );
}