// API Configuration - connects to Django backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

// ============ EXPENDITURE APIs ============
export const expenditureAPI = {
  // Get education expenditure as percentage of GDP
  getEducationExpenditure: (year?: number) => 
    fetchAPI<EducationExpenditureResponse>(`/kpi/education-expenditure/${year ? `?year=${year}` : ''}`),
  
  // Get scholarship investment data
  getScholarshipInvestment: (year?: number) => 
    fetchAPI<ScholarshipInvestmentResponse>(`/kpi/scholarship-investment/${year ? `?year=${year}` : ''}`),
  
  // Get tertiary education expenditure
  getTertiaryExpenditure: (year?: number) => 
    fetchAPI<TertiaryExpenditureResponse>(`/kpi/tertiary-expenditure/${year ? `?year=${year}` : ''}`),
};

// ============ ENROLLMENT APIs ============
export const enrollmentAPI = {
  // Get gross enrollment ratio
  getGrossRatio: (year?: number) => 
    fetchAPI<EnrollmentRatioResponse>(`/kpi/enrollment-gross-ratio/${year ? `?year=${year}` : ''}`),
  
  // Get public/private enrollment share
  getPublicPrivateShare: (year?: number) => 
    fetchAPI<PublicPrivateShareResponse>(`/kpi/enrollment-public-private/${year ? `?year=${year}` : ''}`),
  
  // Get abroad mobility data
  getAbroadMobility: (year?: number) => 
    fetchAPI<AbroadMobilityResponse>(`/kpi/enrollment-abroad-mobility/${year ? `?year=${year}` : ''}`),
  
  // Get average graduation rate
  getGraduationRate: (year?: number) => 
    fetchAPI<GraduationRateResponse>(`/kpi/average-graduation-rate/${year ? `?year=${year}` : ''}`),
  
  // Get graduation rate by gender
  getGraduationRateByGender: (year?: number) => 
    fetchAPI<GraduationRateGenderResponse>(`/kpi/graduation-rate-by-gender/${year ? `?year=${year}` : ''}`),
  
  // Get year-over-year enrollment data
  getYearOverYear: () => 
    fetchAPI<EnrollmentYoYResponse>(`/kpi/enrollment-growth-yoy/`),
};

// ============ RESEARCH APIs ============
export const researchAPI = {
  // Get all research KPIs (from warehouse)
  getResearchKPIs: () => 
    fetchAPI<ResearchKPIsResponse>(`/warehouse/research-kpis/`),
  
  // Get international collaboration by country
  getCollaborationScore: () => 
    fetchAPI<CollaborationScoreResponse>(`/warehouse/research/collaboration-score/`),
  
  // Get R&D investment trends by country
  getInvestmentTrends: () => 
    fetchAPI<InvestmentTrendsResponse>(`/warehouse/research/investment-trends/`),
  
  // Get research productivity index for institutions
  getProductivityIndex: () => 
    fetchAPI<ProductivityIndexResponse>(`/warehouse/research/productivity-index/`),
};

// ============ INTERNATIONAL BENCHMARK APIs ============
export const benchmarkAPI = {
  // Get country average scores
  getCountryAvgScore: () => 
    fetchAPI<CountryAvgScoreResponse>(`/kpi/country-average-score/`),
  
  // Get graduate share by field
  getGraduateShare: () => 
    fetchAPI<GraduateShareResponse>(`/kpi/graduate-share/`),
  
  // Get specialty diversity
  getSpecialityDiversity: () => 
    fetchAPI<SpecialityDiversityResponse>(`/kpi/speciality-diversity/`),
  
  // Get student to staff ratio - level
  getStudentStaffLevel: () => 
    fetchAPI<StudentStaffLevelResponse>(`/kpi/students-staff-level/`),
  
  // Get student to staff ratio - n-year mean
  getStudentStaffNYearMean: () => 
    fetchAPI<StudentStaffNYearMeanResponse>(`/kpi/students-staff-n-year-mean/`),
  
  // Get student to staff ratio - yoy
  getStudentStaffYoY: () => 
    fetchAPI<StudentStaffYoYResponse>(`/kpi/students-staff-yoy/`),
  
  // Get top universities ranking
  getTopUniversities: () => 
    fetchAPI<TopUniversitiesResponse>(`/kpi/top-universities/`),
  
  // Get university ranking stats (QS stats)
  getUniversityRankingStats: () => 
    fetchAPI<UniversityRankingStatsResponse>(`/kpi/university-qs-stats/`),
  
  // Get student to staff ratio with country details
  getStudentStaffRatio: () => 
    fetchAPI<StudentStaffRatioDetailedResponse>(`/kpi/student-staff-ratio/`),
  
  // Get field distribution by country
  getFieldDistribution: () => 
    fetchAPI<FieldDistributionResponse>(`/kpi/field-distribution/`),
};

