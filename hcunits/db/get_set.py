#!/usr/bin/env python
import argparse
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

class Unit:
  def __init__(self, set_id):
    self.set_id = set_id

    # These fields are conditionally used depending on the unit type.
    self.parent_unit_id = None
    self.real_name = None
    self.special_type = None
    self.dimensions = None
    self.object_type = None

    # These fields are stored as JSON and must always exist, even if empty.
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
    unitIdAndName = soup.find("td", class_="tcat").strong.string.strip().split(' ')
    self.unit_id = unitIdAndName[0]
    self.name = " ".join(unitIdAndName[1:])
  
    match_obj = re.search(self.set_id + r"(.*[0-9]{3})", unit_id)
    self.collector_number = match_obj.group(1)
    has_parent = soup.find(text=re.compile(r'\s*Inventory options for this figure are controlled by the main/parent unit.\s*'))
    if (has_parent):
      self.parent_unit_id = self.set_id + self.collector_number
  
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

    # TODO: figure out how to determine the age.
    self.age = "modern"

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
          if has_parent:
            # We just skip these as they'll be accounted for in the unit itself.
            print("Skipping costed trait %s" % (self.unit_id))
          elif is_team_up:
            # Skip these until we can fully support team-up cards
            print("Skipping team-up %s" % (self.unit_id))
          else:
            # It's an unknown type - skip it for now
            print("Skipping unknown unit type %s" % self.unit_id)
          return None
    elif figure_rank == "bystander":
      self.type = figure_rank

    if not self.type:
      raise RuntimeError("The unit type (%s) for '%s' is currently not supported" % (figure_rank, self.unit_id))

    if self.type == "character" or self.type == "bystander" or self.type == "construct":
      point_value_tag = soup.find("div", {"style": "float:right;padding-top:3px;"})
    elif self.type == "equipment":
      point_value_tag = soup.find("td", class_="tfoot")
    else:
      raise RuntimeError("Don't know how to decode points for unit type (%s)" % unit_id)
    self.point_value = int(point_value_tag.string.strip().split(' ')[0])

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
          
    if self.type == "character" or self.type == "bystander" or self.type == "construct":
      # TODO: figure out how to determine the base size
      self.dimensions = "1x1"

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

    if self.type == "character" or self.type == "bystander" or self.type == "equipment" or self.type == "construct":
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
      # TODO: figure out when dials don't start at 1
      self.dial_start = 1
      self.dial_size = 0
      for col in soup.find_all("table", class_="power"):
        self.dial_size += 1
        tags = col.find_all("tr")
        # If it has a title, it's a non-KO click, otherwise skip it.
        if tags[0].td.has_attr('title'):
          row_obj = OrderedDict()
          row_obj["click_number"] = self.dial_size
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
              row_obj[types[i] + "_power"] = fix_style(power)
            row_obj[types[i] + "_value"] = int(tag.td.string.strip())
          self.dial.append(row_obj)
          
        # Constructs and bystanders only have a single click
        if self.type == "bystander" or self.type == "construct":
          break
  
  def outputXml(self):
    xml = """
    <unit_id>{}</unit_id>
    <set_id>{}</set_id>
    <collector_number>{}</collector_number>
    <name>{}</name>
    <type>{}</type>
    <point_value>{}</point_value>
    <age>{}</age>""".format(self.unit_id, self.set_id, self.collector_number, escape(self.name), self.type, self.point_value, self.age)
    if self.rarity:
      xml += "\n    <rarity>%s</rarity>" % self.rarity
    if self.parent_unit_id:
      xml += "\n    <parent_unit_id>%s</parent_unit_id>" % self.parent_unit_id
    if self.real_name:
      xml += "\n    <real_name>%s</real_name>" % escape(self.real_name)
    if self.special_type:
      xml += "\n    <special_type>%s</special_type>" % self.special_type
    if self.dimensions:
      xml += "\n    <dimensions>%s</dimensions>" % self.dimensions
    xml += """
    <team_abilities>{}</team_abilities>
    <keywords>{}</keywords>
    <special_powers>{}</special_powers>
    <improved_movement>{}</improved_movement>
    <improved_targeting>{}</improved_targeting>""".format(
      json.dumps(self.team_abilities), json.dumps(self.keywords),
      json.dumps(self.special_powers, indent=2), json.dumps(self.improved_movement),
      json.dumps(self.improved_targeting))
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
    <dial_start>{}</dial_start>
    <dial_size>{}</dial_size>""".format(self.unit_range, self.targets, self.speed_type, self.attack_type,
      self.defense_type, self.damage_type, self.dial_start, self.dial_size)

    # Dial must always exist, even if it's empty for some unit types.
    xml += "\n    <dial>%s</dial>" % json.dumps(self.dial, indent=2)
    return xml

class Fetcher:
  def __init__(self, set_id):
    options = Options()
    options.add_argument("--headless")
    self.driver = webdriver.Chrome(options=options)
    self.set_id = set_id
    
  def close(self):
    self.driver.close()

  # Fetch the set list page
  def fetch_set_list_page(self):
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
    unit_list = []
    
    unit_count = 0
    for units_link in units_links:
      link = units_link['onclick']
      unit_id = re.search(r"showFigure\('(.+)'\)", link).group(1)
      if unit_id_start and unit_id_start != unit_id:
        continue
      
      unit_id_start = None
      unit_list.append(unit_id)
  
      # Process the unit here
      # Exit if we've already processed the requested number of units
      unit_count += 1
      if unit_count >= max_units:
        break
  
    return unit_list
        
  def fetch_unit_page(self, unit_id):
    self.driver.get('https://www.hcrealms.com/forum/units/units_figure.php?q=' + unit_id)
    soup = BeautifulSoup(self.driver.page_source, 'html.parser')
    set_list_page = soup.prettify(formatter=lambda s: s.replace(u'\xa0', ' '))
    # Save it to disk to re-use later on
    filename = get_unit_cache_path(self.set_id, unit_id)
    f = open(filename, "w")
    f.write(set_list_page.encode('utf-8'))
    f.close()
    print("Cached unit page to " + filename)
    return set_list_page
  

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

  fetcher = Fetcher(args.set_id)
  try:
    set_list_path = get_set_list_cache_path(args.set_id)
    if not args.skip_cache and os.path.exists(set_list_path):
      print("Reading set list from cache at " + set_list_path)
      f = open(set_list_path, "r")
      set_list_page = f.read()
      f.close()
    else:
      set_list_page = fetcher.fetch_set_list_page()
  
    unit_id_list = fetcher.parse_set_list_page(set_list_page, args.unit_id_start, int(args.max_units))
  
    unit_list = "<resultset>"
    num_processed = 0
    for unit_id in unit_id_list:
      if args.unit_id_stop and unit_id == args.unit_id_stop:
        break;
  
      unit_path = get_unit_cache_path(args.set_id, unit_id);
      if not args.skip_cache and os.path.exists(unit_path):
        print("Reading unit from cache at " + unit_path)
        f = open(unit_path, "r")
        unit_page = f.read()
        f.close()
      else:
        unit_page = fetcher.fetch_unit_page(unit_id);
      unit = Unit(args.set_id)
      unit.parse_unit_page(unit_page)
      unit_xml = unit.outputXml()
      if unit_xml:
        unit_list += "\n  <row>"
        unit_list += unit_xml
        unit_list += "\n  </row>"
        num_processed += 1
  except Exception as e:
    print("An error has occurred: ", e, "\n", traceback.format_exc())

  fetcher.close()
  unit_list += "\n</resultset>"
  filename = "set_%s.xml" % args.set_id
  f = open(filename, "w")
  f.write(unit_list)
  f.close()
  print("Wrote %d units to %s" % (num_processed, filename))

