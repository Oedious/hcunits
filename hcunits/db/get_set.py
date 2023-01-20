#!/usr/bin/env python
import argparse
import bisect
import copy
import json
import os
import os.path
import re
import traceback
from bs4 import BeautifulSoup
from collections import OrderedDict
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from xml.sax.saxutils import escape

SET_MAP = {
  "btu": "Batman Team-Up",
  "av4e": "Avengers Forever",
  "hgpc": "Hellfire Gala Premium Collection"
}

CACHE_DIR = ".cache"

def fix_style(str):
  return re.sub(' |-|/', '_', str).replace(':', '').lower()

def get_cache_path(set_id):
  return os.path.join(CACHE_DIR, fix_style(set_id))

def get_set_list_cache_path(set_id):
  filename = "set_list_" + set_id + ".html"
  return os.path.join(get_cache_path(set_id), filename)

def get_unit_cache_path(set_id, unit_id):
  filename = "unit_" + unit_id + ".html"
  return os.path.join(get_cache_path(set_id), filename)

# Returns the starting click of given dial with respect to that of this unit
# or -1 if no match was found.
def dials_equal(dst_dial, src_dial):
  if len(dst_dial) != len(src_dial):
    return False;

  i = 0
  while i < len(dst_dial):
    src = src_dial[i]
    dst = dst_dial[i]
    if (src.get("speed_power") != dst.get("speed_power") or
        src.get("speed_value") != dst.get("speed_value") or
        src.get("attack_power") != dst.get("attack_power") or
        src.get("attack_value") != dst.get("attack_value") or
        src.get("defense_power") != dst.get("defense_power") or
        src.get("defense_value") != dst.get("defense_value") or
        src.get("damage_power") != dst.get("damage_power") or
        src.get("damage_value") != dst.get("damage_value")):
      return False;
    i += 1
  return True;

