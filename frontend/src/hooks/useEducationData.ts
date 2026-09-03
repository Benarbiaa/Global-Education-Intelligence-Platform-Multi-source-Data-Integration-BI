import { useQuery } from '@tanstack/react-query';
import { 
  expenditureAPI, 
  enrollmentAPI, 
  researchAPI, 
  benchmarkAPI 
} from '@/lib/api';

// ============ EXPENDITURE HOOKS ============
export function useEducationExpenditure(year?: number) {
  return useQuery({
    queryKey: ['education-expenditure', year],
    queryFn: async () => {
      const response = await expenditureAPI.getEducationExpenditure(year);
      // API returns: {education_expenditure: [{country_id, country_name, year, expenditure_percentage}, ...]}
      const dataArray = (response as any).education_expenditure || [];
      return Array.isArray(dataArray) ? dataArray : [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useScholarshipInvestment(year?: number) {
  return useQuery({
    queryKey: ['scholarship-investment', year],
    queryFn: async () => {
      const response = await expenditureAPI.getScholarshipInvestment(year);
      // API returns: {total_scholarships: [{country_id, country_name, year, total_scholarships}, ...]}
      const dataArray = (response as any).total_scholarships || [];
      return Array.isArray(dataArray) ? dataArray : [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useTertiaryExpenditure(year?: number) {
  return useQuery({
    queryKey: ['tertiary-expenditure', year],
    queryFn: async () => {
      const response = await expenditureAPI.getTertiaryExpenditure(year);
      // API returns: {tertiary_expenditure: [{country_id, country_name, year, tertiary_expenditure}, ...]}
      const dataArray = (response as any).tertiary_expenditure || [];
      return Array.isArray(dataArray) ? dataArray : [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// ============ ENROLLMENT HOOKS ============
export function useGrossEnrollmentRatio(year?: number) {
  return useQuery({
    queryKey: ['gross-enrollment-ratio', year],
    queryFn: async () => {
      const response = await enrollmentAPI.getGrossRatio(year);
      // API returns: {gross_enrollment_ratio: [{country_id, country_name, year, yoy_growth}, ...]}
      const dataArray = (response as any).gross_enrollment_ratio || [];
      return Array.isArray(dataArray) ? dataArray : [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function usePublicPrivateShare(year?: number) {
  return useQuery({
    queryKey: ['public-private-share', year],
    queryFn: async () => {
      const response = await enrollmentAPI.getPublicPrivateShare(year);
      // API returns: {public_private_share: [{country_id, country_name, year, public_share, private_share}, ...]}
      const dataArray = (response as any).public_private_share || [];
      return Array.isArray(dataArray) ? dataArray : [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useAbroadMobility(year?: number) {
  return useQuery({
    queryKey: ['abroad-mobility', year],
    queryFn: async () => {
      const response = await enrollmentAPI.getAbroadMobility(year);
      // API returns: {outbound_mobility_ratio: [{country_id, country_name, year, outbound_mobility_ratio}, ...]}
      const dataArray = (response as any).outbound_mobility_ratio || [];
      return Array.isArray(dataArray) ? dataArray : [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useGraduationRate(year?: number) {
  return useQuery({
    queryKey: ['graduation-rate', year],
    queryFn: async () => {
      const response = await enrollmentAPI.getGraduationRate(year);
      const dataArray = response.graduation_rate || response || [];
      return Array.isArray(dataArray) ? dataArray : [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useGraduationRateByGender(year?: number) {
  return useQuery({
    queryKey: ['graduation-rate-gender', year],
    queryFn: async () => {
      const response = await enrollmentAPI.getGraduationRateByGender(year);
      // API returns: {graduation_rate_by_gender: [{country_id, country_name, year, gender, average_graduation_rate}, ...]}
      const dataArray = (response as any).graduation_rate_by_gender || [];
      return Array.isArray(dataArray) ? dataArray : [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useEnrollmentYoY() {
  return useQuery({
    queryKey: ['enrollment-yoy'],
    queryFn: async () => {
      const response = await enrollmentAPI.getYearOverYear();
      // API returns: {enrollment_yoy: [{country_id, country_name, year, yoy_growth}, ...]}
      const dataArray = (response as any).enrollment_yoy || [];
      return Array.isArray(dataArray) ? dataArray : [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// ============ RESEARCH HOOKS ============
export function useResearchKPIs() {
  return useQuery({
    queryKey: ['research-kpis'],
    queryFn: async () => {
      const response = await researchAPI.getResearchKPIs();
      // Backend wraps response: { status, kpi, data: {...}, count }
      const kpiData = (response as any).data || response;
      return {
        publications: (kpiData as any).publications || 0,
        citations: (kpiData as any).citations || 0,
        h_index: (kpiData as any).h_index || 0,
        patents: (kpiData as any).patents || 0,
        research_funding: (kpiData as any).research_funding || 0,
        international_collaborations: (kpiData as any).international_collaborations || 0,
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useCollaborationScore() {
  return useQuery({
    queryKey: ['collaboration-score'],
    queryFn: async () => {
      const response = await researchAPI.getCollaborationScore();
      const dataArray = response.data || [];
      return dataArray.map((item: any) => ({
        rank: item.rank,
        country: item.country,
        country_code: item.country_code,
        avg_collaboration_score: item.avg_collaboration_score,
        total_institutions: item.total_institutions,
        total_papers: item.total_papers,
        total_citations: item.total_citations,
        collaboration_rating: item.collaboration_rating,
      }));
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useInvestmentTrends() {
  return useQuery({
    queryKey: ['investment-trends'],
    queryFn: async () => {
      const response = await researchAPI.getInvestmentTrends();
      const dataArray = response.data || [];
      return dataArray.map((item: any) => ({
        country: item.country,
        trend_data: item.trend_data || [],
        latest_value: item.latest_value,
        earliest_value: item.earliest_value,
        growth: item.growth,
      }));
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useProductivityIndex() {
  return useQuery({
    queryKey: ['productivity-index'],
    queryFn: async () => {
      const response = await researchAPI.getProductivityIndex();
      const dataArray = response.data || [];
      return dataArray.map((item: any) => ({
        institution_id: item.institution_id,
        institution_name: item.institution_name,
        country: item.country,
        city: item.city,
        institution_type: item.institution_type,
        in_capital: item.in_capital,
        productivity_index: item.productivity_index,
        citation_score: item.citation_score,
        collaboration_score: item.collaboration_score,
        output_score: item.output_score,
        total_citations: item.total_citations,
        total_papers: item.total_papers,
        avg_collaboration: item.avg_collaboration,
        performance_tier: item.performance_tier,
        rank: item.rank,
      }));
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// ============ BENCHMARK HOOKS ============
export function useCountryAvgScore() {
  return useQuery({
    queryKey: ['country-avg-score'],
    queryFn: async () => {
      const response = await benchmarkAPI.getCountryAvgScore();
      console.log('Country Avg Score Response:', response);
      
      // The response should now be properly typed
      const dataArray = response.country_average_score || [];
      
      console.log('Data array from response:', dataArray);
      
      return dataArray.map((item) => ({
        country: item.country_name,
        overall_score: item.average_score,
        education_index: 0, // These fields don't exist in API response
        research_index: 0
      }));
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useGraduateShare() {
  return useQuery({
    queryKey: ['graduate-share'],
    queryFn: async () => {
      const response = await benchmarkAPI.getGraduateShare();
      // API returns: {graduate_share_by_speciality: [{field, share, count}, ...]}
      const dataArray = (response as any).graduate_share_by_speciality || (response as any).fields || [];
        return Array.isArray(dataArray) ? dataArray.map((item: any) => ({
          field: item.field || item.speciality_id || item.field_id || 'Unknown',
          field_name: item.field_name || item.speciality_name || item.field_label || item.field_title || item.field || null,
          speciality_name: item.speciality_name || item.field_name || null,
          share: item.graduate_percent || item.share || 0,
          count: item.count || 0
        })) : [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useSpecialityDiversity() {
  return useQuery({
    queryKey: ['speciality-diversity'],
    queryFn: async () => {
      const response = await benchmarkAPI.getSpecialityDiversity();
      // API returns array directly: [{country_id, country_name, year, hhi}, ...]
      const dataArray = Array.isArray(response) ? response : (response as any).data || [];
      return dataArray;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useStudentStaffLevel() {
  return useQuery({
    queryKey: ['student-staff-level'],
    queryFn: async () => {
      const response = await benchmarkAPI.getStudentStaffLevel();
      // API returns: {students_per_staff_level: value}
      return {
        current_ratio: (response as any).students_per_staff_level || 0,
        trend: 0,
        historical: [],
        benchmark: 0
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useStudentStaffNYearMean() {
  return useQuery({
    queryKey: ['student-staff-n-year-mean'],
    queryFn: async () => {
      const response = await benchmarkAPI.getStudentStaffNYearMean();
      return {
        n_year_mean: response.n_year_mean || 0,
        period: response.period || '',
        trend: 0
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useStudentStaffYoY() {
  return useQuery({
    queryKey: ['student-staff-yoy'],
    queryFn: async () => {
      const response = await benchmarkAPI.getStudentStaffYoY();
      // API returns: {students_per_staff_yoy_percent: value}
      return {
        year: (response as any).year || new Date().getFullYear(),
        ratio: (response as any).students_per_staff_yoy_percent || 0,
        yoy_change: (response as any).students_per_staff_yoy_percent || 0,
        historical: []
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useTopUniversities() {
  return useQuery({
    queryKey: ['top-universities'],
    queryFn: async () => {
      const response = await benchmarkAPI.getTopUniversities();
      // API returns { top_universities: [{country_id, country_name, top_universities: [...]}, ...] }
      const dataArray = response.top_universities || [];
      const flattened: any[] = [];
      dataArray.forEach((country: any) => {
        if (country.top_universities && Array.isArray(country.top_universities)) {
          country.top_universities.forEach((uni: any) => {
            flattened.push({
              university_name: uni.university_name,
              country_name: country.country_name,
              country_id: country.country_id,
              overall_score: uni.overall_score,
            });
          });
        }
      });
      return flattened;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useStudentStaffRatio() {
  return useQuery({
    queryKey: ['student-staff-ratio'],
    queryFn: async () => {
      const response = await benchmarkAPI.getStudentStaffRatio();
      // API returns { status, type, data: [{country_id, country_name, year, students_per_staff}, ...] }
      const dataArray = response.data || [];
      return dataArray;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useFieldDistribution() {
  return useQuery({
    queryKey: ['field-distribution'],
    queryFn: async () => {
      const response = await benchmarkAPI.getFieldDistribution();
      // API returns { status, type, data: [{country_id, country_name, year, field_id, field_name, avg_enrollment_percentage}, ...] }
      const dataArray = response.data || [];
      return dataArray;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useUniversityRankingStats() {
  return useQuery({
    queryKey: ['university-ranking-stats'],
    queryFn: async () => {
      const response = await benchmarkAPI.getUniversityRankingStats();
      return {
        total_ranked: response.total_ranked || 0,
        top_100: response.top_100 || 0,
        top_500: response.top_500 || 0,
        average_rank: response.average_rank || 0,
        best_rank: response.best_rank || 0
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
