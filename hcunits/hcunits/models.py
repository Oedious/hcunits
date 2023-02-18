import uuid
from django.contrib.auth.models import User
from django.db import models

class Team(models.Model):
  class Age(models.TextChoices):
    MODERN = 'modern'
    GOLDEN = 'golden'
    
  class Visibility(models.TextChoices):
    PRIVATE = 'private'
    UNLISTED = 'unlisted'
    PUBLIC = 'public'
  
  team_id = models.UUIDField(db_index=True, editable=False, default=uuid.uuid4(), unique=True)
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  name = models.CharField(max_length=50, blank=True, null=True)
  description = models.CharField(max_length=100, blank=True, null=True)
  age = models.CharField(max_length=6, choices=Age.choices, default=Age.MODERN)
  point_limit = models.IntegerField(blank=True, null=True, default=300)
  visibility = models.CharField(max_length=16, choices=Visibility.choices, default=Visibility.PRIVATE)
  create_time = models.DateTimeField(auto_now_add=True)
  update_time = models.DateTimeField(auto_now=True)
  #theme_team_keyword = ""

  # A JSON array of objects in the form:
  # {
  #   "unit_id": string - contains a unit ID.
  #   "point_value": number - the point value of the unit.
  #   "equipment": (Optional): string - a unit ID of equipment attached to the unit.
  # }
  main_force = models.JSONField(default=list)

  # A JSON array of strings, each containing a unit ID.
  sideline = models.JSONField(default=list)
  object_list = models.JSONField(default=list)
  maps = models.JSONField(default=list)
  tarot_cards = models.JSONField(default=list)
  #alternative_team_ability = ""

  class Meta:
    app_label = 'hcunits'
    managed = True
    db_table = 'teams'

  # Returns a python dict containing the fields which can be used in the
  # team builder page.
  def get_wire_format(self):
    wire_team = {
      "team_id": self.team_id,
      "name": self.name,
      "description": self.description,
      "age": self.age,
      "point_limit": self.point_limit,
      "visibility": self.visibility,
      "create_time": self.create_time,
      "update_time": self.update_time,
    }

    field_list = {
      "main_force": {
        "types": ["character"],
        "field_name": "main_force",
      },
      "sideline": {
        "types": ["character", "mystery_card"],
        "field_name": "sideline",
      },
      "objects": {
        "types": ["object"],
        "field_name": "object_list",
      },
      "maps": {
        "types": ["map"],
        "field_name": "maps",
      },
      "tarot_cards": {
        "types": ["tarot_card"],
        "field_name": "tarot_cards"
      }
    }

    unit_id_list = []
    for field in field_list.keys():
      for unit in getattr(self, field_list[field]["field_name"]):
        unit_id_list.append(unit["unit_id"])
        equipment_id = unit.get("equipment", None)
        if equipment_id != None:
          unit_id_list.append(equipment_id)

    # Get the Units that are referenced by the Team.
    unit_list = Unit.objects.filter(unit_id__in=unit_id_list).values('unit_id', 'name', 'point_values')

    # Create a dict for easy lookup.
    unit_map = {}
    for unit in unit_list:
      unit_map[unit["unit_id"]] = unit

    # For each of the referenced items, add an item containing the unit id and name.
    for field in field_list.keys():
      unit_list = []
      for unit in getattr(self, field_list[field]["field_name"]):
        unit_entry = unit_map.get(unit["unit_id"], None)
        unit["name"] = unit_entry["name"]
        # The unit will already contain its own unit_id and point_value fields, so
        # no need to copy them.
        if field == "main_force":
          equipment_id = unit.get("equipment", None)
          if equipment_id != None:
            equipment = unit_map.get(equipment_id, None)
            if equipment == None:
              del unit["equipment"]
            else:
              point_values = equipment["point_values"]
              if len(point_values) > 0:
                point_value = point_values[0]
              else:
                point_value = 0
              unit["equipment"] = {
                "unit_id": equipment_id,
                "name": equipment["name"],
                "point_value": point_value,
              }
        unit_list.append(unit)
      wire_team[field] = unit_list

    return wire_team

  # Update the model object based on updates provided in the change_list dict.
  # Raises an Exception if there was any error in validation of the update.
  def update_from_wire_format(self, change_list):
    for field in ["name", "description", "point_limit", "age", "visibility"]:
      value = change_list.get(field, None)
      if value != None:
        setattr(self, field, value)

    # Validate the items by checking that items actually exist and that point
    # values and types are valid.
    field_list = {
      "main_force": {
        "types": ["character"],
        "field_name": "main_force",
      },
      "sideline": {
        "types": ["character", "mystery_card"],
        "field_name": "sideline",
      },
      "objects": {
        "types": ["object"],
        "field_name": "object_list",
      },
      "maps": {
        "types": ["map"],
        "field_name": "maps",
      },
      "tarot_cards": {
        "types": ["tarot_card"],
        "field_name": "tarot_cards"
      }
    }

    # Create a list of all the units in the force and query the database for
    # information to compare against.
    unit_id_list = []
    for field in field_list.keys():
      unit_list = change_list.get(field, None)
      if unit_list != None:
        if not isinstance(unit_list, list):
          raise Exception("%s was not of type 'list'" % field)
        i = 0
        for unit in unit_list:
          if not isinstance(unit, object):
            raise Exception("%s[%d] was not of type 'object'" % (field, i))
          unit_id = unit.get("unit_id", None)
          if unit_id == None:
            raise Exception("%s[%d] didn't have 'unit_id'" % (field, i))
          if not isinstance(unit_id, str):
            raise Exception("%s[%d].unit_id was not a string" % (field, i))
          unit_id_list.append(unit_id)
          if field == "main_force":
            equipment_id = unit.get("equipment", None)
            if equipment_id != None:
              if not isinstance(equipment_id, str):
                raise Exception("%s[%d].equipment was not a string" % (field, i))
              unit_id_list.append(equipment_id)
          i += 1

    # Get the Units that are referenced by the Team.
    unit_list = Unit.objects.filter(unit_id__in=unit_id_list).values('unit_id', 'type', 'point_values')
    # Create a dict for easy lookup.
    unit_map = {}
    for unit in unit_list:
      unit_map[unit["unit_id"]] = unit

    for field in field_list.keys():
      unit_list = change_list.get(field, None)
      if unit_list != None:
        field_update = []
        i = 0
        for unit in unit_list:
          unit_id = unit["unit_id"]
          unit_db_entry = unit_map.get(unit_id, None)
          if unit_db_entry == None:
            raise Exception("%s[%d].unit_id ('%s') was invalid" % (field, i, unit_id))
          type = unit_db_entry["type"]
          if not type in field_list[field]["types"]:
            raise Exception("%s[%d].unit_id ('%s') expected type '%s', but found ('%s')" % (field, i, unit_id, str(field_list[field]["types"]), type))
          unit_update = {
            "unit_id": unit_id,
          }

          point_value = unit.get("point_value", None)
          # Point value is required for main force, but optional for the others.
          if field == "main_force" and point_value == None:
            raise Exception("%s[%d] didn't have 'point_value'" % (field, i))
          if point_value:
            if not unit["point_value"] in unit_db_entry["point_values"]:
              raise Exception("main_force[%d].point_value ('%d') was not a valid option in (%s)" % (i, point_value, str(unit_db_entry["point_values"])))
            unit_update["point_value"] = point_value

          # Validate any equipment attached to the unit in the main force.
          if field == "main_force":
            equipment_id = unit.get("equipment", None)
            if equipment_id != None:
              unit_db_entry = unit_map.get(equipment_id, None)
              if unit_db_entry == None:
                raise Exception("%s[%d].equipment ('%s') was invalid" % (field, i, equipment_id))
              type = unit_db_entry["type"]
              if type != "equipment":
                raise Exception("%s[%d].equipment ('%s') expected type 'equipment', but found ('%s')" % (field, i, equipment_id, type))
              unit_update["equipment"] = equipment_id
          # Unit is valid - add it to the main force update.
          field_update.append(unit_update)
          i += 1
  
        # Field update is valid - update the Model field.
        setattr(self, field_list[field]["field_name"], field_update)
    return True

