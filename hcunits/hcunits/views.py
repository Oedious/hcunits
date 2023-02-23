import json
import uuid

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
from .models import Team, Unit, UserProfile

def home(request):
  if request.user.is_authenticated:
    results = Team.objects.filter(user=request.user).order_by('-update_time')[:6]
    user_teams = [t.get_wire_format(True) for t in results]
  else:
    user_teams = []

  q = Q(visibility="public") & ~Q(name="") & ~Q(user__username=request.user.username)
  results = Team.objects.filter(q).order_by('-update_time')[:6]
  recent_teams = [t.get_wire_format(True) for t in results]

  context = {
    "user_teams": user_teams,
    "recent_teams": recent_teams,
  }
  template = loader.get_template('home.html')
  return HttpResponse(template.render(context, request))
  
def list_public_teams(request):
  template = loader.get_template('teams/list_public_teams.html')
  context = {}
  return HttpResponse(template.render(context, request))
  
def explore_units(request):
  template = loader.get_template('explore/units.html')
  context = {}
  return HttpResponse(template.render(context, request))

# TODO: support pagination
def explore_teams(request):
  q = Q(visibility="public") & ~Q(name="");
  if request.user.is_authenticated:
    q &= ~Q(user__username=request.user.username)
  results = Team.objects.filter(q).order_by('-update_time')[:12]
  team_list = [t.get_wire_format(True) for t in results]
  context = {
    "team_list": team_list,
  }
  template = loader.get_template('explore/teams.html')
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

# TODO: Add pagination
class UserView(View):
  def get(self, request, *args, **kwargs):
    username = kwargs.get("username", None)
    if not username:
      if request.user.is_authenticated:
        username = request.user.username
      else:
        return redirect(reverse('account_login'))

    if request.user.is_authenticated and request.user.username == username:
      results = Team.objects.filter(user=request.user).order_by('-update_time')
    else:
      q = Q(visibility="public") & ~Q(name="") & Q(user__username=username)
      results = Team.objects.filter(q).order_by('-update_time')[:12]

    team_list = [t.get_wire_format(True) for t in results]
    context = {
      "owner": username,
      "team_list": team_list,
    }
    template = loader.get_template('user.html')
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
    # Keep trying to create a new team until we don't get a collision for the ID.
    team_id = uuid.uuid4()
    while Team.objects.filter(team_id=team_id):
      team_id = uuid.uuid4()
      
    team = Team.objects.create(user=request.user, team_id=team_id)
    team.save()
    return redirect('get_team', team.team_id)
    
class TeamView(View):
  def get(self, request, *args, **kwargs):
    team_id = kwargs.get("team_id", None)
    if not team_id or team_id == "":
      return HttpResponseBadRequest("Failure getting team: Invalid team ID: '%s'" % team_id);
    try:
      team = Team.objects.get(team_id=team_id)
    except Team.DoesNotExist:
      return HttpResponseNotFound("Could not find team '%s'" % team_id)

    wire_format_team = team.get_wire_format(False)
    context = {
      'team': wire_format_team,
    }
    if request.user.is_authenticated and request.user == team.user:
      try:
        profile = UserProfile.objects.get(user=request.user)
        favorites = []
        print("getting favorites")
        # TODO: Use the UnitListSerializer from API instead.
        for f in profile.favorites.all():
          print("found favorite %s" % f.unit_id)
          favorites.append({
            "unit_id": f.unit_id,
            "set_id": f.set_id,
            "name": f.name,
            "type": f.type,
            "collector_number": f.collector_number,
            "point_values": f.point_values,
            "rarity": f.rarity,
            "object_type": f.object_type,
            "bystander_type": f.bystander_type,
          })
        context["favorites"] = favorites
      except UserProfile.DoesNotExist:
        context["favorites"] = []
      return render(request, 'teams/edit_team.html', context)
    elif team.visibility == "public" or team.visibility == "unlisted":
      return render(request, 'teams/view_team.html', context)
    else:
      return HttpResponse("Unauthorized", status=401)


  # Updates the team specified by the "team_id" argument with the changes
  # specified in the 
  def put(self, request, *args, **kwargs):
    team_id = kwargs.get("team_id", None)
    if not team_id or team_id == "":
      return HttpResponseBadRequest("Failure updating team: Invalid team ID: '%s'" % team_id);
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
    team_id = kwargs.get("team_id", None)
    if not team_id or team_id == "":
      return HttpResponseBadRequest("Failure deleting team: Invalid team ID: '%s'" % team_id);
    try:
      team = Team.objects.get(team_id=team_id)
    except Team.DoesNotExist:
      return HttpResponseNotFound("Could not find team '%s'" % team_id)
    if not request.user.is_authenticated or request.user != team.user:
      return HttpResponse("Unauthorized", status=401)
    team.delete()
    return HttpResponse(status=200)
    
    
class FavoritesView(LoginRequiredMixin, View):
  # Updates the UserProfile by adding a favorite.
  def put(self, request, *args, **kwargs):
    unit_id = kwargs.get("unit_id", None)
    if not unit_id or unit_id == "":
      return HttpResponseBadRequest("Failure adding favorite: Invalid unit ID: '%s'" % unit_id);
    try:
      unit = Unit.objects.get(unit_id=unit_id)
    except Unit.DoesNotExist:
      return HttpResponseNotFound("Could not find unit '%s'" % unit_id)
    
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    profile.favorites.add(unit)
    return HttpResponse(status=200)

  # Delete the favorite specified by the "unit_id" parameter. Must be owned by
  # the authenticated user.
  def delete(self, request, *args, **kwargs):
    unit_id = kwargs.get("unit_id", None)
    if not unit_id or unit_id == "":
      return HttpResponseBadRequest("Failure adding favorite: Invalid unit ID: '%s'" % unit_id);

    # Get the unit associated with the unit ID.
    try:
      unit = Unit.objects.get(unit_id=unit_id)
    except Unit.DoesNotExist:
      return HttpResponseNotFound("Could not find unit '%s'" % unit_id)

    # Get the user profile of the authenticated user.
    try:
      profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
      return HttpResponseNotFound("Could not find user '%s'" % request.user.username)
    profile.favorites.remove(unit)
    return HttpResponse(status=200)
