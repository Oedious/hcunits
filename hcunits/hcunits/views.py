import json

from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.contrib.auth import logout
from django.db.models import Q
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotFound, QueryDict
from django.shortcuts import redirect, render
from django.template import Context, loader
from django.urls import reverse
from django.views.generic import View

from .forms import AccountDeleteForm
from .models import Team, Unit

def home(request):
  if request.user.is_authenticated:
    team_list = Team.objects.filter(user=request.user)
  else:
    team_list = []
    for i in range(12):
      team = {
        "name": "Coming Soon!",
        "points": 300,
        "age": "Modern"
      }
      team_list.append(team)

  context = {
    "team_list": team_list
  }
  template = loader.get_template('home.html')
  return HttpResponse(template.render(context, request))
  
def list_public_teams(request):
  template = loader.get_template('teams/list_public_teams.html')
  context = {}
  return HttpResponse(template.render(context, request))
  
def explore(request):
  template = loader.get_template('explore.html')
  context = {}
  return HttpResponse(template.render(context, request))

def get_help_context(topic_id):
  return {
    "topic_list": [
      {
        "topic_id": "shortcuts",
        "topic_name": "Shortcuts",
      }, {
        "topic_id": "account_create",
        "topic_name": "Account Creation",
      }, {
        "topic_id": "account_delete",
        "topic_name": "Account Deletion",
      }
    ],
    "topic_id": topic_id
  }

def help(request):
  template = loader.get_template('help/help.html')
  context = get_help_context("help")
  return HttpResponse(template.render(context, request))
  
def help_shortcuts(request):
  template = loader.get_template('help/shortcuts.html')
  context = get_help_context("shortcuts")
  return HttpResponse(template.render(context, request))
  
def help_account_create(request):
  template = loader.get_template('help/account_create.html')
  context = get_help_context("account_create")
  return HttpResponse(template.render(context, request))
  
def help_account_delete(request):
  template = loader.get_template('help/account_delete.html')
  context = get_help_context("account_delete")
  return HttpResponse(template.render(context, request))
  
def privacy(request):
  template = loader.get_template('help/privacy.html')
  context = {}
  return HttpResponse(template.render(context, request))
  
def tos(request):
  template = loader.get_template('help/tos.html')
  context = {}
  return HttpResponse(template.render(context, request))

def profile(request):
  template = loader.get_template('profile.html')
  context = {}
  return HttpResponse(template.render(context, request))

class AccountDeleteView(LoginRequiredMixin, View):
  """
  Deletes the currently signed-in user and all associated data.
  """
  def get(self, request, *args, **kwargs):
    form = AccountDeleteForm()
    return render(request, 'account_delete.html', {'form': form})

  def post(self, request, *args, **kwargs):
    form = AccountDeleteForm(request.POST)
    # Form will be valid if checkbox is checked.
    if form.is_valid():
      user = request.user
      # Logout before we delete. This will make request.user
      # unavailable (or actually, it points to AnonymousUser).
      logout(request)
      # Delete user (and any associated ForeignKeys, according to
      # on_delete parameters).
      user.delete()
      messages.success(request, 'Account successfully deleted')
      return redirect(reverse('home'))
    return render(request, 'account_delete.html', {'form': form})


class CreateTeamView(LoginRequiredMixin, View):
  def post(self, request, *args, **kwargs):
    team = Team.objects.create(user=request.user)
    team.save()
    return redirect('get_team', team.team_id)
    
class TeamView(View):
  def get(self, request, *args, **kwargs):
    team_id = kwargs["team_id"]
    try:
      team = Team.objects.get(team_id=team_id)
    except Team.DoesNotExist:
      return HttpResponseNotFound("Could not find team '%s'" % team_id)

    wire_format_team = team.get_wire_format()

    if request.user.is_authenticated and request.user == team.user:
      return render(request, 'teams/edit_team.html', {'team': wire_format_team})
    elif team.visibility == "public" or team.visibility == "unlisted":
      return render(request, 'teams/view_team.html', {'team': wire_format_team})
    else:
      return HttpResponse("Unauthorized", status=401)


  # Updates the team specified by the "team_id" argument with the changes
  # specified in the 
  def put(self, request, *args, **kwargs):
    team_id = kwargs["team_id"]
    try:
      team = Team.objects.get(team_id=team_id)
    except Team.DoesNotExist:
      return HttpResponseNotFound("Could not find team '%s'" % team_id)
    if not request.user.is_authenticated or request.user != team.user:
      return HttpResponse("Unauthorized", status=401)

    change_list = json.loads(request.body)
    try:
      team.update_from_wire_format(change_list)
    except Exception as err:
      return HttpResponseBadRequest("Invalid team update: " + str(err))

    # Everything looks good, so commit the change.
    team.save()
    return HttpResponse(status=200)


  # Delete the team specified by the "team_id" parameter. Must be owned by
  # the authenticated user.
  def delete(self, request, *args, **kwargs):
    team_id = kwargs["team_id"]
    try:
      team = Team.objects.get(team_id=team_id)
    except Team.DoesNotExist:
      return HttpResponseNotFound("Could not find team '%s'" % team_id)
    if not request.user.is_authenticated or request.user != team.user:
      return HttpResponse("Unauthorized", status=401)
    team.delete()
    return HttpResponse(status=200)