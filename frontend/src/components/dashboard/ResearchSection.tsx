import { KPICard } from './KPICard';
import { ChartCard } from './ChartCard';
import { Microscope, FileText, TrendingUp, Users, Award, Globe, AlertCircle, Filter, Search, X } from 'lucide-react';
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
} from 'recharts';
import { useState, useMemo } from 'react';
import {
  useResearchKPIs,
  useCollaborationScore,
  useInvestmentTrends,
  useProductivityIndex,
  useCountryAvgScore,
  useTopUniversities,
} from '@/hooks/useEducationData';

interface ResearchSectionProps {
  year?: number;
  isLoading?: boolean;
  searchTerm?: string; // Add searchTerm prop
}

export function ResearchSection({ 
  year, 
  isLoading, 
  searchTerm = '' // Default to empty string
}: ResearchSectionProps) {
  // Fetch all research data
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useResearchKPIs();
  const { data: collaboration, isLoading: collabLoading, error: collabError } = useCollaborationScore();
  const { data: investment, isLoading: investLoading, error: investError } = useInvestmentTrends();
  const { data: productivity, isLoading: prodLoading, error: prodError } = useProductivityIndex();
  const { data: countryScores, isLoading: scoresLoading, error: scoresError } = useCountryAvgScore();
  const { data: topUniversities, isLoading: univLoading, error: univError } = useTopUniversities();

  // Add filters state
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Use parent searchTerm or local search term
  const effectiveSearchTerm = searchTerm || localSearchTerm;

  const isDataLoading = kpisLoading || collabLoading || investLoading || prodLoading || scoresLoading || univLoading || isLoading;
  const hasError = kpisError || collabError || investError || prodError || scoresError || univError;

  // Get unique years from investment data
  const years = useMemo(() => {
    if (!investment || !Array.isArray(investment)) return [];
    const uniqueYears = new Set<number>();
    investment.forEach((item: any) => {
      if (item.trend_data && Array.isArray(item.trend_data)) {
        item.trend_data.forEach((trend: any) => {
          if (trend.year) uniqueYears.add(trend.year);
        });
      }
    });
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [investment]);

  // Get unique countries from collaboration data
  const countries = useMemo(() => {
    if (!collaboration || !Array.isArray(collaboration)) return [];
    const uniqueCountries = new Set<string>();
    collaboration.forEach((item: any) => {
      if (item.country) uniqueCountries.add(item.country);
    });
    return Array.from(uniqueCountries).sort();
  }, [collaboration]);

  // STATIC KPI CALCULATIONS - Using unfiltered data
  const staticResearchKPIs = useMemo(() => {
    // Find country with most publications (from collaboration data)
    let topPublicationsCountry = 'Global';
    let maxPublications = 0;
    
    if (Array.isArray(collaboration)) {
      collaboration.forEach((item: any) => {
        if (item.total_papers > maxPublications) {
          maxPublications = item.total_papers;
          topPublicationsCountry = item.country;
        }
      });
    }

    // Find country with most citations
    let topCitationsCountry = 'Global';
    let maxCitations = 0;
    
    if (Array.isArray(collaboration)) {
      collaboration.forEach((item: any) => {
        if (item.total_citations > maxCitations) {
          maxCitations = item.total_citations;
          topCitationsCountry = item.country;
        }
      });
    }

    // Find country with highest collaboration score
    let topCollaborationCountry = 'Global';
    let maxCollaborationScore = 0;
    
    if (Array.isArray(collaboration)) {
      collaboration.forEach((item: any) => {
        if (item.avg_collaboration_score > maxCollaborationScore) {
          maxCollaborationScore = item.avg_collaboration_score;
          topCollaborationCountry = item.country;
        }
      });
    }

    // Find country with highest overall score
    let topOverallCountry = 'Global';
    let maxOverallScore = 0;
    
    if (Array.isArray(countryScores)) {
      countryScores.forEach((item: any) => {
        if (item.overall_score > maxOverallScore) {
          maxOverallScore = item.overall_score;
          topOverallCountry = item.country;
        }
      });
    }

    return {
      topPublicationsCountry,
      topPublicationsCount: maxPublications,
      topCitationsCountry,
      topCitationsCount: maxCitations,
      topCollaborationCountry,
      topCollaborationScore: maxCollaborationScore,
      topOverallCountry,
      topOverallScore: maxOverallScore,
      kpis
    };
  }, [collaboration, countryScores, kpis]); // Using unfiltered data

  // Filter collaboration data WITH SEARCH
  const filteredCollaboration = useMemo(() => {
    if (!collaboration || !Array.isArray(collaboration)) return [];
    return collaboration.filter((item: any) => {
      if (selectedCountry && item.country !== selectedCountry) return false;
      
      // Apply search filter
      if (effectiveSearchTerm.trim()) {
        const term = effectiveSearchTerm.toLowerCase();
        const matchesSearch = (
          (item.country && item.country.toLowerCase().includes(term)) ||
          (item.avg_collaboration_score && item.avg_collaboration_score.toString().includes(term)) ||
          (item.total_papers && item.total_papers.toString().toLowerCase().includes(term)) ||
          (item.total_citations && item.total_citations.toString().toLowerCase().includes(term)) ||
          (item.collaboration_rating && item.collaboration_rating.toLowerCase().includes(term))
        );
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [collaboration, selectedCountry, effectiveSearchTerm]);

  // Filter investment data WITH SEARCH
  const filteredInvestment = useMemo(() => {
    if (!investment || !Array.isArray(investment)) return [];
    return investment.filter((item: any) => {
      if (selectedCountry && item.country !== selectedCountry) return false;
      
      // Apply search filter
      if (effectiveSearchTerm.trim()) {
        const term = effectiveSearchTerm.toLowerCase();
        const matchesSearch = (
          (item.country && item.country.toLowerCase().includes(term))
        );
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [investment, selectedCountry, effectiveSearchTerm]);

  // Filter country scores data WITH SEARCH
  const filteredCountryScores = useMemo(() => {
    if (!countryScores || !Array.isArray(countryScores)) return [];
    return countryScores.filter((item: any) => {
      if (selectedCountry && item.country !== selectedCountry) return false;
      
      // Apply search filter
      if (effectiveSearchTerm.trim()) {
        const term = effectiveSearchTerm.toLowerCase();
        const matchesSearch = (
          (item.country && item.country.toLowerCase().includes(term)) ||
          (item.overall_score && item.overall_score.toString().includes(term)) ||
          (item.education_index && item.education_index.toString().includes(term)) ||
          (item.research_index && item.research_index.toString().includes(term))
        );
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [countryScores, selectedCountry, effectiveSearchTerm]);

  // Filter top universities data WITH SEARCH
  const filteredTopUniversities = useMemo(() => {
    if (!topUniversities || !Array.isArray(topUniversities)) return [];
    return topUniversities.filter((item: any) => {
      // Apply search filter
      if (effectiveSearchTerm.trim()) {
        const term = effectiveSearchTerm.toLowerCase();
        const matchesSearch = (
          (item.university_name && item.university_name.toLowerCase().includes(term)) ||
          (item.country_name && item.country_name.toLowerCase().includes(term)) ||
          (item.overall_score && item.overall_score.toString().includes(term))
        );
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [topUniversities, effectiveSearchTerm]);

  // Calculate search results summary
  const totalSearchResults = filteredCollaboration.length + filteredCountryScores.length + filteredTopUniversities.length;

  const handleClearSearch = () => {
    setLocalSearchTerm('');
  };

  // Transform collaboration data for bar chart (top 5 countries)
  const collaborationChartData = useMemo(() => {
    return Array.isArray(filteredCollaboration) 
      ? filteredCollaboration
          .sort((a: any, b: any) => (b.avg_collaboration_score || 0) - (a.avg_collaboration_score || 0))
          .slice(0, 5)
          .map(item => ({
            name: item.country,
            score: item.avg_collaboration_score,
            papers: item.total_papers,
            citations: item.total_citations,
          })) 
      : [];
  }, [filteredCollaboration]);

  // Get investment trend line data (for selected country or first available)
  const investmentLineData = useMemo(() => {
    if (!selectedCountry) {
      // Show all years trend for first available country
      const firstCountry = Array.isArray(filteredInvestment) ? filteredInvestment[0] : null;
      return firstCountry?.trend_data?.slice(-10).map((item: any) => ({
        year: item.year.toString(),
        expenditure: item.rd_expenditure_pct,
      })) || [];
    } else {
      // Show for selected country
      const countryData = Array.isArray(filteredInvestment) 
        ? filteredInvestment.find(item => item.country === selectedCountry)
        : null;
      return countryData?.trend_data?.slice(-10).map((item: any) => ({
        year: item.year.toString(),
        expenditure: item.rd_expenditure_pct,
      })) || [];
    }
  }, [filteredInvestment, selectedCountry]);

  // Determine if investment trend chart should be shown
  const showInvestmentTrend = selectedYear === null && investmentLineData.length > 0;

  // Transform country scores for ranking chart
  const countryRankingData = useMemo(() => {
    return Array.isArray(filteredCountryScores) && filteredCountryScores.length > 0 
      ? filteredCountryScores
          .filter((item: any) => item && item.country && item.overall_score !== undefined)
          .sort((a: any, b: any) => (b.overall_score || 0) - (a.overall_score || 0))
          .slice(0, 10)
          .map((item: any) => ({
            name: item.country,
            overall: item.overall_score,
            education: item.education_index || 0,
            research: item.research_index || 0,
          }))
      : [];
  }, [filteredCountryScores]);

  return (
    <div className="space-y-6">
      {hasError && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div className="text-sm">
            <p className="font-semibold text-red-900">Data Loading Issue</p>
            <p className="text-red-800">Some research data failed to load. Showing available data.</p>
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
                Showing research results for: <span className="font-bold">"{searchTerm}"</span>
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
                placeholder="Search within research data..."
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
        
        {years.length > 0 && (
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
        )}

        {countries.length > 0 && (
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
        )}
      </div>

      {/* STATIC Research KPI Summary Cards - Using static calculations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Top Publications"
          value={staticResearchKPIs.topPublicationsCountry}
          subtitle={`${(staticResearchKPIs.topPublicationsCount / 1000).toFixed(1)}K papers`}
          icon={<FileText className="h-6 w-6" />}
          variant="research"
          isLoading={collabLoading}
        />
        <KPICard
          title="Top Citations"
          value={staticResearchKPIs.topCitationsCountry}
          subtitle={`${(staticResearchKPIs.topCitationsCount / 1000000).toFixed(1)}M citations`}
          icon={<Award className="h-6 w-6" />}
          variant="research"
          isLoading={collabLoading}
        />
        <KPICard
          title="Top Collaboration"
          value={staticResearchKPIs.topCollaborationCountry}
          subtitle={`Score: ${staticResearchKPIs.topCollaborationScore.toFixed(1)}`}
          icon={<Globe className="h-6 w-6" />}
          variant="research"
          isLoading={collabLoading}
        />
        <KPICard
          title="Top Overall Score"
          value={staticResearchKPIs.topOverallCountry}
          subtitle={`Score: ${staticResearchKPIs.topOverallScore.toFixed(1)}`}
          icon={<Users className="h-6 w-6" />}
          variant="research"
          isLoading={scoresLoading}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* International Collaboration by Country */}
        <ChartCard
          title="International Collaboration Rankings"
          subtitle={effectiveSearchTerm ? `Search results for "${effectiveSearchTerm}"` : "Top countries by collaboration score"}
          isLoading={collabLoading}
        >
          <ResponsiveContainer width="100%" height={280}>
            {collaborationChartData.length > 0 ? (
              <BarChart data={collaborationChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [value.toFixed(1), 'Collaboration Score']}
                />
                <Bar dataKey="score" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {effectiveSearchTerm ? 'No collaboration data matches your search' : 'No collaboration data available'}
              </div>
            )}
          </ResponsiveContainer>
        </ChartCard>

        {/* Country Overall Scores */}
        <ChartCard
          title="Country Performance Scores"
          subtitle={effectiveSearchTerm ? `Search results for "${effectiveSearchTerm}"` : "Top countries by average score"}
          isLoading={scoresLoading}
        >
          <ResponsiveContainer width="100%" height={280}>
            {countryRankingData.length > 0 ? (
              <BarChart data={countryRankingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [value.toFixed(1), 'Average Score']}
                />
                <Bar dataKey="overall" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {effectiveSearchTerm ? 'No country score data matches your search' : 'No country score data available'}
              </div>
            )}
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* R&D Investment Trend Chart - Only show when no specific year selected */}
      {showInvestmentTrend && (
        <ChartCard
          title="R&D Investment Trend"
          subtitle={selectedCountry ? `${selectedCountry} - Historical trends` : 'Historical trends'}
          isLoading={investLoading}
        >
          <ResponsiveContainer width="100%" height={300}>
            {investmentLineData.length > 0 ? (
              <LineChart data={investmentLineData}>
                <defs>
                  <linearGradient id="investmentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="year" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [value.toFixed(2) + '%', 'Expenditure']}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenditure" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-3))', r: 4 }}
                />
              </LineChart>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {effectiveSearchTerm ? 'No trend data matches your search' : 'No trend data available for selected country'}
              </div>
            )}
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Collaboration Details Table */}
      {filteredCollaboration.length > 0 ? (
        <ChartCard
          title={effectiveSearchTerm ? `Collaboration Search Results (${filteredCollaboration.length} records)` : "Collaboration Details"}
          subtitle={effectiveSearchTerm ? `Showing results for "${effectiveSearchTerm}"` : "All countries ranked by collaboration score"}
          className="mt-6"
          isLoading={collabLoading}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-4 font-semibold">Rank</th>
                  <th className="text-left py-2 px-4 font-semibold">Country</th>
                  <th className="text-right py-2 px-4 font-semibold">Score</th>
                  <th className="text-right py-2 px-4 font-semibold">Papers</th>
                  <th className="text-right py-2 px-4 font-semibold">Citations</th>
                  <th className="text-left py-2 px-4 font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredCollaboration.slice(0, 15).map((item, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/50">
                    <td className="py-2 px-4">{item.rank || idx + 1}</td>
                    <td className="py-2 px-4 font-medium">{item.country}</td>
                    <td className="text-right py-2 px-4">{item.avg_collaboration_score?.toFixed(1)}</td>
                    <td className="text-right py-2 px-4">{item.total_papers?.toLocaleString()}</td>
                    <td className="text-right py-2 px-4">{item.total_citations?.toLocaleString()}</td>
                    <td className="py-2 px-4">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {item.collaboration_rating || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCollaboration.length > 15 && (
              <div className="p-3 text-center text-sm text-muted-foreground border-t">
                Showing 15 of {filteredCollaboration.length} records
              </div>
            )}
          </div>
        </ChartCard>
      ) : effectiveSearchTerm ? (
        <div className="p-4 border rounded-lg">
          <div className="text-center text-muted-foreground">
            No collaboration data matches "{effectiveSearchTerm}"
          </div>
        </div>
      ) : null}

      {/* Country Scores Table */}
      {filteredCountryScores.length > 0 ? (
        <ChartCard
          title={effectiveSearchTerm ? `Country Scores Search Results (${filteredCountryScores.length} records)` : "Country Average Scores"}
          subtitle={effectiveSearchTerm ? `Showing results for "${effectiveSearchTerm}"` : "All countries ranked by average score"}
          className="mt-6"
          isLoading={scoresLoading}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-4 font-semibold">Rank</th>
                  <th className="text-left py-2 px-4 font-semibold">Country</th>
                  <th className="text-right py-2 px-4 font-semibold">Average Score</th>
                  <th className="text-right py-2 px-4 font-semibold">Education Index</th>
                  <th className="text-right py-2 px-4 font-semibold">Research Index</th>
                </tr>
              </thead>
              <tbody>
                {filteredCountryScores
                  .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
                  .slice(0, 15)
                  .map((item, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50">
                      <td className="py-2 px-4">{idx + 1}</td>
                      <td className="py-2 px-4 font-medium">{item.country}</td>
                      <td className="text-right py-2 px-4 font-semibold">{item.overall_score?.toFixed(1)}</td>
                      <td className="text-right py-2 px-4">{item.education_index?.toFixed(1)}</td>
                      <td className="text-right py-2 px-4">{item.research_index?.toFixed(1)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {filteredCountryScores.length > 15 && (
              <div className="p-3 text-center text-sm text-muted-foreground border-t">
                Showing 15 of {filteredCountryScores.length} records
              </div>
            )}
          </div>
        </ChartCard>
      ) : effectiveSearchTerm ? (
        <div className="p-4 border rounded-lg">
          <div className="text-center text-muted-foreground">
            No country score data matches "{effectiveSearchTerm}"
          </div>
        </div>
      ) : null}

      {/* Top Universities Table */}
      {filteredTopUniversities.length > 0 && (
        <ChartCard
          title={effectiveSearchTerm ? `Top Universities Search Results (${filteredTopUniversities.length} records)` : "Top Universities"}
          subtitle={effectiveSearchTerm ? `Showing results for "${effectiveSearchTerm}"` : "Top universities by overall score"}
          className="mt-6"
          isLoading={univLoading}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-4 font-semibold">Rank</th>
                  <th className="text-left py-2 px-4 font-semibold">University</th>
                  <th className="text-left py-2 px-4 font-semibold">Country</th>
                  <th className="text-right py-2 px-4 font-semibold">Overall Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredTopUniversities
                  .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
                  .slice(0, 15)
                  .map((item, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50">
                      <td className="py-2 px-4">{idx + 1}</td>
                      <td className="py-2 px-4 font-medium">{item.university_name}</td>
                      <td className="py-2 px-4">{item.country_name}</td>
                      <td className="text-right py-2 px-4 font-semibold">{item.overall_score?.toFixed(1)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {filteredTopUniversities.length > 15 && (
              <div className="p-3 text-center text-sm text-muted-foreground border-t">
                Showing 15 of {filteredTopUniversities.length} records
              </div>
            )}
          </div>
        </ChartCard>
      )}

      {/* No Results Message */}
      {effectiveSearchTerm && 
       filteredCollaboration.length === 0 && 
       filteredCountryScores.length === 0 && 
       filteredTopUniversities.length === 0 && (
        <div className="p-8 text-center border rounded-lg">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No matching research records found</h3>
          <p className="text-muted-foreground">
            No research data matches "{effectiveSearchTerm}". Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}