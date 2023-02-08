from django.urls import path
from . import views

urlpatterns = [
  path('', views.index, name='index'),
  path('build', views.build, name='build'),
  path('explore', views.explore, name='explore'),
  path('teams', views.teams, name='teams'),
  path('help', views.help, name='help'),
  path('help/privacy', views.privacy, name='privacy'),
  path('help/tos', views.tos, name='tos'),
]