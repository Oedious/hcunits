import uuid
from django.contrib.auth.models import User
from django.db import models

class Team(models.Model):
  class Age(models.TextChoices):
    MODERN = 'modern'
    GOLDEN = 'golden'
    
  class Visibility(models.TextChoices):
    UNLISTED = 'unlisted'
    PUBLIC = 'public'
  
  team_id = models.UUIDField(db_index=True, editable=False, default=uuid.uuid4(), unique=True)
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  name = models.CharField(max_length=50, blank=True, null=True)
  description = models.CharField(max_length=100, blank=True, null=True)
  age = models.CharField(max_length=6, choices=Age.choices, default=Age.MODERN)
  point_limit = models.IntegerField(blank=True, null=True, default=300)
  visibility = models.CharField(max_length=16, choices=Visibility.choices, default=Visibility.UNLISTED)
  #theme_team_keyword = ""

  #main_force = []
  #sideline = []
  #objects = []
  #maps = []
  #tarot_cards = []
  #alternative_team_ability = ""

  class Meta:
    app_label = 'hcunits'
    managed = True
    db_table = 'teams'

  # Returns a python dict containing the fields which can be used in the
  # team builder page.
  def safe_for_client(self):
    filtered_team = {}
    for field in self._meta.get_fields():
      if field.name != "user" and field.name != "id":
        filtered_team[field.name] = getattr(self, field.name)
    return filtered_team
