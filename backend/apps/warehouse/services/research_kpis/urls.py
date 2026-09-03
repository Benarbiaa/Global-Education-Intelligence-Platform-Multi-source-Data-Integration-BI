from django.urls import path
from . import views

urlpatterns = [
    # Summary endpoints for dashboard
    path('research-kpis/', views.research_kpis_summary, name='research_kpis_summary'),
    path('research-kpis/<str:country_name>/', views.research_kpis_by_country, name='research_kpis_by_country'),
    # Detailed research endpoints
    path('research/top-institutions/', views.top_institutions_by_citations, name='research_top_institutions'),
    path('research/investment-trends/', views.rd_investment_trends, name='research_investment_trends'),
    path('research/collaboration-score/', views.collaboration_score_by_country, name='research_collaboration'),
    path('research/productivity-index/', views.research_productivity_index, name='research_productivity'),
]