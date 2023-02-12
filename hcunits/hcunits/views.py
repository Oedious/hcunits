from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.contrib.auth import logout
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.template import Context, loader
from django.urls import reverse
from django.views.generic import View

from .forms import AccountDeleteForm

def home(request):
  template = loader.get_template('home.html')
  team_list = []
  for i in range(12):
    team = {
      "name": "Coming Soon!",
      "format": "300 Modern"
    }
    team_list.append(team)

  context = {
    "team_list": team_list
  }
  return HttpResponse(template.render(context, request))
  
def build(request):
  template = loader.get_template('build.html')
  context = {}
  return HttpResponse(template.render(context, request))
  
def teams(request):
  template = loader.get_template('teams.html')
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