class Unit:
  def __init__(self, set_id, dimensions):
    self.set_id = set_id
    self.dimensions = dimensions

    # These fields are conditionally used depending on the unit type.
    self.real_name = None
    self.special_type = None
    self.object_type = None

    # TODO: figure out how to determine the age.
    self.age = "modern"

    # These fields are stored as JSON and must always exist, even if empty.
    self.point_values = []
    self.team_abilities = []
    self.keywords = []
    self.special_powers = []
    self.improved_movement = []
    self.improved_targeting = []
    self.object_keyphrases = []
    self.dial = []
    
  def parse_unit_page(self, unit_page):
    soup = BeautifulSoup(unit_page, 'html.parser')

    # Extract the unit ID and the name from the first table.
    unit_id_and_name = soup.find("td", class_="tcat").strong.string.strip().split(' ')
    self.unit_id = unit_id_and_name[0]
    self.name = " ".join(unit_id_and_name[1:])
  
    match_obj = re.search(self.set_id + r"(.*\d{3}[abcdt\.0-9]*)", unit_id)
    self.collector_number = match_obj.group(1)

    # Determine the rarity and special type
    figure_rank_tag = soup.select_one("td[class^=figure_rank_]")
    rarity = figure_rank_tag.strong.string.strip()
    if rarity == "Rarity: Starter Set" or rarity == "Rarity: Limited Edition":
      self.rarity = "limited_edition"
    elif rarity == "Rarity: Common":
      self.rarity = "common"
    elif rarity == "Rarity: Uncommon":
      self.rarity = "uncommon"
    elif rarity == "Rarity: Rare":
      self.rarity = "rare"
    elif rarity == "Rarity: Super Rare":
      self.rarity = "super_rare"
    elif rarity == "Rarity: Chase":
      self.rarity = "chase"
    elif rarity == "Rarity: Ultra Chase":
      self.rarity = "ultra_chase"
    else:
      raise RuntimeError("The unit rarity '%s' for '%s' is currently not supported" % (rarity, self.unit_id))

    figure_rank = re.search(r"figure_rank_(.*)", figure_rank_tag["class"][0]).group(1)
    # The type needs to be determined first because many other values are
    # conditional on it.
    if figure_rank == "" or figure_rank == "unique" or figure_rank == "prime":
      # Look to see if it's a construct, indicated by a special power.
      is_construct = False
      tag_list = soup.find_all(text=re.compile(r'\s*Special Powers\s*'))
      if len(tag_list) > 0:
        is_construct = tag_list[0].parent.parent.parent.parent.tbody.select('tr')[0].select('td')[1].strong.string.strip() == "CONSTRUCTS:"
      if is_construct:
          self.type = "construct"
      elif soup.find("td", class_="card_special_object"):
        self.type = "equipment"
      else:
        self.type = "character"
        self.special_type = figure_rank
        has_dial = soup.find("table", class_="units_dial")
        if not has_dial:
          is_team_up = self.name.startswith("Team Up:")
          if is_team_up:
            self.type = "team_up"
          else:
            has_parent = has_parent = soup.find(text=re.compile(r'\s*Inventory options for this figure are controlled by the main/parent unit.\s*'))
            if has_parent:
              # We just skip these as they'll be accounted for in the unit itself.
              print("Skipping costed trait %s" % (self.unit_id))
            else:
              # It's an unknown type - skip it for now
              print("Skipping unknown unit type %s" % self.unit_id)
            return False
    elif figure_rank == "bystander":
      self.type = figure_rank

    if not self.type:
      raise RuntimeError("The unit type (%s) for '%s' is currently not supported" % (figure_rank, self.unit_id))

    if self.type == "character" or self.type == "bystander" or self.type == "construct":
      point_value_tag = soup.find("div", {"style": "float:right;padding-top:3px;"})
    elif self.type == "equipment":
      point_value_tag = soup.find("td", class_="tfoot")
    elif self.type == "team_up":
      point_value_tag = None
    else:
      raise RuntimeError("Don't know how to decode points for unit type (%s)" % unit_id)
  
    if point_value_tag:
      point_value_str = point_value_tag.string.strip()
      if point_value_str and len(point_value_str) > 0:
        self.point_values.append(int(point_value_str.split(' ')[0]))

    # The set ID is the first non-numeric parts of the unit_id
    if self.type == "character":
      # Parse the real_name field.
      self.real_name = soup.select_one("span[onclick^=showRealName]").string.strip()
  
    if self.type == "character" or self.type == "bystander" or self.type == "construct":
      # Parse team abilities
      tag_list = soup.select("span[onclick^=showQuickSearch]")
      for tag in tag_list:
        match_obj = re.search(r"showQuickSearch\('(.*)','team_ability'\)", tag['onclick'])
        if match_obj:
          team_ability = match_obj.group(1);
          if team_ability == "No Affiliation":
            continue
          # Fix mis-named team abilities.
          if team_ability == "Wonder Woman":
            team_ability = "wonder_woman_ally"
          self.team_abilities.append(fix_style(team_ability).replace('.', ''))
    
    if self.type == "character" or self.type == "bystander" or self.type == "equipment":
      # Parse keywords
      tag_list = soup.select("span[onclick^=showByKeywordId]")
      for tag in tag_list:
        self.keywords.append(tag.string.strip())
        
    if self.type == "equipment":
      equip_tag = soup.find("td", class_="card_special_object").parent
      tag_list = equip_tag.next_sibling.next_sibling.find_all("div")
      if tag_list:
        tag = tag_list[0]
        # Skip the first item in the list if it's the keyword list.
        if tag.strong:
          tag = tag_list[1]

        # TODO: Figure out why tag.string isn't giving me the contents of the div, which I need to iterate over.
        for attr in tag.children:
          # Ignore non-strings.
          if not attr.string:
            continue;
          attr = attr.strip()
          if attr == "INDESTRUCTIBLE" or attr.startswith("EQUIP: ") or attr.startswith("UNEQUIP: "):
            self.object_keyphrases.append(fix_style(attr))
          elif attr == "Light Object":
            object_type = "light"
          elif attr == "Heavy Object":
            object_type = "heavy"
          elif attr == "Ultra Light Object":
            object_type = "ultra_light"
          elif attr == "Ultra Heavy Object":
            object_type = "ultra_heavy"
          elif attr == "Special Object":
            object_type = "special"
          else:
            # Handle equipment special powers
            sp = attr.split(':', 1)
            if len(sp) >= 2:
              sp_name = sp[0]
              sp_description = sp[1]
              if sp_name == "EQUIP":
                object_equip = fix_style(sp_description)
              elif sp_name == "UNEQUIP":
                object_unequip = fix_style(sp_description)
              else:
                self.special_powers.append(OrderedDict([
                  ("type", "equipment"),
                  ("name", sp_name),
                  ("description", escape(sp_description))
                ]))
            else:
              print("Skipping unknown object attribute '%s'" % attr)

    if (self.type == "character" or
        self.type == "team_up" or
        self.type == "bystander" or
        self.type == "equipment" or
        self.type == "construct"):
      # Parse special powers
      tag_list = soup.find_all(text=re.compile(r'\s*Special Powers\s*'))
      if len(tag_list) > 0:
        sp_tag = tag_list[0]
        for tr_tag in sp_tag.parent.parent.parent.parent.tbody.select('tr'):
          td_tags = tr_tag.select('td')
          match_obj = re.search(r"/images/sp-(.+)\.[a-z]{3}", td_tags[0].img['src'])
          sp_type_str = match_obj.group(1)
          if sp_type_str == "special":
            sp_type = "trait"
          elif sp_type_str == "improved":
            sp_type = "improved"
          elif sp_type_str.startswith("m-"):
            sp_type = "speed"
          elif sp_type_str.startswith("a-"):
            sp_type = "attack"
          elif sp_type_str.startswith("d-"):
            sp_type = "defense"
          elif sp_type_str.startswith("g-"):
            sp_type = "damage"
          else:
            raise RuntimeError("The special power type '%s' for '%s' is currently not supported" % (sp_type_str, unit_id))

          sp_name = td_tags[1].strong.string.strip().rstrip(':')

          # Skip the special power that describes a construct
          if self.type == "construct" and sp_name == "CONSTRUCTS":
            continue
          
          # Avoid adding duplicates.
          if [x for x in self.special_powers if x["name"] == sp_name]:
            print("Skipping duplicate special power '%s' for '%s'" % (sp_name, self.unit_id))
            continue
          
          sp_description = td_tags[1].contents[2].strip()
          if sp_type == "improved":
            if sp_name == "MOVEMENT":
              improved_movement = sp_description.split(", ")
            elif sp_name == "TARGETING":
              improved_targeting = sp_description.split(", ")
          else:
            sp = OrderedDict([
              ("type", sp_type),
              ("name", escape(sp_name)),
              ("description", escape(sp_description))
            ])
  
            # Handle special trait types, like costed or rally
            if sp_type == "trait":
              # Determine if it's a costed trait and if so, what it's point value is
              match_obj = re.search(r"^\(\+(\d*) POINTS\) (.+)", sp_name)
              if match_obj:
                sp["type"] = "costed_trait"
                sp["name"] = escape(match_obj.group(2))
                sp["point_value"] = match_obj.group(1)
      
              # Check to see if it's a rally trait.
              match_obj = re.search(r"^RALLY \((\d+)\)", sp_name)
              if match_obj:
                sp["type"] = "rally_trait"
                sp["name"] = "RALLY"
                sp["description"] = escape(td_tags[1].contents[4].strip()[2:])
                sp["rally_type"] = td_tags[1].i.string.strip()[:-13].lower()
                sp["rally_die"] = int(match_obj.group(1))
    
            self.special_powers.append(sp)
  
    if self.type == "character" or self.type == "bystander" or self.type == "construct":
      # Parse range and number of targets
      tag = soup.find("div", {"style": "float:left;padding-top:3px;"})
      self.unit_range = int(tag.contents[0].string.strip())
      self.targets = int(re.search(r"/images/units-targets-(\d)\.[a-z]{3}", tag.img['src']).group(1))
  
      # Parse the combat symbols
      combat_symbols = soup.find("table", class_="icons").tbody.select('tr')
      self.speed_type = re.search(r"/images/units-m-(.+)\.[a-z]{3}", combat_symbols[0].td.img['src']).group(1)
      self.attack_type = re.search(r"/images/units-a-(.+)\.[a-z]{3}", combat_symbols[1].td.img['src']).group(1)
      self.defense_type = re.search(r"/images/units-d-(.+)\.[a-z]{3}", combat_symbols[2].td.img['src']).group(1)
      self.damage_type = re.search(r"/images/units-g-(.+)\.[a-z]{3}", combat_symbols[3].td.img['src']).group(1)
      # Disambiguate between the attack and damage "fist" symbols by making damage 'colossal'
      if self.damage_type == "fist":
        self.damage_type = "colossal"
  
      # Parse the dial
      self.dial_size = 0
      for col in soup.find_all("table", class_="power"):
        tags = col.find_all("tr")
        # If it has a title, it's a non-KO click, otherwise skip it.
        if tags[0].td.has_attr('title'):
          row_obj = OrderedDict()
          row_obj["click_number"] = self.dial_size
          if self.dial_size == 0:
            row_obj["starting_line"] = True
          types = ["speed", "attack", "defense", "damage"]
          for i in range(4):
            tag = tags[i]
            power= tag.td['title']
            # Fix mis-named powers
            if power:
              if power == "Psychic Blast":
                power = "Penetrating/Psychic Blast"
              elif power == "Shapechange":
                power = "Shape Change"
              elif power == "Earthbound":
                power = "Earthbound/Neutralized"
              row_obj[types[i] + "_power"] = fix_style(power)
            row_obj[types[i] + "_value"] = int(tag.td.string.strip())
          self.dial.append(row_obj)
        self.dial_size += 1
          
        # Constructs and bystanders only have a single click
        if self.type == "bystander" or self.type == "construct":
          break
      
    # Sanity-check the dimensions.
    if self.type == "character":
      if self.dimensions == "1x1" or self.dimensions == "1x2":
        max_dial_size = 12
      elif self.dimensions == "2x2":
        max_dial_size = 26
      elif self.dimensions == "2x4" or self.dimensions == "3x6":
        max_dial_size = 20
      else:
        raise RuntimeError("Unknown dimensions for '%s': found '%s'" % (self.unit_id, self.dimensions))
      if self.dial_size > max_dial_size:
        print("Warning: for unit '%s', expected a max dial size of %d, but got %d" % (self.unit_id, max_dial_size, self.dial_size))
        self.dial_size = max_dial_size
      if len(self.dial) > max_dial_size:
        print("Warning: for unit '%s', expected a max dial size of %s, but got %d" % (self.unit_id, max_dial_size, len(self.dial)))
        self.dial = self.dial[:max_dial_size]
    elif self.type == "bystander" or self.type == "construct":
      if self.dimensions != "1x1":
        print("Warning: for unit '%s', expected 1x1 dimensions, but found '%s'" % (self.unit_id, self.dimensions))
      if self.dial_size != 1:
        print("Warning: for unit '%s', expected a dial size of 1, but got %d" % (self.unit_id, self.dial_size))
        self.dial_size = 1
      if len(self.dial) != 1:
        print("Warning: for unit '%s', expected a dial size of 1, but got %d" % (self.unit_id, len(self.dial)))
        self.dial = self.dial[:1]
    else:
      self.dimensions = None

    return True

  # Tries to merge the 'src_unit' into this, as the dest. Returns True if done
  # successfully, otherwise False.
  def merge_point_values(self, src_unit):
    fields = ["name", "age", "rarity", "real_name", "special_type", "dimensions", "team_abilities", "keywords"]
    for field in fields:
      if getattr(self, field) != getattr(src_unit, field):
        print("Warning: merging '%s' and '%s' failed '%s' validation: %s vs %s" % (self.unit_id, src_unit.unit_id, field, getattr(self, field), getattr(src_unit, field)))

    if not len(src_unit.point_values):
      print("Failed to merge '%s' and '%s': too many point values" % (self.unit_id, src_unit.unit_id))
      return False

    if self.point_values[0] <= src_unit.point_values[0]:
      print("Failed to merge '%s' and '%s': destination unit should have larger point value than the source" % (self.unit_id, unit.unit_id))
      return False

    # The starting line should just be the difference in the number of clicks;
    # validate that just to make sure.
    starting_line = len(self.dial) - len(src_unit.dial)
    if not dials_equal(self.dial[starting_line:], src_unit.dial):
      print("Failed to merge '%s' and '%s': dial mismatch" % (self.unit_id, unit.unit_id))
      return False

    # Merge the units by adding a new point value (in sorted order) and starting line.
    pos = 0
    while pos < len(self.point_values) and self.point_values[pos] > src_unit.point_values[0]:
      pos += 1;
    self.point_values.insert(pos, src_unit.point_values[0])
    self.dial[starting_line]["starting_line"] = True
    # Sort the starting lines so that 
    return True;

  def output_xml(self):
    xml = """
    <unit_id>{}</unit_id>
    <set_id>{}</set_id>
    <collector_number>{}</collector_number>
    <name>{}</name>
    <type>{}</type>
    <age>{}</age>""".format(self.unit_id, self.set_id, self.collector_number, escape(self.name), self.type, self.age)
    if self.rarity:
      xml += "\n    <rarity>%s</rarity>" % self.rarity
    if self.real_name:
      xml += "\n    <real_name>%s</real_name>" % escape(self.real_name)
    if self.special_type:
      xml += "\n    <special_type>%s</special_type>" % self.special_type
    if self.dimensions:
      xml += "\n    <dimensions>%s</dimensions>" % self.dimensions
    xml += """
    <point_values>{}</point_values>
    <team_abilities>{}</team_abilities>
    <keywords>{}</keywords>
    <special_powers>{}</special_powers>
    <improved_movement>{}</improved_movement>
    <improved_targeting>{}</improved_targeting>""".format(
      json.dumps(self.point_values), json.dumps(self.team_abilities),
      json.dumps(self.keywords), json.dumps(self.special_powers, indent=2),
      json.dumps(self.improved_movement), json.dumps(self.improved_targeting))
    if self.object_type:
      xml += "\n    <object_type>%s</object_type>" % self.object_type
    xml += "\n    <object_keyphrases>%s</object_keyphrases>" % json.dumps(self.object_keyphrases)
    if len(self.dial) > 0:
      xml += """
    <unit_range>{}</unit_range>
    <targets>{}</targets>
    <speed_type>{}</speed_type>
    <attack_type>{}</attack_type>
    <defense_type>{}</defense_type>
    <damage_type>{}</damage_type>
    <dial_size>{}</dial_size>""".format(self.unit_range, self.targets, self.speed_type, self.attack_type,
      self.defense_type, self.damage_type, self.dial_size)

    # Dial must always exist, even if it's empty for some unit types.
    xml += "\n    <dial>%s</dial>" % json.dumps(self.dial, indent=2)
    return xml

