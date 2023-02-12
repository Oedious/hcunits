from django.urls import path
from . import views

urlpatterns = [
  path('', views.home, name='home'),
  #path('build/', views.BuildView.as_view(), name='build'),
  path('explore/', views.explore, name='explore'),
  path('teams/', views.CreateTeamView.as_view(), name='create_team'),
  path('teams/<uuid:team_id>/', views.TeamView.as_view(), name='get_team'),
  path('teams/public/', views.list_public_teams, name='list_public_teams'),
  path('help/', views.help, name='help'),
  path('help/shortcuts/', views.help_shortcuts, name='help_shortcuts'),
  path('help/account_create/', views.help_account_create, name='help_account_create'),
  path('help/account_delete/', views.help_account_delete, name='help_account_delete'),
  path('help/privacy/', views.privacy, name='privacy'),
  path('help/tos/', views.tos, name='tos'),
  path('accounts/profile/', views.profile, name='profile'),
  path('accounts/delete/', views.AccountDeleteView.as_view(), name="account_delete"),
]