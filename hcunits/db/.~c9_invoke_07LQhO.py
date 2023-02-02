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
  "hgpc": "Hellfire Gala Premium Collection",
  "xmxssop": "X-Men: X of Swords Storyline Organized Play",
  "xmxs": "X-Men: X of Swords",
  "msdp": "Marvel Studios Disney Plus",
  "wotr": "Avengers: War of the Realms",
  "ffwotr": "Fast Forces: Avengers: War of the Realms",
  "ff2021": "Fantastic Four 2021 Storyline",
  "affe": "Avengers Fantastic Four: Empyre",
  "em": "Eternals Movie",
  "xmrf": "X-Men: Rise and Fall",
  "ffxmrf": "Fast Forces: X-Men: Rise and Fall",
  "ww80": "Wonder Woman 80th Anniversary",
  "ffff": "Fantastic Four: Future Foundation",
  "ffffff": "Fast Forces: Fantastic Four: Future Foundation",
  "dcff": "Deep Cuts: Fantastic Four",
  "hx": "House of X",
  "ffhx": "Fast Forces: House of X",
  "svc": "Spider-Man and Venom: Absolute Carnage",
  "ffsvc": "Fast Forces: Spider-Man and Venom: Absolute Carnage",
  "bgame": "Battlegrounds: Avengers vs. Masters of Evil",
  "f4": "Fantastic Four",
  "fff4": "Fast Forces: Fantastic Four",
}

IMPROVED_MOVEMENT_ABILITIES = {
  "elevated", "hindering", "blocking", "outdoor_blocking", "destroy_blocking", "characters", "move_through"
}

IMPROVED_MOVEMENT_RULES = {
  "This character can move through Blocking terrain. Immediately after movement resolves, destroy all Blocking terrain moved through": "blocking",
  "Hindering": "hindering"
}

IMPROVED_TARGETING_ABILITIES = {
  "elevated", "hindering", "blocking", "destroy_blocking", "characters", "adjacent"
}