class Fetcher:
  def __init__(self, set_id, skip_cache):
    options = Options()
    options.add_argument("--headless")
    self.driver = webdriver.Chrome(options=options)
    self.set_id = set_id
    self.skip_cache = skip_cache
    
  def close(self):
    self.driver.close()

  # Fetch the set list page
  def fetch_set_list_page(self):
    set_list_path = get_set_list_cache_path(self.set_id)
    if not self.skip_cache and os.path.exists(set_list_path):
      print("Reading set list from cache at " + set_list_path)
      f = open(set_list_path, "r")
      set_list_page = f.read()
      f.close()
    else:
      set_name = SET_MAP[self.set_id];
      self.driver.get('https://www.hcrealms.com/forum/units/units_quicksets.php?q=' + set_name)
      soup = BeautifulSoup(self.driver.page_source, 'html.parser')
      set_list_page = soup.prettify(formatter=lambda s: s.replace(u'\xa0', ' '))
  
      # Save it to disk to re-use later on
      filename = get_set_list_cache_path(self.set_id)
      f = open(filename, "w")
      f.write(set_list_page)
      f.close()
      print("Cached set list page to " + filename)
    return set_list_page
    
  def parse_set_list_page(self, set_list_page, unit_id_start, max_units):
    soup = BeautifulSoup(set_list_page, 'html.parser')
    units_links = soup.find_all("span", {"class": "units_link"})
    set_list = []
    
    unit_count = 0
    for units_link in units_links:
      link = units_link['onclick']
      unit_id = re.search(r"showFigure\('(.+)'\)", link).group(1)
      if unit_id_start and unit_id_start != unit_id:
        continue
      unit_id_start = None
      
      # Get the unit dimensions
      dimensions = "1x1"
      img_link = units_link.parent.select_one("img[src^=\/images\/units\-base\-]")
      if img_link:
        if img_link["src"] == "/images/units-base-double.gif":
          dimensions = "1x2"
        elif img_link["src"] == "/images/units-base-2x2.gif":
          dimensions = "2x2"
        elif img_link["src"] == "/images/units-base-2x4.gif":
          dimensions = "2x4"
        elif img_link["src"] == "/images/units-base-6x3.gif":
          dimensions = "3x6"

      set_list.append({
        "unit_id": unit_id,
        "dimensions": dimensions}
      )
  
      # Process the unit here
      # Exit if we've already processed the requested number of units
      unit_count += 1
      if unit_count >= max_units:
        break
  
    return set_list
        
  def fetch_unit_page(self, unit_id):
    unit_path = get_unit_cache_path(self.set_id, unit_id);
    if not self.skip_cache and os.path.exists(unit_path):
      print("Reading unit from cache at " + unit_path)
      f = open(unit_path, "r")
      unit_page = f.read()
      f.close()
    else:
      self.driver.get('https://www.hcrealms.com/forum/units/units_figure.php?q=' + unit_id)
      soup = BeautifulSoup(self.driver.page_source, 'html.parser')
      unit_page = soup.prettify(formatter=lambda s: s.replace(u'\xa0', ' '))
      # Save it to disk to re-use later on
      filename = get_unit_cache_path(self.set_id, unit_id)
      f = open(filename, "w")
      f.write(unit_page.encode('utf-8'))
      f.close()
      print("Cached unit page to " + filename)
    return unit_page
  

