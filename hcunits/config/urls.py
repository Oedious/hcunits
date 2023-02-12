"""hcunits URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from allauth.account.views import login, logout, signup
from allauth.socialaccount.views import signup as socialaccount_signup
import django
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from . import settings

urlpatterns = [
  path('', include('hcunits.urls')),
  path('accounts/login/', login, name="account_login"),
  path('accounts/logout/', logout, name="account_logout"),
  path('accounts/signup/', socialaccount_signup, name="account_signup"),
  path('accounts/social/signup/', socialaccount_signup, name="socialaccount_signup"),
  path('accounts/', include('allauth.socialaccount.providers.facebook.urls')),
  path('accounts/', include('allauth.socialaccount.providers.google.urls')),
]

if settings.admin_enabled():
  urlpatterns += [
    path('admin/', admin.site.urls),
  ]