# The Unit model is copied from the API and needs to stay in sync.
# TODO: include the other python file rather than copying it in.
class Unit(models.Model):
    unit_id = models.CharField(primary_key=True, max_length=32)
    set_id = models.CharField(max_length=16)
    collector_number = models.CharField(max_length=16)
    name = models.TextField()
    type = models.CharField(max_length=21)
    point_values = models.JSONField()
    rarity = models.CharField(max_length=15, blank=True, null=True)
    real_name = models.TextField(blank=True, null=True)
    properties = models.JSONField()
    dimensions = models.CharField(max_length=3, blank=True, null=True)
    team_abilities = models.JSONField()
    keywords = models.JSONField()
    special_powers = models.JSONField()
    improved_movement = models.JSONField()
    improved_targeting = models.JSONField()
    object_type = models.CharField(max_length=11, blank=True, null=True)
    object_keyphrases = models.JSONField()
    map_url = models.TextField(blank=True, null=True)
    unit_range = models.IntegerField(blank=True, null=True)
    targets = models.IntegerField(blank=True, null=True)
    speed_type = models.CharField(max_length=17, blank=True, null=True)
    attack_type = models.CharField(max_length=12, blank=True, null=True)
    defense_type = models.CharField(max_length=11, blank=True, null=True)
    damage_type = models.CharField(max_length=9, blank=True, null=True)
    dial_size = models.IntegerField(blank=True, null=True)
    dial = models.JSONField()

    class Meta:
        app_label = 'hcunits'
        managed = False
        db_table = 'units'