if __name__ == "__main__":
  parser = argparse.ArgumentParser()
  parser.add_argument("--set_id", help="The set ID for which to get", required=True)
  parser.add_argument("--unit_id_start", help="The unit ID from which to start")
  parser.add_argument("--unit_id_stop", help="The unit ID from which to stop")
  parser.add_argument("--skip_cache", help="If set, will avoid using the locally cached versions when available", action='store_true', default=False)
  parser.add_argument("--max_units", help="The maximum number of units parsed in a single pass", default=1000)
  args = parser.parse_args()

  # Ensure that the cache directory exists.
  if not os.path.exists(CACHE_DIR):
    os.mkdir(CACHE_DIR);
  cache_path = get_cache_path(args.set_id);
  if not os.path.exists(cache_path):
    os.mkdir(cache_path);

  units = []
  fetcher = Fetcher(args.set_id, args.skip_cache)
  try:
    set_list_page = fetcher.fetch_set_list_page()
    set_list = fetcher.parse_set_list_page(set_list_page, args.unit_id_start, int(args.max_units))
    for set in set_list:
      unit_id = set["unit_id"]
      dimensions = set["dimensions"]
      if args.unit_id_stop and unit_id == args.unit_id_stop:
        break;
  
      unit_page = fetcher.fetch_unit_page(unit_id);
      unit = Unit(args.set_id, dimensions)
      if unit.parse_unit_page(unit_page):
        # Check for other units with the same unit ID and if so, merge point values.
        main_unit = next((u for u in units if u.set_id == unit.set_id and u.collector_number == unit.collector_number and u.type == unit.type), None)
        if (main_unit):
          # Try to merge the units together and mark the current unit as invalid
          # so that it's not appending to the list below.
          if main_unit.merge_point_values(unit):
            unit = None

        elif unit.type == "team_up":
          # Find the associated unit and create a new unit from that by copying
          # in the team-up special powers and updating the unit_id.
          associated_unit = None
          for u in units:
            if u.unit_id == unit_id[:-2]:
              associated_unit = u
              break
          if associated_unit:
            collector_number = unit.collector_number
            special_powers = unit.special_powers
            unit = copy.deepcopy(associated_unit)
            unit.unit_id = unit_id
            unit.collector_number = collector_number
            unit.special_powers = special_powers + associated_unit.special_powers
          else:
            print("Failed to find corresponding unit for team-up %s" % unit_id)
            unit = None

        if unit:
          units.append(unit)
  except Exception as e:
    print("An error has occurred: ", e, "\n", traceback.format_exc())

  fetcher.close()

  # Sort the units by their unit ID.
  units.sort(key=lambda u: u.unit_id)

  num_processed = 0
  output_xml = "<resultset>"
  for unit in units:
    unit_xml = unit.output_xml()
    if unit_xml:
      output_xml += "\n  <row>"
      output_xml += unit_xml
      output_xml += "\n  </row>"
      num_processed += 1
  output_xml += "\n</resultset>"
  filename = "set_%s.xml" % args.set_id
  f = open(filename, "w")
  f.write(output_xml)
  f.close()
  print("Wrote %d units to %s" % (num_processed, filename))