IMPROVED_TARGETING_RULES = {
  "This character can make range attacks while adjacent to opposing characters. (May target adjacent or non-adjacent opposing characters.)": "adjacent",
  "Once per range attack, this character can draw a line of fire through one piece of Blocking terrain. Immediately after the attack resolves, destroy that piece of Blocking terrain": "blocking"
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

def clean_string(str):
  # Convert some frequently used UTF-8 chars to ASCII.
  str = str.replace(u"\u2019", "'")
  str = str.replace(u"\u00e2\u0080\u0099", "'")
  str = str.replace(u"\u00e2\u0080\u0093", "-")
  str = str.replace(u"\u00e2\u0080\u015a", "...")
  # Escape special XML characters.
  return escape(str)

# Returns true if the subdial matches the start of the dial.
def is_subdial(dial, subdial):
  if len(dial) < len(subdial):
    return False;

  i = 0
  while i < len(subdial):
    src = dial[i]
    dst = subdial[i]
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

    # This must be set in order to be valid.
    self.type = None

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
    self.collector_number = self.unit_id[len(self.set_id):]

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
    elif rarity == "Rarity: Fast Forces":
      self.rarity = "fast_forces"
    else:
      raise RuntimeError("The unit rarity '%s' for '%s' is currently not supported" % (rarity, self.unit_id))

    figure_rank = re.search(r"figure_rank_(.*)", figure_rank_tag["class"][0]).group(1)
    # The type needs to be determined first because many other values are
    # conditional on it.
    if (figure_rank == "" or
        figure_rank == "rookie" or
        figure_rank == "experienced" or
        figure_rank == "veteran" or
        figure_rank == "unique" or
        figure_rank == "prime" or
        figure_rank == "limited_edition" or
        figure_rank == "special_object" or
        figure_rank == "location_bonus"):
      # Look to see if it's a construct, indicated by a special power.
      is_construct = False
      tag_list = soup.find_all(text=re.compile(r'\s*Special Powers\s*'))
      if len(tag_list) > 0:
        is_construct = tag_list[0].parent.parent.parent.parent.tbody.select('tr')[0].select('td')[1].strong.string.strip() == "CONSTRUCTS:"
      if is_construct:
          self.type = "construct"
      elif soup.find("td", class_="card_special_object"):
        if ((soup.find(text=re.compile(r'.*EFFECT: .*')) or
             soup.find(text=re.compile(r'.*Effect: .*'))) and
             not soup.find(text=re.compile(r".*is not equipment.*"))):
          self.type = "equipment"
        else:
          self.type = "object"
      elif soup.find("td", class_="card_id_card"):
        if soup.find(text=re.compile(r'\s*Mystery Card\s*')):
          self.type = "mystery_card"
        else:
          self.type = "id_card"
      elif soup.find("td", class_="card_tarot_card"):
        if soup.find(text=re.compile(r'\s*Mystery Card\s*')):
          self.type = "mystery_card"
        else:
          self.type = "tarot_card"
      elif soup.find("td", class_="card_location_bonus"):
        print("Skipping location bonuses as they should be tied to a map, when they're supported.")
        return False
      else:
        self.type = "character"
        if figure_rank == "prime" or figure_rank == "unique":
          self.special_type = figure_rank
        elif soup.find_all(text=re.compile(r'\s*STARTING PLOT POINTS:\s*')):
          self.special_type = "title_character"
        has_dial = soup.find("table", class_="units_dial")
        if not has_dial:
          is_team_up = self.name.startswith("Team Up:")
          if is_team_up:
            self.type = "team_up"
          else:
            has_parent = soup.find(text=re.compile(r'\s*Inventory options for this figure are controlled by the main/parent unit.\s*'))
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
    elif self.type == "object" or self.type == "equipment" or self.type == "id_card" or self.type == "mystery_card":
      point_value_tag = soup.find("td", class_="tfoot")
    elif self.type == "team_up" or self.type == "tarot_card":
      point_value_tag = None
    else:
      raise RuntimeError("Don't know how to decode points for unit type (%s)" % unit_id)
  
    # Parse point value.
    if point_value_tag:
      point_value_str = point_value_tag.string.strip()
      if point_value_str and len(point_value_str) > 0:
        point_value = int(point_value_str.split(' ')[0])
        if point_value > 0:
          self.point_values.append(point_value)

    # The set ID is the first non-numeric parts of the unit_id
    if self.type == "character":
      # Parse the real_name field.
      self.real_name = soup.select_one("span[onclick^=showRealName]").string.strip()
  
    # Parse team abilities
    if self.type == "character" or self.type == "bystander" or self.type == "construct":
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
    
    # Parse keywords
    if (self.type == "character" or
        self.type == "bystander" or
        self.type == "equipment" or
        self.type == "id_card" or
        self.type == "mystery_card"):
      tag_list = soup.select("span[onclick^=showByKeywordId]")
      for tag in tag_list:
        self.keywords.append(tag.string.strip())

    # Parse object special powers
    if self.type == "object":
      equip_tag = soup.find("td", class_="card_special_object").parent
      tag_list = equip_tag.next_sibling.next_sibling.find_all("div")
      for tag in tag_list:
        # The attribute list is formed by a single string that needs to be
        # split apart.
        parts = tag.string.strip().split(".")
        description = None
        for part in parts:
          part = part.strip()
          if part == "":
            continue

          if part == "Light Object":
            self.object_type = "light"
          elif part == "Heavy Object":
            self.object_type = "heavy"
          elif part == "Ultra Light Object":
            self.object_type = "ultra_light"
          elif part == "Ultra Heavy Object":
            self.object_type = "ultra_heavy"
          elif part == "Special Object":
            self.object_type = "special"
          elif not description:
            description = part + "."
          else:
            description += " " + part + "."

        if description:
          self.special_powers.append(OrderedDict([
            ("type", "object"),
            ("description", clean_string(description))
          ]))

    # Parse equipment special powers
    if self.type == "equipment":
      equip_tag = soup.find("td", class_="card_special_object").parent
      tag_list = equip_tag.next_sibling.next_sibling.find_all("div")
      if tag_list:
        tag = tag_list[0]
        # Skip the first item in the list if it's the keyword list.
        if tag.strong:
          tag = tag_list[1]

        children = list(tag.children)
        attr_list = []
        if len(children) == 1:
          # The attribute list is formed by a single string that needs to be
          # split apart.
          parts = children[0].string.strip().split(".")
          for part in parts:
            part = part.strip()
            if part == "":
              continue

            if (part.upper() == "INDESTRUCTIBLE" or
                part.startswith("EQUIP: ") or
                part.startswith("UNEQUIP: ") or
                part.endswith("Object")):
              attr_list.append(part)
            elif part.startswith("EFFECT: "):
              attr_list.append(part + ".")
            elif len(attr_list) > 0 and attr_list[-1].startswith("EFFECT: "):
              attr_list[-1] += " " + part + "."
            else:
              print("Skipping unknown object attribute part '%s'" % part)
        else:
          for attr in children:
            # Ignore non-strings.
            if attr.string:
              attr_list.append(attr.strip())

        for attr in attr_list:
          if len(attr) <= 0:
            continue;

          if (attr.upper() == "INDESTRUCTIBLE" or
              attr.startswith("EQUIP: ") or
              attr.startswith("UNEQUIP: ") or
              attr == "Sword Equipment"):
            self.object_keyphrases.append(fix_style(attr))
          elif attr.startswith("Light Object"):
            self.object_type = "light"
          elif attr == "Heavy Object":
            self.object_type = "heavy"
          elif attr == "Ultra Light Object":
            self.object_type = "ultra_light"
          elif attr == "Ultra Heavy Object":
            self.object_type = "ultra_heavy"
          elif attr == "Special Object":
            self.object_type = "special"
          else:
            # Handle equipment special powers, including "EFFECT"
            sp = attr.split(':', 1)
            if len(sp) >= 2:
              sp_name = sp[0]
              sp_description = sp[1].strip()
              self.special_powers.append(OrderedDict([
                ("type", "equipment"),
                ("name", sp_name),
                ("description", clean_string(sp_description))
              ]))
            elif len(self.special_powers) > 0:
              # Append it to the end of the previous description.
              self.special_powers[-1]["description"] += clean_string(" " + attr)
            else:
              print("Skipping unknown object attribute '%s'" % attr)

    # Parse equipment
    if self.type == "id_card" or self.type == "mystery_card":
      equip_tag = soup.find("td", class_="card_id_card")
      if not equip_tag:
        equip_tag = soup.find("td", class_="card_tarot_card")
        
      tag_list = equip_tag.parent.next_sibling.next_sibling.find_all("div")
      if tag_list:
        tag = tag_list[0]
        # Skip the first item in the list if it's the keyword list.
        if tag.strong:
          tag = tag_list[1]

        for name in [r'\CLUE EFFECT: .*\s',
                     r'\sSUSPECT \(\d\)\s',
                     r'\sEVIDENCE \(\d\)\s',
                     r'\sCASE CLOSED \(\d\)\s']:
          name_tag = tag.find(text=re.compile(name))
          if name_tag:
            self.special_powers.append(OrderedDict([
              ("type", "mystery_card"),
              ("name", clean_string(name_tag.strip())),
              ("description", clean_string(name_tag.parent.next_sibling.strip()[2:]))
            ]))

    # Parse tarot cards
    if self.type == "tarot_card":
      equip_tag = soup.find("td", class_="card_tarot_card").parent
      desc_tag = equip_tag.next_sibling.next_sibling.find("div")
      self.special_powers.append(OrderedDict([
        ("type", "tarot_card"),
        ("description", clean_string(desc_tag.string.strip()))
      ]))

    # Parse special powers
    if (self.type == "character" or
        self.type == "team_up" or
        self.type == "bystander" or
        self.type == "equipment" or
        self.type == "construct"):
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
          elif sp_type_str.startswith("a-") or sp_type_str.startswith("vehicle"):
            sp_type = "attack"
          elif sp_type_str.startswith("d-"):
            sp_type = "defense"
          elif sp_type_str.startswith("g-"):
            sp_type = "damage"
          elif sp_type_str == "epic" and self.special_type == "title_character":
            sp_type = "title_trait"
          else:
            raise RuntimeError("The special power type '%s' for '%s' is currently not supported" % (sp_type_str, unit_id))

          if td_tags[1].strong:
            sp_name = td_tags[1].strong.string.strip().rstrip(':')
            sp_description = td_tags[1].contents[2].strip()
          else:
            sp_name = None
            sp_description = td_tags[1].string.strip()

          # Skip the special power that describes a construct
          if self.type == "construct" and sp_name == "CONSTRUCTS":
            continue
          
          if sp_type == "improved":
            if sp_name == "MOVEMENT":
              # First try to parse when the abilities are listed as rules.
              parts = sp_description.split(".")
              while len(parts) > 0:
                tail = parts.pop()
                if len(tail) > 0:
                  if tail.strip() in IMPROVED_MOVEMENT_RULES:
                    # If a match was found, append the ID and clear out sp_description
                    # to indicate that it's a rules list.
                    self.improved_movement.append(IMPROVED_MOVEMENT_RULES[tail.strip()])
                    sp_description = None
                  elif len(parts) > 0:
                    # Couldn't find a match, so combine the last two strings and try again.
                    parts[-1] = parts[-1] + "." + tail
                  elif not sp_description:
                    print("Skipping unknown improvement movement ability rule: '%s'" % tail)

              if sp_description:
                for value in sp_description.split(", "):
                  value = fix_style(value.strip())
                  if value in IMPROVED_MOVEMENT_ABILITIES:
                    self.improved_movement.append(value)
                  else:
                    print("Skipping unknown improvement movement ability: '%s'" % value)
            elif sp_name == "TARGETING":
              # First try to parse when the abilities are listed as rules.
              parts = sp_description.split(".")
              while len(parts) > 0:
                tail = parts.pop()
                if len(tail) > 0:
                  if tail.strip() in IMPROVED_TARGETING_RULES:
                    # If a match was found, append the ID and clear out sp_description
                    # to indicate that it's a rules list.
                    self.improved_movement.append(IMPROVED_TARGETING_RULES[tail.strip()])
                    sp_description = None
                  elif len(parts) > 0:
                    # Couldn't find a match, so combine the last two strings and try again.
                    parts[-1] = parts[-1] + "." + tail
                  elif not sp_description:
                    print("Skipping unknown improvement targeting ability rule: '%s'" % tail)

              if sp_description:
                for value in sp_description.split(", "):
                  value = fix_style(value.strip())
                  if value in IMPROVED_TARGETING_ABILITIES:
                    self.improved_targeting.append(value)
                  else:
                    print("Skipping unknown improvement targeting ability: '%s'" % value)
          else:
            sp = OrderedDict([("type", sp_type)])
            if sp_name:
              sp["name"] = clean_string(sp_name)
            sp["description"] = clean_string(sp_description)

            # Handle special trait types, like costed, rally, or plot points.
            if sp_type == "trait" and sp_name:
              # Handle title character traits, like plus and minus plot points.
              if self.special_type == "title_character":
                match_obj = re.search(r"^\(([-\+][X\d])\) (.*)", sp_name)
                if match_obj:
                  if match_obj.group(1)[0] == "+":
                    prefix = "plus"
                  else:
                    prefix = "minus"
                  sp["type"] = prefix + "_plot_points"
                  sp["name"] = clean_string(match_obj.group(2))
                  if match_obj.group(1)[1] == "X":
                    sp["plot_points"] = "X"
                  else:
                    sp["plot_points"] = int(match_obj.group(1))

              # Determine if it's a costed trait and if so, what it's point value is.
              match_obj = re.search(r"^\(\+(\d*) POINTS\) (.+)", sp_name)
              # Try the alternative format. Note: this can conflict with the
              # style of title character plot points, so ignore it in that case.
              if not match_obj and self.special_type != "title_character":
                match_obj = re.search(r"^\(\+(\d*)\) (.+)", sp_name)
              if match_obj:
                sp["type"] = "costed_trait"
                sp["name"] = clean_string(match_obj.group(2))
                sp["point_value"] = int(match_obj.group(1))

              # Check to see if it's a rally trait.
              match_obj = re.search(r"^RALLY \((\d+)\)", sp_name)
              if match_obj:
                sp["type"] = "rally_trait"
                sp["name"] = "RALLY"
                rally_die = int(match_obj.group(1))
                if td_tags[1].i:
                  sp["description"] = clean_string(td_tags[1].contents[4].strip()[2:])
                  sp["rally_type"] = td_tags[1].i.string.strip()[:-13].lower()
                else:
                  match_obj = re.search(r"([a-zA-Z]*) Attack Rolls\. (.*)", td_tags[1].contents[2].strip())
                  if not match_obj:
                    match_obj = re.search(r"([a-zA-Z]*) attack rolls\. (.*)", td_tags[1].contents[2].strip())
                  if not match_obj:
                    raise RuntimeError("Cannot parse rally trait")
                  sp["description"] = clean_string(match_obj.group(2))
                  sp["rally_type"] = match_obj.group(1).lower()
                sp["rally_die"] = rally_die
                # Clean description string to remove rally rules
                sp["description"] = sp["description"].replace("RALLY: Once per roll for each die in a finalized attack roll and for all characters with a matching RALLY die and trait color printed under their trait star, after resolutions you may choose a friendly character to gain a matching RALLY die. RALLY trait colors specify which attack type they can gain RALLY dies from. BLUE = Friendly Attack Rolls. RED = Opposing Attack Rolls. GREEN = All Attack Rolls.", "")
                sp["description"] = sp["description"].replace(" When a character gains a RALLY die, place a die with the matching result on their card.", "")
                sp["description"] = sp["description"].replace(" ()", "")
    
            # Avoid adding duplicates.
            dupe = [x for x in self.special_powers if x["name"] == sp["name"]]
            if dupe:
              print("Skipping duplicate special power '%s' for '%s'" % (sp["name"], self.unit_id))
            else:
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
        exptected_dial_size = 12
      elif self.dimensions == "2x2":
        exptected_dial_size = 26
      elif self.dimensions == "2x4" or self.dimensions == "3x6":
        exptected_dial_size = 20
      else:
        raise RuntimeError("Unknown dimensions for '%s': found '%s'" % (self.unit_id, self.dimensions))
      if self.dial_size != exptected_dial_size:
        print("Warning: for unit '%s', expected a dial size of %d, but got %d" % (self.unit_id, exptected_dial_size, self.dial_size))
        self.dial_size = exptected_dial_size
      if len(self.dial) > exptected_dial_size:
        print("Warning: for unit '%s', expected a max dial size of %s, but got %d" % (self.unit_id, exptected_dial_size, len(self.dial)))
        self.dial = self.dial[:self.dial_size]
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
      # "Swap" the units, such that 'self' is now the the higher point unit.
      self.__dict__, src_unit.__dict__ = src_unit.__dict__, self.__dict__
      self.unit_id = src_unit.unit_id
      self.collector_number = src_unit.collector_number

    # Starting at the end of the dial, move backwards until you find a section
    # where the two dails match.
    starting_line = len(self.dial) - len(src_unit.dial)
    is_match = False
    while starting_line >= 0 and not is_match:
      if is_subdial(self.dial[starting_line:], src_unit.dial):
        is_match = True
      else:
        starting_line -= 1

    if not is_match:
    # Hack to get ffwotr dials to be merged.
      if self.set_id == "ffwotr":
        starting_line = len(self.dial)
        click_num = 6
        for click in src_unit.dial:
          click["click_number"] = click_num
          self.dial.append(click)
          click_num += 1
      else:
        print("Failed to merge '%s' and '%s': dial mismatch" % (self.unit_id, unit.unit_id))
        return False
      
    # This is a case where the dial grows longer when you pay more points, with
    # the "starting line" being at the end of the shorter dial.
    if starting_line == 0:
      starting_line = len(src_unit.dial)

    # Merge the units by adding a new point value (in descending sorted order) and starting line.
    pos = 0
    while pos < len(self.point_values) and self.point_values[pos] > src_unit.point_values[0]:
      pos += 1;
    self.point_values.insert(pos, src_unit.point_values[0])

    if starting_line < len(self.dial):
      self.dial[starting_line]["starting_line"] = True

    # Add any missing special powers.
    for src_sp in src_unit.special_powers:
      found = False
      for dst_sp in self.special_powers:
        if src_sp["name"] == dst_sp["name"]:
          found = True
          break;
      if not found:
        # Insert Traits at the front, otherwise at the end.
        if src_sp["type"].find("trait") != -1:
          self.special_powers.insert(0, src_sp)
        else:  
          self.special_powers.append(src_sp)

    # Return true to indicate a successful merge.
    return True;

  def output_xml(self):
    xml = u"""
    <unit_id>{}</unit_id>
    <set_id>{}</set_id>
    <collector_number>{}</collector_number>
    <name>{}</name>
    <type>{}</type>
    <age>{}</age>""".format(self.unit_id, self.set_id, self.collector_number, clean_string(self.name), self.type, self.age)
    if self.rarity:
      xml += "\n    <rarity>%s</rarity>" % self.rarity
    if self.real_name:
      xml += "\n    <real_name>%s</real_name>" % clean_string(self.real_name)
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
    self.driver = None
    self.set_id = set_id
    self.skip_cache = skip_cache
    
  def init_driver(self):
    if not self.driver:
      options = Options()
      options.add_argument("--headless")
      self.driver = webdriver.Chrome(options=options)

  def close(self):
    if self.driver:
      self.driver.close()
      self.driver = None

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
      self.init_driver()
      self.driver.get('https://www.hcrealms.com/forum/units/units_quicksets.php?q=' + set_name)
      soup = BeautifulSoup(self.driver.page_source, 'html.parser')
      set_list_page = soup.prettify(formatter=lambda s: s.replace(u'\xa0', ' ')).encode('utf-8')
  
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
      self.init_driver()
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
  parser.add_argument("--unit_id", help="The single unit ID to handle")
  parser.add_argument("--unit_id_start", help="The unit ID from which to start")
  parser.add_argument("--unit_id_stop", help="The unit ID from which to stop")
  parser.add_argument("--skip_cache", help="If set, will avoid using the locally cached versions when available", action='store_true', default=False)
  parser.add_argument("--max_units", help="The maximum number of units parsed in a single pass", default=1000)
  args = parser.parse_args()

  if args.unit_id:
    args.unit_id_start = args.unit_id
    args.max_units = 1

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
        # If the unit ID ends in 'r', 'e', or 'v', check for other units with
        # similar same unit ID and if so, merge point values.
        if unit.unit_id.endswith(('r', 'e', 'v', 'x')):
          main_unit = next((u for u in units if u.unit_id == unit.unit_id[:-1] and u.type == unit.type), None)
          if (main_unit):
            # Try to merge the units together and mark the current unit as invalid
            # so that it's not appending to the list below.
            if main_unit.merge_point_values(unit):
              unit = None

        elif unit.type == "team_up":
          # Find the associated unit and create a new unit from that by copying
          # in the team-up special powers and updating the unit_id.
          associated_unit = None
          associated_unit_id = unit_id[:unit_id.rfind(".")]
          for u in units:
            if u.unit_id == associated_unit_id:
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
  f.write(output_xml.encode('utf-8'))
  f.close()
  print("Wrote %d units to %s" % (num_processed, filename))

