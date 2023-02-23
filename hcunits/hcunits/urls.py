from django.urls import path
from hcunits import views

urlpatterns = [
  path('', views.home, name='home'),
  path('explore/units/', views.explore_units, name='explore_units'),
  path('explore/teams/', views.explore_teams, name='explore_teams'),
  path('teams/', views.CreateTeamView.as_view(), name='create_team'),
  path('teams/<uuid:team_id>/', views.TeamView.as_view(), name='get_team'),
  path('teams/public/', views.list_public_teams, name='list_public_teams'),
  path('help/', views.help, name='help'),
  path('help/shortcuts/', views.help_shortcuts, name='help_shortcuts'),
  path('help/account_create/', views.help_account_create, name='help_account_create'),
  path('help/account_delete/', views.help_account_delete, name='help_account_delete'),
  path('help/privacy/', views.privacy, name='privacy'),
  path('help/tos/', views.tos, name='tos'),
  path('users/', views.UserView.as_view(), name='get_user'),
  path('users/<username>/', views.UserView.as_view(), name='get_user'),
  path('accounts/delete/', views.AccountDeleteView.as_view(), name='account_delete'),
  path('favorites/<unit_id>/', views.FavoritesView.as_view(), name='favorites'),
]