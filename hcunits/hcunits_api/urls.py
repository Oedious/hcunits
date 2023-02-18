from django.urls import include, path
from rest_framework.urlpatterns import format_suffix_patterns
from hcunits_api import views

urlpatterns = [
  path(r'v1/sets/<set_id>/', views.SetDetail.as_view()),
  path(r'v1/units/', views.UnitList.as_view()),
  path(r'v1/units/<unit_id>/', views.UnitDetail.as_view()),
  path(r'v1/search/', views.Search.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)