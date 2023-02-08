from django.http import HttpResponse
from django.shortcuts import render
from django.template import loader

def index(request):
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
  
def help(request):
  template = loader.get_template('help.html')
  context = {}
  return HttpResponse(template.render(context, request))
  
def privacy(request):
  template = loader.get_template('privacy.html')
  context = {}
  return HttpResponse(template.render(context, request))
  
def tos(request):
  template = loader.get_template('tos.html')
  context = {}
  return HttpResponse(template.render(context, request))