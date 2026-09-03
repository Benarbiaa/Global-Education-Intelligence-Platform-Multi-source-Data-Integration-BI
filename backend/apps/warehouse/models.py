from django.db import models

from django.db import models


#################
#DIMENSIONS
#################

class DimCountries(models.Model):
    country_id = models.BigIntegerField(primary_key=True)
    country_name = models.TextField()
    country_code = models.TextField()
    capital_city = models.TextField(null=True, blank=True)
    rural_population_percent = models.FloatField(null=True, blank=True)
    urban_population_percent = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = 'dim_countries'
        managed = False
        verbose_name = 'Country'
        verbose_name_plural = 'Countries'

    def __str__(self):
        return self.country_name


class DimSpeciality(models.Model):
    speciality_id = models.IntegerField(primary_key=True)
    speciality_name = models.TextField()
    field_code = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'dim_speciality'
        managed = False
        verbose_name = 'Speciality'
        verbose_name_plural = 'Specialities'

    def __str__(self):
        return self.speciality_name


class DimField(models.Model):
    field_id = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=150)

    class Meta:
        db_table = 'dim_field'
        managed = False
        verbose_name = 'Field'
        verbose_name_plural = 'Fields'

    def __str__(self):
        return self.name



# ============================================================
# RESEARCH MART
# ============================================================

class DimInstitution(models.Model):
    institution_id = models.TextField(primary_key=True)
    institution_name = models.TextField()
    country = models.ForeignKey(DimCountries, on_delete=models.CASCADE, db_column='country_id')
    institution_type = models.TextField(null=True, blank=True)
    city = models.TextField(null=True, blank=True)
    is_capital_city = models.BooleanField(null=True, blank=True)

    class Meta:
        db_table = 'dim_institution'
        managed = False
        verbose_name = 'Institution'
        verbose_name_plural = 'Institutions'

    def __str__(self):
        return self.institution_name


class FactInstitutionResearch(models.Model):
    research_id = models.BigIntegerField(primary_key=True)
    institution = models.ForeignKey(DimInstitution, on_delete=models.CASCADE, db_column='institution_id')
    total_citations = models.IntegerField(null=True, blank=True)
    international_collaboration = models.IntegerField(null=True, blank=True)
    top_paper_title = models.TextField(null=True, blank=True)
    top_paper_doi = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'fact_institution_research'
        managed = False
        verbose_name = 'Institution Research'
        verbose_name_plural = 'Institution Research'

    def __str__(self):
        return f"{self.institution.institution_name} - {self.research_id}"


class FactResearchInvestment(models.Model):
    investment_id = models.TextField(primary_key=True)
    country = models.ForeignKey(DimCountries, on_delete=models.CASCADE, db_column='country_id')
    year = models.IntegerField()
    rd_expenditure_gdp_percent = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)

    class Meta:
        db_table = 'fact_research_investment'
        managed = False
        verbose_name = 'Research Investment'
        verbose_name_plural = 'Research Investments'

    def __str__(self):
        return f"{self.country.country_name} - {self.year}"





#################
#FACT_ENROLLMENT
#################

class FactEnrollment(models.Model):
    enrollment_id = models.CharField(max_length=10, primary_key=True)
    field = models.ForeignKey(DimField, on_delete=models.CASCADE, db_column='field_id')
    country = models.ForeignKey(DimCountries, on_delete=models.CASCADE, db_column='country_id')
    year = models.IntegerField()
    institution_type = models.CharField(max_length=100, null=True, blank=True)
    enrollment_percentage = models.DecimalField(max_digits=7, decimal_places=4, null=True, blank=True)

    class Meta:
        db_table = 'fact_enrollment'
        managed = False
        verbose_name = 'Enrollment'
        verbose_name_plural = 'Enrollments'


class FactEnrollmentAbroad(models.Model):
    enrollment_abroad_id = models.CharField(max_length=10, primary_key=True)
    country = models.ForeignKey(DimCountries, on_delete=models.CASCADE, db_column='country_id')
    year = models.IntegerField()
    gender = models.CharField(max_length=20, null=True, blank=True)
    percentage = models.DecimalField(max_digits=7, decimal_places=4, null=True, blank=True)

    class Meta:
        db_table = 'fact_enrollment_abroad'
        managed = False
        verbose_name = 'Enrollment Abroad'
        verbose_name_plural = 'Enrollments Abroad'

    def __str__(self):
        return f"{self.country.country_name} - {self.gender} - {self.year}"
    
class FactGraduation(models.Model):
    graduation_id = models.CharField(max_length=10, primary_key=True)
    country = models.ForeignKey(DimCountries, on_delete=models.CASCADE, db_column='country_id')
    year = models.IntegerField()
    gender = models.CharField(max_length=20, null=True, blank=True)
    percentage = models.DecimalField(max_digits=7, decimal_places=4, null=True, blank=True)

    class Meta:
        db_table = 'fact_graduation'
        managed = False
        verbose_name = 'Graduation'
        verbose_name_plural = 'Graduations'

    def __str__(self):
        return f"{self.country.country_name} - {self.gender} - {self.year}"


#################
#EXPENDITURE
#################
class FactGovernmentExpenditure(models.Model):
    expenditure_id = models.AutoField(primary_key=True)
    country = models.ForeignKey(DimCountries, on_delete=models.CASCADE, db_column='country_id')
    year = models.IntegerField()
    scholarships = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    tertiary_expenditure = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    expenditure_percentage = models.DecimalField(max_digits=7, decimal_places=4, null=True, blank=True)

    class Meta:
        db_table = 'fact_government_expenditure'
        managed = False
        verbose_name = 'Government Expenditure'
        verbose_name_plural = 'Government Expenditures'

    def __str__(self):
        return f"{self.country.country_name} - {self.year}"
    

########################
#INTERNATIONAL_BENCHMARK
########################
class FactTertiaryGraduates(models.Model):
    graduate_id = models.AutoField(primary_key=True)
    country_id = models.BigIntegerField()
    speciality_id = models.BigIntegerField()
    graduate_percent = models.FloatField(null=True)
    year = models.IntegerField(null=True)

    class Meta:
        db_table = "fact_tertiary_graduates"

class FactUniversityRanking(models.Model):
    university_ranking_id = models.AutoField(primary_key=True)
    university_name = models.TextField(null=True)
    qs_rank = models.IntegerField(null=True)
    overall_score = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    country_id = models.BigIntegerField()
    year = models.IntegerField(null=True)

    class Meta:
        db_table = "fact_university_ranking"


class FactStudentStaffRatio(models.Model):
    ratio_id = models.AutoField(primary_key=True)
    country_id = models.BigIntegerField()
    year = models.IntegerField(null=True)
    students_per_staff = models.FloatField(null=True)

    class Meta:
        db_table = "fact_student_staff_ratio"
