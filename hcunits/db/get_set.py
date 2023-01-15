#!/usr/bin/env python
import argparse
import json
import os
import os.path
import re
from bs4 import BeautifulSoup
from collections import OrderedDict
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

SET_MAP = {
  "av4e": "Avengers Forever",
  "hgpc": "Hellfire Gala Premium Collection"
}

CACHE_DIR = ".cache"

def fix_style(str):
  return re.sub(' |-|/', '_', str).lower()

def get_cache_path(set_id):
  return os.path.join(CACHE_DIR, fix_style(set_id))

def get_set_list_cache_path(set_id):
  filename = "set_list_" + set_id + ".html"
  return os.path.join(get_cache_path(set_id), filename)

def get_unit_cache_path(set_id, unit_id):
  filename = "unit_" + unit_id + ".html"
  return os.path.join(get_cache_path(set_id), filename)

# Fetch the set list page
def fetch_set_list_page(set_id):
  set_name = SET_MAP[set_id];
  options = Options()
  options.add_argument("--headless")
  driver = webdriver.Chrome(options=options)
  driver.get('https://www.hcrealms.com/forum/units/units_quicksets.php?q=' + set_name)
  soup = BeautifulSoup(driver.page_source, 'html.parser')
  driver.close()
  set_list_page = soup.prettify(formatter=lambda s: s.replace(u'\xa0', ' '))
  # Save it to disk to re-use later on
  filename = get_set_list_cache_path(set_id)
  f = open(filename, "w")
  f.write(set_list_page)
  f.close()
  print("Cached set list page to " + filename)
  return set_list_page
  
def parse_set_list_page(set_list_page, unit_id_start, max_units):
  soup = BeautifulSoup(set_list_page, 'html.parser')
  units_links = soup.find_all("span", {"class": "units_link"})
  unit_list = []
  
  unit_count = 0
  for units_link in units_links:
    link = units_link['onclick']
    unit_id = re.match(r"showFigure\('(.+)'\)", link).group(1)
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
      
def fetch_unit_page(set_id, unit_id):
  options = Options()
  options.add_argument("--headless")
  driver = webdriver.Chrome(options=options)
  driver.get('https://www.hcrealms.com/forum/units/units_figure.php?q=' + unit_id)
  soup = BeautifulSoup(driver.page_source, 'html.parser')
  driver.close()
  set_list_page = soup.prettify(formatter=lambda s: s.replace(u'\xa0', ' '))
  # Save it to disk to re-use later on
  filename = get_unit_cache_path(set_id, unit_id)
  f = open(filename, "w")
  f.write(set_list_page.encode('utf-8'))
  f.close()
  print("Cached unit page to " + filename)
  return set_list_page

