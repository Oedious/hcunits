"""hcunits_api URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.urls import include, path
from rest_framework.urlpatterns import format_suffix_patterns
from hcunits_api.hcunits_api import views

urlpatterns = [
  path(r'sets/<set_id>/', views.SetDetail.as_view()),
  path(r'units/', views.UnitList.as_view()),
  path(r'units/<unit_id>/', views.UnitDetail.as_view()),
  path(r'search/', views.Search.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)