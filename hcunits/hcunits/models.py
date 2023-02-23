import datetime
import uuid
from django.contrib.auth.models import User
from django.db import models
from hcunits_api.models import Unit


class UserProfile(models.Model):
  user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
  favorites = models.ManyToManyField(Unit)
  
class Team(models.Model):
  class Age(models.TextChoices):
    MODERN = 'modern'
    GOLDEN = 'golden'
    
  class Visibility(models.TextChoices):
    PRIVATE = 'private'
    UNLISTED = 'unlisted'
    PUBLIC = 'public'
  
  team_id = models.UUIDField(db_index=True, editable=False, default=None, unique=True)
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
  #.  "costed_trait_index": (Optional): number - the special power index of the associated costed trait.
  #   "equipment_ids": (Optional): list of strings, each with a unit ID of equipment attached to the unit.
  # }
  main_force = models.JSONField(default=list)

  # A JSON array of objects in the form:
  # {
  #   "unit_id": string - contains a unit ID.
  #   "point_value": number - the point value of the unit.
  # }
  object_list = models.JSONField(default=list)

  # A JSON array of objects in the form:
  # {
  #   "unit_id": string - contains a unit ID.
  #   "location_index": (Optional) number - the special power index of the associated location.
  # }
  maps = models.JSONField(default=list)

  # Each of the two fields below are JSON arrays of objects in the form:
  # {
  #   "unit_id": string - contains a unit ID.
  # }
  sideline = models.JSONField(default=list)
  tarot_cards = models.JSONField(default=list)

  UNIT_FIELD_LIST = {
    "main_force": {
      "types": ["character", "bystander"],
      "field_name": "main_force",
    },
    "sideline": {
      "types": ["character", "object", "equipment", "bystander", "mystery_card"],
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

  class Meta:
    app_label = 'hcunits'
    managed = True
    db_table = 'teams'

  # Returns a python dict containing the fields which can be used in the
  # team builder page.
  def get_wire_format(self, header_only):
    SECONDS_PER_HOUR = 60 * 60
    SECONDS_PER_MINUTE = 60
    now = datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc)
    time_diff = now - self.update_time
    if time_diff.days > 0:
      displayable_update_time = "%d days ago" % int(time_diff.days)
    elif time_diff.seconds / SECONDS_PER_HOUR > 1:
      displayable_update_time = "%d hours ago" % int(time_diff.seconds / SECONDS_PER_HOUR)
    elif time_diff.seconds / SECONDS_PER_MINUTE > 1:
      displayable_update_time = "%d minutes ago" % int(time_diff.seconds / SECONDS_PER_MINUTE)
    else:
      displayable_update_time = "%d seconds ago" % int(time_diff.seconds)
    wire_team = {
      "owner": self.user.username,
      "team_id": self.team_id,
      "name": self.name,
      "description": self.description,
      "age": self.age,
      "point_limit": self.point_limit,
      "visibility": self.visibility,
      "create_time": self.create_time,
      "update_time": self.update_time,
      "displayable_update_time": displayable_update_time,
    }
    if header_only:
      return wire_team

    unit_id_list = []
    for field in Team.UNIT_FIELD_LIST.keys():
      for unit in getattr(self, Team.UNIT_FIELD_LIST[field]["field_name"]):
        unit_id_list.append(unit["unit_id"])
        equipment_ids = unit.get("equipment_ids", None)
        if equipment_ids != None:
          unit_id_list += equipment_ids

    # Get the Units that are referenced by the Team.
    unit_list = Unit.objects.filter(unit_id__in=unit_id_list).values(
        'unit_id', 'name', 'point_values', 'special_powers', 'properties', 'keywords')

    # Create a dict for easy lookup.
    unit_map = {}
    for unit in unit_list:
      unit_map[unit["unit_id"]] = unit

    # For each of the referenced items, add an item containing the unit id and name.
    for field in Team.UNIT_FIELD_LIST.keys():
      unit_list = []
      for unit in getattr(self, Team.UNIT_FIELD_LIST[field]["field_name"]):
        unit_entry = unit_map.get(unit["unit_id"], None)
        # The unit will already contain its own unit_id field, so
        # no need to copy them.
        unit["name"] = unit_entry["name"]
        unit["properties"] = unit_entry["properties"]
        unit["keywords"] = unit_entry["keywords"]
        # Special handling for costed traits and equipment attached to a main
        # force unit.
        if field == "main_force":
          costed_trait_index = unit.get("costed_trait_index", -1)
          if costed_trait_index >= 0:
            if costed_trait_index < len(unit_entry["special_powers"]):
              sp = unit_entry["special_powers"][costed_trait_index]
              if sp["type"] == "costed_trait":
                unit["costed_trait"] = {
                  "name": sp["name"],
                  "point_value": sp["point_value"],
                  "special_power_index": costed_trait_index,
                }
          equipment_ids = unit.get("equipment_ids", None)
          if equipment_ids != None:
            unit["equipment"] = []
            for equipment_id in equipment_ids:
              equipment = unit_map.get(equipment_id, None)
              if equipment != None:
                point_values = equipment["point_values"]
                if len(point_values) > 0:
                  # If the equipment shares a keyword with the unit it is
                  # equipped to, the point cost is 0.
                  if not set(unit["keywords"]).isdisjoint(equipment["keywords"]):
                    point_value = 0
                  else:
                    point_value = point_values[0]
                else:
                  point_value = 0
                unit["equipment"].append({
                  "unit_id": equipment_id,
                  "name": equipment["name"],
                  "point_value": point_value,
                })
        # Special handling for location associated with a map.
        if field == "maps":
          location_index = unit.get("location_index", -1)
          if location_index >= 0:
            if location_index < len(unit_entry["special_powers"]):
              sp = unit_entry["special_powers"][location_index]
              if sp["type"] == "location":
                unit["location"] = {
                  "name": sp["name"],
                  "point_value": sp["point_value"],
                  "special_power_index": location_index,
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

    # Create a list of all the units in the force and query the database for
    # information to compare against.
    unit_id_list = []
    for field in Team.UNIT_FIELD_LIST.keys():
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
            equipment_ids = unit.get("equipment_ids", None)
            if equipment_ids != None:
              if not isinstance(equipment_ids, list):
                raise Exception("%s[%d].equipment was not a string" % (field, i))
              j = 0
              for equipment_id in equipment_ids:
                if not isinstance(equipment_id, str):
                  raise Exception("%s[%d].equipment_ids[%d] was not a string" % (field, i, j))
                unit_id_list.append(equipment_id)
                j += 1
          i += 1

    # Get the Units that are referenced by the Team.
    unit_list = Unit.objects.filter(unit_id__in=unit_id_list).values(
        'unit_id', 'type', 'point_values', 'special_powers')
    # Create a dict for easy lookup.
    unit_map = {}
    for unit in unit_list:
      unit_map[unit["unit_id"]] = unit

    for field in Team.UNIT_FIELD_LIST.keys():
      field_properties = Team.UNIT_FIELD_LIST[field]
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
          if not type in field_properties["types"]:
            raise Exception("%s[%d].unit_id ('%s') expected type '%s', but found ('%s')" % (field, i, unit_id, str(field_properties["types"]), type))
          unit_update = {
            "unit_id": unit_id,
          }

          point_value = unit.get("point_value", None)
          # Point value is required for main force, but optional for the others.
          if field == "main_force" and point_value == None:
            raise Exception("%s[%d] didn't have 'point_value'" % (field, i))
          # For the others, we don't store it - just validate it.
          if point_value:
            if not unit["point_value"] in unit_db_entry["point_values"]:
              raise Exception("%s[%d].point_value ('%d') was not a valid option in (%s)" % (field, i, point_value, str(unit_db_entry["point_values"])))
            if field == "main_force" or field == "objects":
              unit_update["point_value"] = point_value

          # Validate any costed traits or equipment attached to the unit in the
          # main force.
          if field == "main_force":
            costed_trait_index = unit.get("costed_trait_index", -1)
            if costed_trait_index >= 0:
              special_powers = unit_db_entry.get("special_powers", [])
              if costed_trait_index >= len(special_powers):
                raise Exception("%s[%d].costed_trait_index ('%d') was not a valid special power index" % (field, i, costed_trait_index))
              sp = special_powers[costed_trait_index]
              sp_type = sp.get("type", "")
              if sp_type != "costed_trait":
                raise Exception("%s[%d].costed_trait_index ('%d') was the wrong type ('%s')" % (field, i, costed_trait_index, sp_type))
              sp_point_value = sp.get("point_value", 0)
              if sp_point_value <= 0:
                raise Exception("%s[%d].costed_trait_index ('%d') did not have a point value" % (field, i, costed_trait_index))
              unit_update["costed_trait_index"] = costed_trait_index

            equipment_ids = unit.get("equipment_ids", None)
            if equipment_ids != None and len(equipment_ids) > 0:
              j = 0
              unit_update["equipment_ids"] = []
              for equipment_id in equipment_ids:
                if equipment_id != None:
                  unit_db_entry = unit_map.get(equipment_id, None)
                  if unit_db_entry == None:
                    raise Exception("%s[%d].equipment_ids[%d] ('%s') was invalid" % (field, i, j, equipment_id))
                  type = unit_db_entry["type"]
                  if type != "equipment":
                    raise Exception("%s[%d].equipment_ids[%d] ('%s') expected type 'equipment', but found ('%s')" % (field, i, j, equipment_id, type))
                  unit_update["equipment_ids"].append(equipment_id)
                j += 1

          # Validate any location attached to the map unit.
          if field == "maps":
            location_index = unit.get("location_index", -1)
            if location_index >= 0:
              special_powers = unit_db_entry.get("special_powers", [])
              if location_index >= len(special_powers):
                raise Exception("%s[%d].location_index ('%d') was not a valid special power index" % (field, i, location_index))
              sp = special_powers[location_index]
              sp_type = sp.get("type", "")
              if sp_type != "location":
                raise Exception("%s[%d].location_index ('%d') was the wrong type ('%s')" % (field, i, location_index, sp_type))
              sp_point_value = sp.get("point_value", 0)
              if sp_point_value <= 0:
                raise Exception("%s[%d].location_index ('%d') did not have a point value" % (field, i, location_index))
              unit_update["location_index"] = location_index

          # Unit is valid - add it to the main force update.
          field_update.append(unit_update)
          i += 1
  
        # Field update is valid - update the Model field.
        setattr(self, field_properties["field_name"], field_update)
    return True