// ============ TYPE DEFINITIONS ============

// Expenditure Types
export interface EducationExpenditureResponse {
  year: number;
  expenditure_percentage: number;
  trend: number;
  historical_data: Array<{ year: number; value: number }>;
}

export interface ScholarshipInvestmentResponse {
  year: number;
  total_investment: number;
  beneficiaries: number;
  average_per_student: number;
  yoy_change: number;
}

export interface TertiaryExpenditureResponse {
  year: number;
  total_expenditure: number;
  per_student: number;
  percentage_of_gdp: number;
  trend: number;
}

// Enrollment Types
export interface EnrollmentRatioResponse {
  year: number;
  gross_ratio: number;
  net_ratio: number;
  trend: number;
  by_level: Array<{ level: string; ratio: number }>;
}

export interface PublicPrivateShareResponse {
  year: number;
  public_share: number;
  private_share: number;
  historical: Array<{ year: number; public: number; private: number }>;
}

export interface AbroadMobilityResponse {
  year: number;
  outbound_students: number;
  inbound_students: number;
  net_flow: number;
  top_destinations: Array<{ country: string; count: number }>;
}

export interface GraduationRateResponse {
  year: number;
  graduation_rate: number;
  trend: number;
  by_field: Array<{ field: string; rate: number }>;
}

export interface GraduationRateGenderResponse {
  year: number;
  male_rate: number;
  female_rate: number;
  gap: number;
}

export interface EnrollmentYoYResponse {
  data: Array<{
    year: number;
    total_enrollment: number;
    yoy_change: number;
  }>;
}

// Research Types
export interface ResearchKPIsResponse {
  publications: number;
  citations: number;
  h_index: number;
  patents: number;
  research_funding: number;
  international_collaborations: number;
}

export interface CollaborationScoreResponse {
  data: Array<{
    rank: number;
    country: string;
    country_code: string;
    avg_collaboration_score: number;
    total_institutions: number;
    total_papers: number;
    total_citations: number;
    collaboration_rating: string;
  }>;
}

export interface InvestmentTrendsResponse {
  data: Array<{
    country: string;
    trend_data: Array<{
      year: number;
      rd_expenditure_pct: number;
    }>;
    latest_value: number;
    earliest_value: number;
    growth: number;
  }>;
}

export interface ProductivityIndexResponse {
  data: Array<{
    institution_id: string;
    institution_name: string;
    country: string;
    city: string;
    institution_type: string;
    in_capital: boolean;
    productivity_index: number;
    citation_score: number;
    collaboration_score: number;
    output_score: number;
    total_citations: number;
    total_papers: number;
    avg_collaboration: number;
    performance_tier: string;
    rank: number;
  }>;
  methodology?: {
    formula: string;
    scale: string;
  };
}

export interface ResearchOutputResponse {
  year: number;
  total_publications: number;
  total_citations: number;
  by_field: Array<{ field: string; publications: number; citations: number }>;
}

// International Benchmark Types
export interface CountryAvgScoreResponse {
  country_average_score: Array<{
    country_id: number;
    country_name: string;
    average_score: number;
  }>;
}

export interface GraduateShareResponse {
  fields: Array<{
    field: string;
    share: number;
    count: number;
  }>;
}

export interface SpecialityDiversityResponse {
  diversity_index: number;
  top_specialities: Array<{ specialty: string; percentage: number }>;
}

export interface StudentStaffLevelResponse {
  current_ratio: number;
  trend: number;
  historical: Array<{ year: number; ratio: number }>;
  benchmark: number;
}

export interface StudentStaffNYearMeanResponse {
  n_year_mean: number;
  period: string;
  trend: number;
}

export interface StudentStaffYoYResponse {
  year: number;
  ratio: number;
  yoy_change: number;
  historical: Array<{ year: number; ratio: number; yoy_change: number }>;
}

export interface StudentStaffRatioDetailedResponse {
  status: string;
  type: string;
  data: Array<{
    country_id: number;
    country_name: string;
    year: number;
    students_per_staff: number;
  }>;
}

export interface FieldDistributionResponse {
  status: string;
  type: string;
  data: Array<{
    country_id: number;
    country_name: string;
    year: number;
    field_id: string;
    field_name: string;
    avg_enrollment_percentage: number;
  }>;
}

export interface TopUniversitiesResponse {
  top_universities: Array<{
    country_id: number;
    country_name: string;
    top_universities: Array<{
      university_name: string;
      overall_score: number;
    }>;
  }>;
}

export interface UniversityRankingStatsResponse {
  total_ranked: number;
  top_100: number;
  top_500: number;
  average_rank: number;
  best_rank: number;
}