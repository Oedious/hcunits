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
  # date/time created
  # date/time modified

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
      "visibility": self.visibility
    }

    unit_id_list = []
    for unit in self.main_force:
      unit_id_list.append(unit["unit_id"])
      equipment_id = unit.get("equipment", None)
      if equipment_id:
        unit_id_list.append(equipment_id)
    unit_id_list += self.sideline + self.object_list + self.maps + self.tarot_cards

    # Get the Units that are referenced by the Team.
    unit_list = Unit.objects.filter(unit_id__in=unit_id_list).values('unit_id', 'name', 'point_values')

    # Create a dict for easy lookup.
    unit_map = {}
    for unit in unit_list:
      unit_map[unit["unit_id"]] = unit
    
    # For each of the referenced items, add an item containing the unit id and name.
    main_force = []
    for unit in self.main_force:
      unit_entry = unit_map.get(unit["unit_id"], None)
      unit["name"] = unit_entry["name"]
      # The unit will already contain its own unit_id and point_value fields, so
      # no need to copy them.
      equipment_id = unit.get("equipment", None)
      if equipment_id:
        equipment = unit_map.get(equipment_id, None)
        if not equipment:
          del unit["equipment"]
        else:
          point_values = equipment["point_values"]
          if len(point_values) > 0:
            point_value = point_values[0]
          else:
            point_value = 0
          unit["equipment"] = {
            "unit_id": equipment_id,
            "name": equipment.name,
            "point_value": point_value,
          }
      main_force.append(unit)
    wire_team["main_force"] = main_force

    sideline = []
    for unit_id in self.sideline:
      unit = unit_map.get(unit_id, None)
      if unit:
        sideline.append({
          "unit_id": unit_id,
          "name": unit["name"],
        })
    wire_team["sideline"] = sideline

    objects = []
    for unit_id in self.object_list:
      unit = unit_map.get(unit_id, None)
      if unit:
        point_values = unit["point_values"]
        if len(point_values) > 0:
          point_value = point_values[0]
        else:
          point_value = 0
        objects.append({
          "unit_id": unit_id,
          "name": unit["name"],
          "point_value": point_value,
        })
    wire_team["objects"] = objects

    maps = []
    for unit_id in self.maps:
      unit = unit_map.get(unit_id, None)
      if unit:
        maps.append({
          "unit_id": unit_id,
          "name": unit["name"],
        })
    wire_team["maps"] = maps

    tarot_cards = []
    for unit_id in self.tarot_cards:
      unit = unit_map.get(unit_id, None)
      if unit:
        tarot_cards.append({
          "unit_id": unit_id,
          "name": unit["name"],
        })
    wire_team["tarot_cards"] = tarot_cards
    return wire_team

  # Update the model object based on updates provided in the change_list dict.
  # Raises an Exception if there was any error in validation of the update.
  def update_from_wire_format(self, change_list):
    for field in ["name", "description", "point_limit", "age", "visibility"]:
      value = change_list.get(field, None)
      if value:
        setattr(self, field, value)

    # Validate the items by checking that items actually exist and that point
    # values and types are valid.
    main_force = change_list.get("main_force", None)
    sideline = change_list.get("sideline", None)
    objects = change_list.get("objects", None)
    maps = change_list.get("maps", None)
    tarot_cards = change_list.get("tarot_cards", None)

    # Create a list of all the units in the force and query the database for
    # information to compare against.
    unit_id_list = []
    if main_force:
      if not isinstance(main_force, list):
        raise Exception("main_force was not of type 'list'")
      i = 0
      for unit in main_force:
        unit_id = unit.get("unit_id", None)
        if not unit_id:
          raise Exception("main_force[%d] didn't have 'unit_id'" % i)
        if not isinstance(unit_id, str):
          raise Exception("main_force[%d].unit_id was not a string" % i)
        unit_id_list.append(unit_id)
        equipment_id = unit.get("equipment", None)
        if equipment_id:
          if not isinstance(equipment_id, str):
            raise Exception("main_force[%d].equipment was not a string" % i)
          unit_id_list.append(equipment_id)
        i += 1

    if sideline:
      if not isinstance(sideline, list):
        raise Exception("sideline was not of type 'list'")
      i = 0
      for unit_id in sideline:
        if not isinstance(unit_id, str):
          raise Exception("sideline[%d] was not a string" % i)
        unit_id_list.append(unit_id)
        i += 1

    if objects:
      if not isinstance(objects, list):
        raise Exception("objects was not of type 'list'")
      i = 0
      for unit_id in objects:
        if not isinstance(unit_id, str):
          raise Exception("objects[%d] was not a string" % i)
        unit_id_list.append(unit_id)
        i += 1

    if maps:
      if not isinstance(maps, list):
        raise Exception("maps was not of type 'list'")
      i = 0
      for unit_id in maps:
        if not isinstance(unit_id, str):
          raise Exception("maps[%d] was not a string" % i)
        unit_id_list.append(unit_id)
        i += 1

    if tarot_cards:
      if not isinstance(tarot_cards, list):
        raise Exception("tarot_cards was not of type 'list'")
      i = 0
      for unit_id in tarot_cards:
        if not isinstance(unit_id, str):
          raise Exception("tarot_cards[%d] was not a string" % i)
        unit_id_list.append(unit_id)
        i += 1

    # Get the Units that are referenced by the Team.
    unit_list = Unit.objects.filter(unit_id__in=unit_id_list).values('unit_id', 'type', 'point_values')
    # Create a dict for easy lookup.
    unit_map = {}
    for unit in unit_list:
      unit_map[unit["unit_id"]] = unit

    if main_force:
      main_force_update = []
      i = 0
      for unit in main_force:
        unit_id = unit["unit_id"]
        unit_db_entry = unit_map.get(unit_id, None)
        if not unit_db_entry:
          raise Exception("main_force[%d].unit_id ('%s') was invalid" % (i, unit_id))
        type = unit_db_entry["type"]
        if type != "character":
          raise Exception("main_force[%d].unit_id ('%s') expected type 'character', but found ('%s')" % (i, unit_id, type))
        point_value = unit.get("point_value", None)
        if not point_value:
          raise Exception("main_force[%d] didn't have 'point_value'" % i)
        if not unit["point_value"] in unit_db_entry["point_values"]:
          raise Exception("main_force[%d].point_value ('%d') was not a valid option in (%s)" % (i, point_value, str(unit_db_entry["point_values"])))
        unit_update = {
          "unit_id": unit_id,
          "point_value": point_value,
        }
        # Validate any equipment attached to the unit.
        equipment_id = unit.get("equipment", None)
        if equipment_id:
          unit_db_entry = unit_map.get(equipment_id, None)
          if not unit_db_entry:
            raise Exception("main_force[%d].equipment ('%s') was invalid" % (i, equipment_id))
          type = unit_db_entry["type"]
          if type != "equipment":
            raise Exception("main_force[%d].equipment ('%s') expected type 'equipment', but found ('%s')" % (i, equipment_id, type))
          unit_update["equipment"] = equipment_id
        # Unit is valid - add it to the main force update.
        main_force_update.append(unit_update)
        i += 1

      # Main force is valid - update the Model field.
      self.main_force = main_force_update

    # Validate and commit sideline update.
    if sideline:
      sideline_update = []
      i = 0
      for unit_id in sideline:
        unit_db_entry = unit_map.get(unit_id, None)
        if not unit_db_entry:
          raise Exception("sideline[%d] ('%s') was invalid" % (i, unit_id))
        type = unit_db_entry["type"]
        if type != "character" and type != "mystery_card":
          raise Exception("sideline[%d] ('%s') expected type 'character' or 'mystery_card', but found ('%s')" % (i, unit_id, type))
        sideline_update.append(unit_id)
        i += 1
      self.sideline = sideline_update

    # Validate and commit objects update.
    if objects:
      objects_update = []
      i = 0
      for unit_id in objects:
        unit_db_entry = unit_map.get(unit_id, None)
        if not unit_db_entry:
          raise Exception("objects[%d] ('%s') was invalid" % (i, unit_id))
        type = unit_db_entry["type"]
        if type != "object":
          raise Exception("objects[%d] ('%s') expected type 'object', but found ('%s')" % (i, unit_id, type))
        objects_update.append(unit_id)
        i += 1
      self.object_list = objects_update

    # Validate and commit maps update.
    if maps:
      maps_update = []
      i = 0
      for unit_id in maps:
        unit_db_entry = unit_map.get(unit_id, None)
        if not unit_db_entry:
          raise Exception("maps[%d] ('%s') was invalid" % (i, unit_id))
        type = unit_db_entry["type"]
        if type != "map":
          raise Exception("maps[%d] ('%s') expected type 'map', but found ('%s')" % (i, unit_id, type))
        maps_update.append(unit_id)
        i += 1
      self.map_list = maps_update

    # Validate and commit tarot_cards update.
    if tarot_cards:
      tarot_cards_update = []
      i = 0
      for unit_id in tarot_cards:
        unit_db_entry = unit_map.get(unit_id, None)
        if not unit_db_entry:
          raise Exception("tarot_cards[%d] ('%s') was invalid" % (i, unit_id))
        type = unit_db_entry["type"]
        if type != "tarot_card":
          raise Exception("tarot_cards[%d] ('%s') expected type 'tarot_card', but found ('%s')" % (i, unit_id, type))
        tarot_cards_update.append(unit_id)
        i += 1
      self.tarot_cards = tarot_cards_update

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
    age = models.CharField(max_length=6)
    rarity = models.CharField(max_length=15, blank=True, null=True)
    real_name = models.TextField(blank=True, null=True)
    special_type = models.CharField(max_length=15, blank=True, null=True)
    dimensions = models.CharField(max_length=3, blank=True, null=True)
    team_abilities = models.JSONField()
    keywords = models.JSONField()
    special_powers = models.JSONField()
    improved_movement = models.JSONField()
    improved_targeting = models.JSONField()
    object_type = models.CharField(max_length=11, blank=True, null=True)
    object_keyphrases = models.JSONField()
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