def parse_unit_page(set_id, unit_page):
  soup = BeautifulSoup(unit_page, 'html.parser')
  
  # Extract the unit ID and the name from the first table.
  unitIdAndName = soup.find("td", class_="tcat").strong.string.strip().split(' ')
  unit_id = unitIdAndName[0]
  name = " ".join(unitIdAndName[1:])

  match_obj = re.match(set_id + r"(.?[0-9]{3})", unit_id)
  collector_number = match_obj.group(1)
  parent_unit_id = ""
  has_parent = soup.find(text=re.compile(r'\s*Inventory options for this figure are controlled by the main/parent unit.\s*'))
  if (has_parent):
    parent_unit_id = set_id + collector_number

  # Determine the rarity and special type
  figure_rank_tag = soup.select_one("td[class^=figure_rank_]")
  rarity = figure_rank_tag.strong.string.strip()
  if rarity == "Rarity: Starter Set" or rarity == "Rarity: Limited Edition":
    rarity = "limited_edition"
  elif rarity == "Rarity: Common":
    rarity = "common"
  elif rarity == "Rarity: Uncommon":
    rarity = "uncommon"
  elif rarity == "Rarity: Rare":
    rarity = "rare"
  elif rarity == "Rarity: Super Rare":
    rarity = "super_rare"
  elif rarity == "Rarity: Chase":
    rarity = "chase"
  elif rarity == "Rarity: Ultra Chase":
    rarity = "ultra_chase"
  else:
    print("The unit rarity '%s' for '%s' is currently not supported" % (rarity, unit_id))
    exit(1)
  
  figure_rank = re.match(r"figure_rank_(.*)", figure_rank_tag["class"][0]).group(1)
  type = "unknown"
  special_type = ""
  # The type needs to be determined first because many other values are
  # conditional on it.
  if figure_rank == "" or figure_rank == "unique" or figure_rank == "prime":
    type = "character"
    special_type = figure_rank
    if has_parent and not soup.find("table", {"class": "units_dial"}):
      # We just skip these as they'll be accounted for in the unit itself.
      print("Skipping costed trait %s" % (unit_id))
      type = "costed_trait"
      return None
  elif figure_rank == "bystander":
    type = figure_rank
  else:
    print("The unit type (%s) for '%s' is currently not supported" % (figure_rank, unit_id))
    exit(1)

  team_abilities = []
  keywords = []
  real_name = ""

  # The set ID is the first non-numeric parts of the unit_id
  if type == "character":
    # Parse the real_name field.
    str = soup.select_one("span[onclick^=showRealName]")['onclick']
    match_obj = re.match(r"showRealName\('(.*)'\)", str)
    real_name = match_obj.group(1)

  if type == "character" or type == "bystander":
    # Parse team abilities
    tag_list = soup.select("span[onclick^=showQuickSearch]")
    for tag in tag_list:
      match_obj = re.match(r"showQuickSearch\('(.*)','team_ability'\)", tag['onclick'])
      if match_obj:
        team_ability = match_obj.group(1);
        if team_ability == "No Affiliation":
          continue
        team_abilities.append(fix_style(team_ability).replace('.', ''))

    # Parse keywords
    tag_list = soup.select("span[onclick^=showByKeywordId]")
    for tag in tag_list:
      keywords.append(tag.string.strip())

    # Parse special powers
    special_powers = []
    improved_movement = []
    improved_targeting = []
    tag_list = soup.find_all(text=re.compile(r'\s*Special Powers\s*'))
    if len(tag_list) > 0:
      sp_tag = tag_list[0]
      for tr_tag in sp_tag.parent.parent.parent.parent.tbody.select('tr'):
        td_tags = tr_tag.select('td')
        match_obj = re.match(r"/images/sp-(.*)\.[a-z]{3}", td_tags[0].img['src'])
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
          print("The special power type '%s' for '%s' is currently not supported" % (sp_type_str, unit_id))
          exit(1)
        sp_name = td_tags[1].strong.string.strip().rstrip(':')
        # Determine if it's a costed trait and if so, what it's point value is
        sp_point_value = None
        match_obj = re.match(r"^\(\+(\d*) POINTS\) (.*)", sp_name)
        if match_obj:
          sp_type = "costed_trait"
          sp_point_value = match_obj.group(1)
          sp_name = match_obj.group(2)
        sp_description = td_tags[1].contents[2].strip()
        if sp_type == "improved":
          if sp_name == "MOVEMENT":
            improved_movement = sp_description.split(", ")
          elif sp_name == "TARGETING":
            improved_targeting = sp_description.split(", ")
        else:
          sp = OrderedDict([
            ("type", sp_type),
            ("name", sp_name),
            ("description", sp_description)
          ])
          if sp_point_value:
            sp["point_value"] = sp_point_value
          special_powers.append(sp)

    # Parse range and number of targets
    tag = soup.find("div", {"style": "float:left;padding-top:3px;"})
    unit_range = tag.contents[0].string.strip()
    targets = re.match(r"/images/units-targets-(\d)\.[a-z]{3}", tag.img['src']).group(1)

    # Parse the combat symbols
    combat_symbols = soup.find("table", class_="icons").tbody.select('tr')
    speed_type = re.match(r"/images/units-m-(.*)\.[a-z]{3}", combat_symbols[0].td.img['src']).group(1)
    attack_type = re.match(r"/images/units-a-(.*)\.[a-z]{3}", combat_symbols[1].td.img['src']).group(1)
    defense_type = re.match(r"/images/units-d-(.*)\.[a-z]{3}", combat_symbols[2].td.img['src']).group(1)
    damage_type = re.match(r"/images/units-g-(.*)\.[a-z]{3}", combat_symbols[3].td.img['src']).group(1)

    # Parse the dial
    dial_size = 0
    dial = []
    for col in soup.find_all("table", class_="power"):
      dial_size += 1
      tags = col.find_all("tr")
      # If it has a title, it's a non-KO click, otherwise skip it.
      if tags[0].td.has_attr('title'):
        row_obj = OrderedDict()
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
          row_obj[types[i] + "_value"] = tag.td.string.strip()
        dial.append(row_obj)

  point_value = soup.find("div", {"style": "float:right;padding-top:3px;"}).string.strip().split(' ')[0]

  # TODO: figure out how to determine the age.
  age = "modern"
  # TODO: figure out how to determine the base size
  dimensions = "1x1"
  # TODO: figure out when dials don't start at 1
  dial_start = "1"
  unit = """
    <unit_id>{}</unit_id>
    <set_id>{}</set_id>
    <collector_number>{}</collector_number>
    <name>{}</name>
    <type>{}</type>
    <point_value>{}</point_value>
    <rarity>{}</rarity>
    <age>{}</age>
    <parent_unit_id>{}</parent_unit_id>
    <real_name>{}</real_name>
    <special_type>{}</special_type>
    <team_abilities>{}</team_abilities>
    <dimensions>{}</dimensions>
    <keywords>{}</keywords>
    <special_powers>{}</special_powers>
    <improved_movement>{}</improved_movement>
    <improved_targeting>{}</improved_targeting>
    <unit_range>{}</unit_range>
    <targets>{}</targets>
    <speed_type>{}</speed_type>
    <attack_type>{}</attack_type>
    <defense_type>{}</defense_type>
    <damage_type>{}</damage_type>
    <dial_start>{}</dial_start>
    <dial_size>{}</dial_size>
    <dial>{}</dial>
""".format(unit_id, set_id, collector_number, name, type, point_value, rarity,
           age, parent_unit_id, real_name, special_type,
           json.dumps(team_abilities), dimensions, json.dumps(keywords),
           json.dumps(special_powers, indent=2), json.dumps(improved_movement),
           json.dumps(improved_targeting), unit_range, targets, speed_type,
           attack_type, defense_type, damage_type, dial_start,
           dial_size, json.dumps(dial, indent=2))
  return unit
  
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

  set_list_path = get_set_list_cache_path(args.set_id)
  if not args.skip_cache and os.path.exists(set_list_path):
    print("Reading set list from cache at " + set_list_path)
    f = open(set_list_path, "r")
    set_list_page = f.read()
    f.close()
  else:
    set_list_page = fetch_set_list_page(args.set_id)

  unit_id_list = parse_set_list_page(set_list_page, args.unit_id_start, int(args.max_units))

  unit_list = "<resultset>\n"
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
      unit_page = fetch_unit_page(args.set_id, unit_id);
    unit = parse_unit_page(args.set_id, unit_page)
    if unit:
      unit_list += "  <row>"
      unit_list += unit
      unit_list += "  </row>\n"
      num_processed += 1
    
  unit_list += "</resultset>"
  filename = "set_%s.xml" % args.set_id
  f = open(filename, "w")
  f.write(unit_list)
  f.close()
  print("Wrote %d units to %s" % (num_processed, filename))

