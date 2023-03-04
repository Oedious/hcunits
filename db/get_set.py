#!/usr/bin/env python
import argparse
import bisect
import copy
import functools
import json
import os
import os.path
import re
import traceback
import xmltodict
from bs4 import BeautifulSoup, Tag
from collections import OrderedDict
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from xml.sax.saxutils import escape

SET_MAP = {
  "btu": {
    "name": "Batman Team-Up",
  },
  "av4e": {
    "name": "Avengers Forever",
  },
  "hgpc": {
    "name": "Hellfire Gala Premium Collection",
  },
  "xmxssop": {
    "name": "X-Men: X of Swords Storyline Organized Play",
  },
  "xmxs": {
    "name": "X-Men: X of Swords",
  },
  "msdp": {
    "name": "Marvel Studios Disney Plus",
  },
  "wotr": {
    "name": "Avengers: War of the Realms",
  },
  "ffwotr": {
    "name": "Fast Forces: Avengers: War of the Realms",
  },
  "ff2021": {
    "name": "Fantastic Four 2021 Storyline",
  },
  "affe": {
    "name": "Avengers Fantastic Four: Empyre",
  },
  "em": {
    "name": "Eternals Movie",
  },
  "xmrf": {
    "name": "X-Men: Rise and Fall",
  },
  "ffxmrf": {
    "name": "Fast Forces: X-Men: Rise and Fall",
  },
  "ww80": {
    "name": "Wonder Woman 80th Anniversary",
  },
  "ffff": {
    "name": "Fantastic Four: Future Foundation",
  },
  "ffffff": {
    "name": "Fast Forces: Fantastic Four: Future Foundation",
  },
  "dcff": {
    "name": "Deep Cuts: Fantastic Four",
  },
  "hx": {
    "name": "House of X",
  },
  "ffhx": {
    "name": "Fast Forces: House of X",
  },
  "svc": {
    "name": "Spider-Man and Venom: Absolute Carnage",
  },
  "ffsvc": {
    "name": "Fast Forces: Spider-Man and Venom: Absolute Carnage",
  },
  "bgame": {
    "name": "Battlegrounds: Avengers vs. Masters of Evil",
  },
  "f4": {
    "name": "Fantastic Four",
  },
  "fff4": {
    "name": "Fast Forces: Fantastic Four",
  },
  "wkm20": {
    "name": "WizKids Marvel",
    "ranges": [
      ("wkM-G001a", "wkM-G001b-100"),
      # The Elemental Converter is missing, so it's added in the patch.
      # Skip the Herald dial until we can correctly handle that dial type.
      ("wkMP20-001a", "wkMP20-B002"),
    ]
  },
  "wkm21": {
    "name": "WizKids Marvel",
    "ranges": [
      ("wkF21-001", "wkF21-001"),
      ("wkMP21-001", "wkMP21-008v"),
    ]
  },
  "wkd20": {
    "name": "WizKids DC",
    "ranges": [
      ("wkDP20-001", "wkDP20-s005b"),
    ]
  },
  "wkd21": {
    "name": "WizKids DC",
    "ranges": [
      ("wkDP21-001", "wkDP21-005v"),
    ]
  },
  "jlu": {
    "name": "Justice League Unlimited",
  },
  "bwm": {
    "name": "Black Widow Movie",
  },
  "ffcc": {
    "name": "Fantastic Four: Cosmic Clash",
  },
  "caav": {
    "name": "Captain America and the Avengers",
  },
  "ffcaav": {
    "name": "Fast Forces: Captain America and the Avengers",
  },
  "dcxm": {
    "name": "Deep Cuts: X-Men Primed",
  },
  "orvl": {
    "name": "The Orville Starter",
  },
  "trekbg": {
    "name": "Star Trek HeroClix Away Team: To Boldly Go",
  },
  "xdps": {
    "name": "X-Men the Animated Series: The Dark Phoenix Saga",
  },
  "ffxdps": {
    "name": "Fast Forces: X-Men the Animated Series: The Dark Phoenix Saga",
  },
  "trekrf": {
    "name": "Star Trek HeroClix Away Team: Resistance is Futile",
  },
  "fftng": {
    "name": "Fast Forces: Star Trek HeroClix Away Team: Resistance is Futile",
  },
  "wcr": {
    "name": "Wolverine v Cyclops: Xmen Regenesis",
  },
  "abpi": {
    "name": "Avengers Black Panther and the Illuminati",
  },
  "ffabpi": {
    "name": "Fast Forces: Avengers Black Panther and the Illuminati",
  },
  "re": {
    "name": "Rebirth",
  },
  "ffre": {
    "name": "Fast Forces: Rebirth",
  },
  "cmm": {
    "name": "Captain Marvel Movie Gravity Feed",
  },
  "eax": {
    "name": "Earth X",
  },
  "ffeax": {
    "name": "Fast Forces: Earth X",
  },
  "swb": {
    "name": "Secret Wars: Battleworld",
  },
  "ffswb": {
    "name": "Fast Forces: Secret Wars: Battleworld",
  },
  "btas": {
    "name": "Batman: The Animated Series",
  },
  "tmnt4": {
    "name": "Teenage Mutant Ninja Turtles: Unplugged",
  },
  "fftmnt4": {
    "name": "Fast Forces: Teenage Mutant Ninja Turtles: Unplugged",
  },
  "ai": {
    "name": "Avengers Infinity",
  },
  "ffai": {
    "name": "Fast Forces: Avengers Infinity",
  },
  "xxs": {
    "name": "X-Men Xavier's School",
  },
  "ffxxs": {
    "name": "Fast Forces: X-Men Xavier's School",
  },
  "trekos": {
    "name": "Star Trek HeroClix Away Team: The Original Series",
  },
  "hq": {
    "name": "Harley Quinn and the Gotham Girls",
  },
  "ffhq": {
    "name": "Fast Forces: Harley Quinn and the Gotham Girls",
  },
  "trm": {
    "name": "Thor: Ragnarok (Movie)",
  },
  "tmt": {
    "name": "The Mighty Thor",
  },
  "und": {
    "name": "Undead",
  },
  "ew": {
    "name": "15th Anniversary Elseworlds",
  },
  "wi": {
    "name": "15th Anniversary What If?",
  },
  "ww": {
    "name": "Wonder Woman",
  },
  "adw": {
    "name": "Avengers/Defenders War",
  },
  "ffadw": {
    "name": "Fast Forces: Avengers/Defenders War",
  },
  "gotg2m": {
    "name": "Guardians of the Galaxy 2 Movie",
  },
  "dxf": {
    "name": "Deadpool and X-Force",
  },
  "ffdxf": {
    "name": "Fast Forces: Deadpool and X-Force",
  },
  "tmnt3": {
    "name": "Teenage Mutant Ninja Turtles: Shredder's Return",
  },
  "fftmnt3": {
    "name": "Fast Forces: Teenage Mutant Ninja Turtles: Shredder's Return",
  },
  "jw": {
    "name": "The Joker's Wild!",
  },
  "ffjw": {
    "name": "Fast Forces: Batman and His Greatest Foes",
  },
  "tmnt2": {
    "name": "Teenage Mutant Ninja Turtles: Heroes in a Half Shell",
  },
  "fftmnt2": {
    "name": "Fast Forces: Teenage Mutant Ninja Turtles: Heroes in a Half Shell",
  },
  "sfsm": {
    "name": "Superior Foes of Spider-Man",
  },
  "ffsfsm": {
    "name": "Fast Forces: Spider-Man and His Greatest Foes",
  },
  "cwsop": {
    "name": "Civil War: Storyline Organized Play",
  },
  "uxm": {
    "name": "Uncanny X-Men",
  },
  "ffuxm": {
    "name": "Fast Forces: Uncanny X-Men",
  },
  "tmnt": {
    "name": "Teenage Mutant Ninja Turtles",
  },
  "cacw": {
    "name": "Captain America: Civil War",
  },
  "cacws": {
    "name": "Captain America: Civil War Starter",
  },
  "bvs": {
    "name": "Batman v Superman: Dawn of Justice",
  },
  "ffbvs": {
    "name": "Fast Forces: Batman v Superman: Dawn of Justice",
  },
}

POWERS = {
  "Flurry": "flurry",
  "Leap/Climb": "leap_climb",
  "Phasing/Teleport": "phasing_teleport",
  "Earthbound/Neutralized": "earthbound_neutralized",
  "Charge": "charge",
  "Mind Control": "mind_control",
  "Plasticity": "plasticity",
  "Force Blast": "force_blast",
  "Sidestep": "sidestep",
  "Hypersonic Speed": "hypersonic_speed",
  "Stealth": "stealth",
  "Running Shot": "running_shot",
  "Blades/Claws/Fangs": "blades_claws_fangs",
  "Energy Explosion": "energy_explosion",
  "Pulse Wave": "pulse_wave",
  "Quake": "quake",
  "Super Strength": "super_strength",
  "Incapacitate": "incapacitate",
  "Penetrating/Psychic Blast": "penetrating_psychic_blast",
  "Smoke Cloud": "smoke_cloud",
  "Precision Strike": "precision_strike",
  "Poison": "poison",
  "Steal Energy": "steal_energy",
  "Telekinesis": "telekinesis",
  "Super Senses": "super_senses",
  "Toughness": "toughness",
  "Defend": "defend",
  "Combat Reflexes": "combat_reflexes",
  "Energy Shield/Deflection": "energy_shield_deflection",
  "Barrier": "barrier",
  "Mastermind": "mastermind",
  "Willpower": "willpower",
  "Invincible": "invincible",
  "Impervious": "impervious",
  "Regeneration": "regeneration",
  "Invulnerability": "invulnerability",
  "Ranged Combat Expert": "ranged_combat_expert",
  "Battle Fury": "battle_fury",
  "Support": "support",
  "Exploit Weakness": "exploit_weakness",
  "Enhancement": "enhancement",
  "Probability Control": "probability_control",
  "Shape Change": "shape_change",
  "Close Combat Expert": "close_combat_expert",
  "Empower": "empower",
  "Perplex": "perplex",
  "Outwit": "outwit",
  "Leadership": "leadership",
  "STOP": "stop",
}

POWER_VALUES = [
  "flurry",
  "leap_climb",
  "phasing_teleport",
  "earthbound_neutralized",
  "charge",
  "mind_control",
  "plasticity",
  "force_blast",
  "sidestep",
  "hypersonic_speed",
  "stealth",
  "running_shot",
  "blades_claws_fangs",
  "energy_explosion",
  "pulse_wave",
  "quake",
  "super_strength",
  "incapacitate",
  "penetrating_psychic_blast",
  "smoke_cloud",
  "precision_strike",
  "poison",
  "steal_energy",
  "telekinesis",
  "super_senses",
  "toughness",
  "defend",
  "combat_reflexes",
  "energy_shield_deflection",
  "barrier",
  "mastermind",
  "willpower",
  "invincible",
  "impervious",
  "regeneration",
  "invulnerability",
  "ranged_combat_expert",
  "battle_fury",
  "support",
  "exploit_weakness",
  "enhancement",
  "probability_control",
  "shape_change",
  "close_combat_expert",
  "empower",
  "perplex",
  "outwit",
  "leadership",
  "stop",
]

TYPE_VALUES = [
  'character', 'object', 'equipment', 'map', 'bystander', 'tarot_card', 'mystery_card', 'id_card', 'comic_panel'
]

RARITY_VALUES = [
  'common', 'uncommon', 'rare', 'super_rare', 'chase', 'ultra_chase', 'limited_edition', 'starter', 'super_booster'
]

PROPERTY_VALUES = [
  "prime", "unique", "title", "team_up", "legacy", "captain", "sidekick", "ally", "secret_identity"
]

SPECIAL_POWER_TYPE_VALUES = [
  "trait", "costed_trait", "rally_trait", "title_trait", "plus_plot_points", "minus_plot_points", "speed", "attack", "defense", "damage", "location", "consolation", "other_id", "inspiration"
]

RALLY_TYPE_VALUES = [
  "friendly", "opposing", "all"
]

IMPROVED_ABILITIES = {
  "movement": {
    "attr_name": "improved_movement",
    "types": {
      "elevated": "elevated",
      "elevated terrain": "elevated",
      "ignores elevated terrain": "elevated",
      "hindering": "hindering",
      "hindering terrain": "hindering",
      "ignores hindering": "hindering",
      "ignores hindering terrain": "hindering",
      "blocking": "blocking",
      "blocking terrain": "blocking",
      "ignores blocking": "blocking",
      "ignores blocking terrain": "blocking",
      "outdoor blocking": "outdoor_blocking",
      "ignores outdoor blocking terrain": "outdoor_blocking",
      "ignores blocking terrain (outdoor)": "outdoor_blocking",
      "destroy blocking": "destroy_blocking",
      "ignores and destroys blocking terrain": "destroy_blocking",
      "ignores blocking and destroys blocking terrain as the character moves through it": "destroy_blocking",
      "ignores blocking terrain and destroys blocking terrain as the character moves through it": "destroy_blocking",
      "improved movement: ignores blocking terrain and destroys blocking terrain as the character moves through it": "destroy_blocking",
      "this character can move through blocking terrain. immediately after movement resolves, destroy all blocking terrain moved through": "destroy_blocking",
      "characters": "characters",
      "ignores characters": "characters",
      "move through": "move_through",
      "this character can move through squares adjacent to or occupied by opposing characters without stopping, and automatically breaks away, even if adjacent to a character than can use plasticity": "move_through",
      "this character can move through squares adjacent to or occupied by opposing characters without stopping, and automatically breaks away, even if adjacent to a character that can use plasticity": "move_through",
      "water": "water",
    },
  },
  "targeting": {
    "attr_name": "improved_targeting",
    "types": {
      "elevated": "elevated",
      "ignores elevated terrain": "elevated",
      "hindering": "hindering",
      "hindering terrain": "hindering",
      "ignores hindering": "hindering",
      "ignores hindering terrain": "hindering",
      "improved targeting: ignores hindering terrain": "hindering",
      "imrpoved targeting: ignores hindering terrain": "hindering",
      "blocking": "blocking",
      "destroy blocking": "destroy_blocking",
      "ignores blocking terrain. when a ranged combat attack resolves, any blocking terrain along its line of fire to the target is destroyed": "destroy_blocking",
      "once per range attack, this character can draw a line of fire through one piece of blocking terrain. immediately after the attack resolves, destroy that piece of blocking terrain": "destroy_blocking",
      "once per range attack, this character can draw a line through one piece of blocking terrain. immediately after the attack resolves, destroy that piece of blocking terrain": "destroy_blocking",
      "characters": "characters",
      "ignores characters": "characters",
      "lines of fire drawn by this character are not blocked by characters": "characters",
      "adjacent": "adjacent",
      "may make a ranged combat attack targeting adjacent opposing characters": "adjacent",
      "may make a ranged combat attack even when adjacent to an opposing character": "adjacent",
      "this character can make range attacks while adjacent to opposing characters": "adjacent",
      "this character can make range attacks while adjacent to opposing characters. (may target adjacent or non-adjacent opposing characters.)": "adjacent",
      "may make a ranged combat attack against any opposing character within range and line of fire, even if that character is in an adjacent square": "adjacent",
      "water": "water",
    },
  }
}

IMPROVED_MOVEMENT_VALUES = [
  "elevated", "hindering", "blocking", "outdoor_blocking", "destroy_blocking", "characters", "move_through", "water"
]

IMPROVED_TARGETING_VALUES = [
  "elevated", "hindering", "blocking", "destroy_blocking", "characters", "adjacent", "water"
]

OBJECT_TYPE_VALUES = [
  'standard', 'special', 'equipment', 'plastic_man'
]

OBJECT_SIZE_VALUES = [
  'light', 'heavy', 'ultra_light', 'ultra_heavy', 'immobile'
]

OBJECT_KEYPHRASE_VALUES = [
  "indestructible", "equip_any", "equip_friendly", "unequip_ko", "unequip_drop", "sword_equipment", 
]

BYSTANDER_TYPE_VALUES = [
  'standard', 'construct'
]

SPEED_TYPE_VALUES = [
  'boot', 'wing', 'dolphin', 'transport_boot', 'transport_wing', 'transport_dolphin'
]

ATTACK_TYPE_VALUES = [
  'fist', 'autonomous', 'sharpshooter', 'duo', 'team'
]

DEFENSE_TYPE_VALUES = [
  'shield', 'indomitable', 'vehicle'
]

DAMAGE_TYPE_VALUES = [
  'starburst', 'giant', 'colossal', 'tiny'
]

TEAM_ABILITY_CORRECTIONS = {
  "Wonder Woman": "wonder_woman_ally",
  "Romulan Star Empire (Away Team)": "romulan_star_empire",
  "Romulan Star Empire (Aw": "romulan_star_empire",
  "Klingon Empire (Away Team)": "klingon_empire",
  "United Federation of Planets": "united_federation",
  "Borg (Away Team)": "borg",
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
  str = str.replace(u"\ufffd", "'")
  str = str.replace(u"\u2026", "...")
  str = str.replace(u"\u00e2\u0080\u0099", "'")
  str = str.replace(u"\u010f\u017c\u02dd", "'")
  str = str.replace(u"\u00e2\u0080\u0093", "-")
  str = str.replace(u"\u00e2\u0080\u0094", "-")
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
  def __init__(self, **kwargs):
    # These must be set in order to be valid.
    self.unit_id = kwargs.get("unit_id", None)
    self.set_id = kwargs.get("set_id", None)
    self.collector_number = kwargs.get("collector_number", None)
    self.name = kwargs.get("name", None)
    self.type = kwargs.get("type", None)
    # TODO: figure out how to determine the age.
    # self.age = kwargs.get("age", "modern")

    # These fields are conditionally used depending on the unit type.
    self.rarity = kwargs.get("rarity", None)
    self.real_name = kwargs.get("real_name", None)
    self.dimensions = kwargs.get("dimensions", None)
    self.object_type = kwargs.get("object_type", None)
    self.object_size = kwargs.get("object_size", None)
    self.bystander_type = kwargs.get("bystander_type", None)
    self.map_url = kwargs.get("map_url", None)
    self.unit_range = kwargs.get("unit_range", -1)
    self.targets = kwargs.get("targets", -1)
    self.passengers = kwargs.get("passengers", -1)
    self.speed_type = kwargs.get("speed_type", None)
    self.attack_type = kwargs.get("attack_type", None)
    self.defense_type = kwargs.get("defense_type", None)
    self.damage_type = kwargs.get("damage_type", None)
    self.dial_size = kwargs.get("dial_size", None)

    # These fields are stored as JSON and must always exist, even if empty.
    self.point_values = kwargs.get("point_values", [])
    self.properties = kwargs.get("properties", [])
    self.team_abilities = kwargs.get("team_abilities", [])
    self.keywords = kwargs.get("keywords", [])
    self.special_powers = kwargs.get("special_powers", [])
    self.improved_movement = kwargs.get("improved_movement", [])
    self.improved_targeting = kwargs.get("improved_targeting", [])
    self.object_keyphrases = kwargs.get("object_keyphrases", [])
    self.dial = kwargs.get("dial", [])

  def __eq__(self, other):
    return self.unit_id == other.unit_id

  # Override less-than operator to get a particular sort order:
  # Maps at the end, otherwise sort by unit_id
  def __lt__(self, other):
    if self.type == "map" and other.type != "map":
      return False
    if self.type != "map" and other.type == "map":
      return True
    return self.unit_id < other.unit_id
    
  def parse_unit_page(self, unit_page):
    soup = BeautifulSoup(unit_page, 'html.parser')

    # Extract the unit ID and the name from the first table.
    unit_id_and_name = soup.find("td", class_="tcat").strong.string.strip().split(' ')
    self.unit_id = unit_id_and_name[0]
    self.name = " ".join(unit_id_and_name[1:]).strip()
    
    for prefix in [self.set_id, "wkM-", "wk"]:
      if self.unit_id.startswith(prefix):
        self.collector_number = self.unit_id[len(prefix):]

    if not self.collector_number:
      raise RuntimeError("Could not find a collector number for '%s'" % self.unit_id)

    # Determine the rarity and special type
    figure_rank_tag = soup.select_one("td[class^=figure_rank_]")
    rarity = figure_rank_tag.strong.string.strip()
    if (rarity == "Rarity: Common" or
        rarity == "Rarity: Starter Set" or
        rarity == "Rarity: Fast Forces"):
      self.rarity = "common"
    elif rarity == "Rarity: Uncommon":
      self.rarity = "uncommon"
    elif (rarity == "Rarity: Rare" or
          rarity == "Rarity: Mass Market Exclusive"):
      self.rarity = "rare"
    elif rarity == "Rarity: Super Rare":
      self.rarity = "super_rare"
    elif (rarity == "Rarity: Chase" or
          rarity == "Rarity: Free Comic Book Day Exclusive" or
          rarity == "Rarity: Limited Edition" or
          rarity == "Rarity: Brick" or
          rarity == "Rarity: Super Booster" or
          rarity == "Rarity: Mass Market Exclusive Chase"):
      self.rarity = "chase"
    elif rarity == "Rarity: Ultra Chase":
      self.rarity = "ultra_chase"
    elif rarity == "Rarity:":
      pass
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
        figure_rank == "location_bonus" or
        figure_rank == "alter_ego"):
      # Look to see if it's a construct, indicated by a special power.
      is_construct = False
      tag_list = soup.find_all(text=re.compile(r'\s*Special Powers\s*'))
      if len(tag_list) > 0:
        val = tag_list[0].parent.parent.parent.parent.tbody.select('tr')[0].select('td')[1].strong
        is_construct = (val and val.string.strip() == "CONSTRUCTS:")
      if is_construct:
        self.type = "bystander"
        self.bystander_type = "construct"
      elif (soup.find("td", class_="card_special_object") or
            soup.find("td", class_="card_light_object")):
        if ((soup.find(text=re.compile(r'.*EFFECT:.*')) or
             # Yes - eaxs003 spelled this "EFECT"...
             soup.find(text=re.compile(r'.*EFECT:.*')) or
             soup.find(text=re.compile(r'.*Effect:.*'))) and
             not soup.find(text=re.compile(r".*is not equipment.*"))):
          self.type = "equipment"
          self.object_type = "equipment"
        else:
          self.type = "object"
          self.object_type = "standard"
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
      elif soup.find("td", class_="card_ata"):
        if soup.find(text=re.compile(r'\s*Mystery Card\s*')):
          self.type = "mystery_card"
      elif soup.find("td", class_="card_location_bonus"):
        print("Skipping location bonuses for '%s' - %s" % (self.unit_id, self.name))
        return False
      else:
        self.type = "character"
        if figure_rank == "prime" or figure_rank == "unique":
          self.properties.append(figure_rank)
        elif soup.find_all(text=re.compile(r'\s*STARTING PLOT POINTS:\s*')):
          self.properties.append("title")
        has_dial = soup.find("table", class_="units_dial")
        if not has_dial:
          is_team_up = (self.name.startswith("Team Up:") or
                        self.name.startswith("Team-Up:") or
                        self.name.startswith("Themed Team Up:") or
                        self.name.startswith("Episode Team Up:"))
          if is_team_up:
            self.type = "team_up"
          elif self.unit_id.endswith("fx"):
            self.type = "comic_panel"
          else:
            has_parent = soup.find(text=re.compile(r'\s*Inventory options for this figure are controlled by the main/parent unit.\s*'))
            if has_parent:
              # We just skip these as they'll be accounted for in the unit itself.
              print("Skipping costed trait %s" % (self.unit_id))
            else:
              # It's an unknown type - skip it for now
              print("Skipping unknown unit type %s with figure_rank='%s'" % (self.unit_id, figure_rank))
            return False
    elif figure_rank == "bystander":
      self.type = "bystander"
      self.bystander_type = "standard"

    if not self.type:
      raise RuntimeError("The unit type (%s) for '%s' is currently not supported" % (figure_rank, self.unit_id))

    # Correct bad equipment unit names.
    if self.type == "equipment":
      if self.collector_number.startswith("S"):
        self.collector_number = self.collector_number.replace("S", "s", 1)
        self.unit_id = self.set_id + self.collector_number

    if self.type == "character" or self.type == "bystander":
      point_value_tag = soup.find("div", {"style": "float:right;padding-top:3px;"})
    elif self.type == "object" or self.type == "equipment" or self.type == "id_card" or self.type == "mystery_card":
      point_value_tag = soup.find("td", class_="tfoot")
    elif self.type == "team_up" or self.type == "tarot_card" or self.type == "comic_panel":
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
      real_name = soup.select_one("span[onclick^=showRealName]")
      if real_name:
        self.real_name = real_name.string.strip()
      else:
        print("Warning: could not find a real name for %s" % self.unit_id)
  
    # Parse team abilities
    if self.type == "character" or self.type == "bystander":
      tag_list = soup.select("span[onclick^=showQuickSearch]")
      for tag in tag_list:
        match_obj = re.search(r"showQuickSearch\('(.*)','team_ability'\)", tag['onclick'])
        if match_obj:
          team_ability = match_obj.group(1).strip();
          if team_ability == "No Affiliation":
            continue
          # Fix mis-named team abilities.
          corrected_ta = TEAM_ABILITY_CORRECTIONS.get(team_ability, None)
          if corrected_ta:
            team_ability = corrected_ta
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
      object_tag = soup.find("td", class_="card_special_object")
      if not object_tag:
        object_tag = soup.find("td", class_="card_light_object")
      tag_list = object_tag.parent.next_sibling.next_sibling.find_all("div")
      for tag in tag_list:
        if tag.string:
          # The attribute list is formed by a single string that needs to be
          # split apart.
          parts = tag.string.strip().split(".")
        else:
          parts = []
          for subtag in tag.children:
            if subtag.string:
              part = subtag.string.strip()
              # Remove trailing periods since they'll be added back in later.
              if len(part) > 0 and part[-1] == ".":
                part = part[:-1].strip()
              parts.append(part)
        description = None
        for part in parts:
          part = part.strip()
          if part == "":
            continue

          if part == "Light Object":
            self.object_size = "light"
          elif part == "Heavy Object":
            self.object_size = "heavy"
          elif part == "Ultra Light Object":
            self.object_size = "ultra_light"
          elif part == "Ultra Heavy Object":
            self.object_size = "ultra_heavy"
          elif part == "Immobile Object":
            self.object_size = "immobile"
          elif part == "Special Object":
            self.object_type = "special"
          elif part == "Disguised Plastic Man Special Object":
            self.object_type = "plastic_man"
          elif part.upper == "INDESTRUCTIBLE":
            self.object_keyphrases.append("indestructible")
          elif not description:
            description = part + "."
          else:
            description += " " + part + "."

        if description:
          if self.object_type == "standard":
            self.object_type = "special"
          self.special_powers.append(OrderedDict([
            ("description", clean_string(description.strip()))
          ]))
          self.special_powers[-1] = self.parse_powers_from_description(self.special_powers[-1])
    # Parse equipment special powers
    elif self.type == "equipment":
      equip_tag = soup.find("td", class_="card_special_object")
      if not equip_tag:
        equip_tag = soup.find("td", class_="card_light_object")
      tag_list = equip_tag.parent.next_sibling.next_sibling.find_all("div")
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
          # First try to split by newlines
          text = children[0].string.strip()
          parts = text.split("\n")
          if len(parts) > 1:
            for part in parts:
              part = part.strip()
              if len(part) > 0:
                attr_list.append(part)
          else:
            # Fall back to splitting by periods.
            parts = text.split(".")
            for part in parts:
              part = part.strip()
              if part == "":
                continue

              lower_part = part.lower()
              if (lower_part == "indestructible" or
                  lower_part.startswith("equip: ") or
                  lower_part.startswith("unequip: ") or
                  lower_part.endswith("object")):
                attr_list.append(part)
              elif part.startswith("EFFECT: "):
                attr_list.append(part + ".")
              elif len(attr_list) > 0 and attr_list[-1].startswith("EFFECT: "):
                attr_list[-1] += " " + part + "."
              else:
                print("For unit '%s', skipping unknown object attribute part '%s'" % (self.unit_id, part))
        else:
          for attr in children:
            # Ignore non-strings.
            if attr.string:
              if len(attr_list) > 0 and attr_list[-1] == "EFFECT:":
                # If the previous item was just the title of the effect, join
                # the two strings.
                attr_list[-1] += attr.string.strip()
              else:
                attr_list.append(attr.string.strip())

        for attr in attr_list:
          if len(attr) <= 0:
            continue;

          lower_attr = attr.lower()
          if (lower_attr == "indestructible" or
              lower_attr.startswith("equip: ") or
              lower_attr.startswith("unequip: ") or
              lower_attr == "sword equipment"):
            keyphrase = fix_style(attr).replace('.', '')
            if keyphrase in OBJECT_KEYPHRASE_VALUES:
              self.object_keyphrases.append(keyphrase)
            else:
              print("For unit '%s', skipping unknown object keyphrase '%s'" % (self.unit_id, keyphrase))
          elif lower_attr.startswith("light object"):
            self.object_size = "light"
          elif lower_attr == "heavy object":
            self.object_size = "heavy"
          elif lower_attr == "ultra light object":
            self.object_size = "ultra_light"
          elif lower_attr == "ultra heavy object":
            self.object_size = "ultra_heavy"
          elif lower_attr == "immobile object":
            self.object_size = "immobile"
          elif (lower_attr == "equip" or
                lower_attr.startswith("give a friendly character in this square")):
            # Skip the attributes that just describe equipment rules.
            pass
          else:
            # Handle equipment special powers, including "EFFECT"
            sp = attr.split(':', 1)
            if len(sp) >= 2:
              sp_name = sp[0]
              sp_description = sp[1].strip()
              self.special_powers.append(OrderedDict([
                ("name", sp_name),
                ("description", clean_string(sp_description))
              ]))
              self.special_powers[-1] = self.parse_powers_from_description(self.special_powers[-1])
            elif len(self.special_powers) > 0:
              # Append it to the end of the previous description.
              self.special_powers[-1]["description"] += clean_string(" " + attr)
              self.special_powers[-1] = self.parse_powers_from_description(self.special_powers[-1])
            else:
              print("Skipping unknown object attribute '%s'" % attr)

    # Parse Mystery Cards
    if self.type == "mystery_card":
      card_tag = soup.find("td", class_="card_id_card")
      if not card_tag:
        card_tag = soup.find("td", class_="card_tarot_card")
      if not card_tag:
        card_tag = soup.find("td", class_="card_ata")
        
      tag_list = card_tag.parent.next_sibling.next_sibling.find_all("div")
      if tag_list:
        tag = tag_list[0]
        # Skip the first item in the list if it's the keyword list.
        if tag.strong:
          tag = tag_list[1]

        for name in [r'\sCLUE EFFECT: .*\s',
                     r'\sSUSPECT \(\d\)\s',
                     r'\sEVIDENCE \(\d\)\s',
                     r'\sCASE CLOSED \(\d\)\s']:
          name_tag = tag.find(text=re.compile(name))
          if name_tag:
            self.special_powers.append(OrderedDict([
              ("name", clean_string(name_tag.strip())),
              ("description", clean_string(name_tag.parent.next_sibling.strip()[2:]))
            ]))
            self.special_powers[-1] = self.parse_powers_from_description(self.special_powers[-1])

    # Parse tarot cards
    if self.type == "tarot_card":
      equip_tag = soup.find("td", class_="card_tarot_card").parent
      desc_tag = equip_tag.next_sibling.next_sibling.find("div")
      self.special_powers.append(OrderedDict([
        ("description", clean_string(desc_tag.string.strip()))
      ]))

    # Parse ID cards
    if self.type == "id_card":
      card_tag = soup.find("td", class_="card_id_card")
      tag = card_tag.parent.next_sibling.next_sibling.td.div
      for (regex, type) in [(r'\s(Other Identities): (.*)\s', 'other_id'),
                            (r'\s(Inspiration): *\s', 'inspiration')]:
        compiled_re = re.compile(regex)
        sp_tag = tag.find(text=compiled_re)
        if sp_tag:
          match_obj = re.search(compiled_re, sp_tag)
          if match_obj:
            sp_name = match_obj.group(1)
            if len(match_obj.groups()) >= 2:
              sp_desc = match_obj.group(2)
            else:
              sp_desc = sp_tag.parent.next_sibling
            self.special_powers.append(OrderedDict([
              ("type", type),
              ("name", clean_string(sp_name)),
              ("description", clean_string(sp_desc.strip()))
            ]))
            self.special_powers[-1] = self.parse_powers_from_description(self.special_powers[-1])

    # Parse Comic Panels
    if self.type == "comic_panel":
      if self.name == "Energy Shield / Deflection":
        self.name = "Energy Shield/Deflection"

      self.special_powers.append(OrderedDict([
        ("name", clean_string(self.name)),
        ("description", "The unit to which the comic panel is attached can use the listed effect.")
      ]))
      power = POWERS.get(self.name, None)
      if power:
        self.special_powers[-1]["powers"] = [power]

    # Parse special powers
    if (self.type == "character" or
        self.type == "team_up" or
        self.type == "bystander" or
        self.type == "object" or
        self.type == "equipment"):
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
            desc = ""
            if td_tags[1].strong:
              desc = td_tags[1].strong.string.strip()
            if "title" in self.properties and desc.startswith("STARTING PLOT POINTS"):
              sp_type = "title_trait"
            elif desc.startswith("LEADER OF THE NASTY BOYS"):
              # Hack to fix xdps043a, who should have a trait instead of an improved ability
              sp_type = "trait"
            else:
              sp_type = "improved"
          elif sp_type_str.startswith("m-"):
            sp_type = "speed"
          elif sp_type_str.startswith("a-") or sp_type_str.startswith("vehicle"):
            sp_type = "attack"
          elif sp_type_str.startswith("d-"):
            sp_type = "defense"
          elif sp_type_str.startswith("g-"):
            sp_type = "damage"
          elif sp_type_str == "epic":
            sp_type = "epic"
          elif sp_type_str == "pilot":
            # This will be handled down below when we extract passengers.
            sp_type = "none"
          else:
            raise RuntimeError("The special power type '%s' for '%s' is currently not supported" % (sp_type_str, unit_id))

          if td_tags[1].strong:
            sp_name = td_tags[1].strong.string.strip().rstrip(':')
            sp_description = td_tags[1].contents[2].strip()
            for contents in td_tags[1].contents[3:]:
              if not isinstance(contents, Tag):
                sp_description += " " + contents.strip()
          else:
            sp_name = None
            sp_description = td_tags[1].string.strip()

          # Correct epic action types
          if sp_type == "epic":
            if "title" in self.properties:
              sp_type = "title_trait"
            elif sp_name.lower().startswith("improved"):
              sp_type ="improved"
            elif (self.unit_id.startswith("aiG024") or
                  self.unit_id.startswith("adw048")):
              # Hack to fix trait type for a few specific units.
              sp_type = "trait"
            else:
              raise RuntimeError("Unit '%s' has special power type 'epic', which is not currently supported" % (unit_id))
              
          # Skip the special power that describes a construct
          if self.type == "bystander" and self.bystander_type == "construct" and sp_name == "CONSTRUCTS":
            continue
          
          # Skip the special power that describes Special Terrain rules.
          if (self.type == "character" and
              sp_name and
              sp_name.upper().startswith("SPECIAL TERRAIN TRAIT")):
            continue
          
          # Handle special power that describe the number of passengers.
          if ((self.type == "character" or self.type == "bystander") and
              sp_name and
              sp_name.startswith("PASSENGER")):
            self.passengers = int(sp_description)
            continue
          
          # Handle special powers that describe properties
          if sp_type == "trait" and sp_name == "ROLE TAG":
            tags = re.split("/|,", sp_description)
            for tag in tags:
              tag = fix_style(tag.strip())
              if (tag == "sidekick" or
                  tag == "captain" or
                  tag == "ally" or 
                  tag == "secret_identity"):
                self.properties.append(tag)
              else:
                raise RuntimeError("Found unknown role tag '%s' for '%s'" % (tag, unit_id))
            continue

          if sp_type == "improved":
            # Check if the name is empty or descriptive and the improved ability type is
            # just the first part of the description.
            if (not sp_name or not sp_name.lower().startswith("improved")) and sp_description.lower().startswith("improved"):
              idx = sp_description.find(":")
              sp_name = sp_description[:idx].strip()
              sp_description = sp_description[idx + 1:].strip()

            # Check whether the description holds different types of improved
            # abilities and, if so, split it up and process each separately.
            improved_abilities = []
            for imp_type in IMPROVED_ABILITIES.keys():
              type_str =  "improved " + imp_type + ":"
              idx = sp_description.lower().find(type_str)
              if idx >= 0:
                improved_abilities.append((sp_name, sp_description[:idx].strip()))
                sp_name = type_str[:-1]
                sp_description = sp_description[idx + len(type_str):]

            if len(sp_description) > 0:
              improved_abilities.append((sp_name, sp_description))
              
            for (imp_name, imp_types) in improved_abilities:
              if not imp_name:
                continue
              imp_name = imp_name.lower()
              if imp_name.startswith("improved "):
                imp_name = imp_name.split(" ", 1)[1].strip()
              # Correct the spelling of 'targeting'.
              if imp_name == 'TARGETTING':
                imp_name = 'TARGETING'
              elif imp_name == 'MOVEMENT; IMPROVED TARGETING':
                print("Warning: unit '%s' has invalid improved ability type '%s'" % (self.unit_id, imp_name))
                continue
              improved_ability_info = IMPROVED_ABILITIES.get(imp_name, None)
              if not improved_ability_info:
                raise RuntimeError("Error: unit '%s' has invalid improved ability type '%s'" % (self.unit_id, imp_name))
              else:
                # First try to parse when the abilities are listed as rules.
                attr_name = improved_ability_info["attr_name"]
                types = improved_ability_info["types"]
                
                # Remove any trailing delimiters.
                if (len(imp_types) > 0 and
                    (imp_types[-1] == "." or
                     imp_types[-1] == ";")):
                  imp_types = imp_types[:-1]
  
                # Try and split apart the description by different delimiters and
                # extract the values that have a match.
                for delimiter in [", and", "and", ".", ",", ";"]:
                  parts = imp_types.split(delimiter)
                  imp_types = ""
                  while len(parts) > 0:
                    tail = parts.pop()
                    lower_tail = tail.strip().lower()
                    if lower_tail in types:
                      # If a match was found, add the improved ability and begin
                      # searching for the next.
                      attr = getattr(self, attr_name)
                      attr.append(types[lower_tail])
                      setattr(self, attr_name, attr)
                    elif len(parts) > 0:
                      # Couldn't find a match, so combine the last two strings and try again.
                      parts[-1] = parts[-1] + delimiter + tail
                    else:
                      # Move the remaining segments back to the imp_types
                      # field to try again (or fail out with an error)
                      imp_types = tail
  
                if imp_types and len(imp_types) > 0:
                  print("For %s, skipping unknown %s ability, description='%s'" % (self.unit_id, attr_name, imp_types))
  
                # Reverse the list since we were previously working backwards
                # from the end of the list.
                getattr(self, attr_name).reverse()

          else:
            sp = OrderedDict([("type", sp_type)])
            if sp_name:
              sp["name"] = clean_string(sp_name)
            sp["description"] = clean_string(sp_description.strip())

            # Handle special trait types, like costed, rally, or plot points.
            if sp_type == "trait" and sp_name:
              # Handle title character traits, like plus and minus plot points.
              if "title" in self.properties:
                match_obj = re.search(r"^\(([-\+][X\d]{1,2})\) (.*)", sp_name)
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
              name_idx = 2
              pv_idx = 1
              match_obj = re.search(r"^\(\+(\d*) POINTS\) (.+)", sp_name)
              # Try the alternative format. Note: this can conflict with the
              # style of title character plot points, so ignore it in that case.
              if not match_obj and not "title" in self.properties:
                match_obj = re.search(r"^\(\+(\d*)\) (.+)", sp_name)
                if not match_obj:
                  # Try another alternative format with the poins at the end
                  # instead of the start.
                  match_obj = re.search(r"^(.+) \(\+(\d*) POINTS\)", sp_name)
                  name_idx = 1
                  pv_idx = 2
              if match_obj:
                sp["type"] = "costed_trait"
                sp["name"] = clean_string(match_obj.group(name_idx))
                sp["point_value"] = int(match_obj.group(pv_idx))

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
                  sp["description"] = clean_string(match_obj.group(2).strip())
                  sp["rally_type"] = match_obj.group(1).lower()
                sp["rally_die"] = rally_die
                # Clean description string to remove rally rules.
                sp["description"] = sp["description"].replace("RALLY: Once per roll for each die in a finalized attack roll and for all characters with a matching RALLY die and trait color printed under their trait star, after resolutions you may choose a friendly character to gain a matching RALLY die. RALLY trait colors specify which attack type they can gain RALLY dies from. BLUE = Friendly Attack Rolls. RED = Opposing Attack Rolls. GREEN = All Attack Rolls.", "")
                sp["description"] = sp["description"].replace(" When a character gains a RALLY die, place a die with the matching result on their card.", "")
                sp["description"] = sp["description"].replace(" ()", "")
    
            # Try to find a list of standard powers granted by the special power
            # so that the list can be used for search.
            sp = self.parse_powers_from_description(sp)
    
            # Avoid adding duplicates.
            dupe = [x for x in self.special_powers if x.get("name", "__x_name__") == sp.get("name", "__sp_name__")]
            if dupe:
              print("Skipping duplicate special power '%s' for '%s'" % (sp["name"], self.unit_id))
            else:
              self.special_powers.append(sp)
  
    if self.type == "character" or self.type == "bystander":
      # Parse range and number of targets
      tag = soup.find("div", {"style": "float:left;padding-top:3px;"})
      self.unit_range = int(tag.contents[0].string.strip())
      self.targets = int(re.search(r"/images/units-targets-(\d)\.[a-z]{3}", tag.img['src']).group(1))
  
      # Parse the combat symbols
      combat_symbols = soup.find("table", class_="icons").tbody.select('tr')
      # Hack for Galactus, which is missing symbols.
      if unit_id in ["wkM-G001b", "wkM-G001b-100"]:
        self.speed_type = "boot"
        self.attack_type = "fist"
        self.defense_type = "shield"
        self.damage_type = "colossal"
      else:
        self.speed_type = re.search(r"/images/units-m-(.+)\.[a-z]{3}", combat_symbols[0].td.img['src']).group(1)
        self.attack_type = re.search(r"/images/units-a-(.+)\.[a-z]{3}", combat_symbols[1].td.img['src']).group(1)
        self.defense_type = re.search(r"/images/units-d-(.+)\.[a-z]{3}", combat_symbols[2].td.img['src']).group(1)
        self.damage_type = re.search(r"/images/units-g-(.+)\.[a-z]{3}", combat_symbols[3].td.img['src']).group(1)
      # Disambiguate between the attack and damage "fist" symbols by making damage 'colossal'
      if self.damage_type == "fist":
        self.damage_type = "colossal"
  
      # Parse the dial
      self.dial_size = 0
      dials = soup.find_all("table", class_="units_dial")
      for col in dials[0].find_all("table", class_="power"):
        tags = col.find_all("tr")
        # If it has a title, it's a non-KO click, otherwise skip it.
        if tags[0].td.has_attr('title'):
          row_obj = OrderedDict()
          row_obj["click_number"] = self.dial_size + 1
          click_number = int(tags[4].td.string.strip())
          if click_number != self.dial_size + 1:
            row_obj["alt_click_number"] = click_number
            #print("Warning: unit '%s' has alternative click number '%d' at normal num '%d'" % (self.unit_id, click_number, self.dial_size + 1))
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
            value = tag.td.string.strip()
            if value != u"":
              try:
                value = int(value)
              except ValueError:
                value = tag.td.string.strip()
                print("Warning: for unit '%s', click number %d has abnormal %s '%s'" % (self.unit_id, len(self.dial), types[i] + "_value", tag.td.string.strip()))
            row_obj[types[i] + "_value"] = value
          self.dial.append(row_obj)
        self.dial_size += 1
        
        # Bystanders only have a single click
        if self.type == "bystander":
          break

      if len(dials) > 1:
        print("Skipping extra dials (%d total) for unit %s" % (len(dials), self.unit_id))

    # Sanity-check the dimensions.
    if self.type == "character":
      if self.dimensions == "1x1" or self.dimensions == "1x2":
        expected_dial_size = 12
      elif self.dimensions == "2x2":
        expected_dial_size = 26
      elif self.dimensions == "2x4" or self.dimensions == "3x6":
        expected_dial_size = 20
      else:
        raise RuntimeError("Unknown dimensions for '%s': found '%s'" % (self.unit_id, self.dimensions))
      if self.dial_size != expected_dial_size:
        if not (self.dial_size == 20 and expected_dial_size == 26):
          print("Warning: for unit '%s', expected a dial size of %d, but got %d" % (self.unit_id, expected_dial_size, self.dial_size))
        self.dial_size = expected_dial_size
      if len(self.dial) > expected_dial_size:
        print("Warning: for unit '%s', expected a max dial size of %s, but got %d" % (self.unit_id, expected_dial_size, len(self.dial)))
        self.dial = self.dial[:self.dial_size]
    elif self.type == "bystander":
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

    # If the collector number starts with "L", assume it's a legacy card
    if self.collector_number.startswith("L"):
      self.properties.append("legacy")

    return True

  # Given a "special_powers" entry, tries to populate the "powers" field of the
  # "description" field.
  def parse_powers_from_description(self, sp):
    # Try to find a list of standard powers granted by the special power
    # so that the list can be used for search.
    sp_desc = sp["description"]
    sp_desc = sp_desc.replace(" and", ",")
    split_list = re.split("\.|,|//|-", sp_desc)
    sp_powers = []
    for power in split_list:
      power = power.strip()
      if (len(power) <= 0 or
          power.lower() == "knockback" or
          power.lower() == "[wing symbol]" or
          power.lower() == "[flight symbol]" or
          power.lower().startswith("passenger") or
          power.lower().startswith("giant reach")):
        continue
      prefix = self.name + " can use "
      if power.startswith(prefix):
        power = power[len(prefix):]
      if power in POWERS:
        sp_powers.append(POWERS[power])
      elif sp.get("type", None) == "trait" and power.startswith("Improved Movement:"):
        im_name = power.split(":", 1)[1].strip()
        im_type = IMPROVED_ABILITIES["movement"]["types"].get(im_name.lower(), None)
        if im_type:
          if not im_type in self.improved_movement:
            self.improved_movement.append(im_type)
        else:
          print("Warning: unit '%s' has unknown traited improved movement '%s'" % (self.unit_id, im_name))
      elif sp.get("type", None) == "trait" and power.startswith("Improved Targeting:"):
        it_name = power.split(":", 1)[1].strip()
        it_type = IMPROVED_ABILITIES["targeting"]["types"].get(it_name.lower(), None)
        if it_type:
          if not it_type in self.improved_targeting:
            self.improved_targeting.append(it_type)
        else:
          print("Warning: unit '%s' has unknown traited improved targeting '%s'" % (self.unit_id, it_name))
      else:
        # Stop trying on the first failure, otherwise we will probably
        # pull in more than we should.
        break
    if len(sp_powers) > 0:
      sp["powers"] = sp_powers
    return sp

  # Tries to merge the 'src_unit' into this, as the dest. Returns True if done
  # successfully, otherwise False.
  def merge_point_values(self, src_unit):
    fields = ["name", "rarity", "real_name", "properties", "dimensions", "team_abilities", "keywords"]
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
          click["click_number"] = click_num + 1
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
      # Hack to avoid writing 25 starting lines for aiG001 Giant-Girl.
      if self.unit_id != "aiG001":
        self.dial[starting_line]["starting_line"] = True

    # Add any missing special powers.
    for src_sp in src_unit.special_powers:
      found = False
      for dst_sp in self.special_powers:
        if src_sp.get("name", "") == dst_sp.get("name", ""):
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

  def apply_update(self, update):
    update_mode = update.get("__update_mode__", "insert_value")
    for (key, value) in update.items():
      if key == "__update_mode__":
        continue
      elif key == "special_powers":
        if update_mode == "insert_value":
          deletions = []
          for i in range(len(value)):
            if i >= len(self.special_powers):
              print("Warning: update for '%s' is adding special_power '%d'" % (self.unit_id, len(self.special_powers)))
              self.special_powers.append(OrderedDict())
            for (k, v) in value[i].items():
              if k == "__delete__":
                # Hack for handling swb028, which has a slightly mis-spelled
                # dupe.
                # Note: we insert these at the start so that deletions are
                # processed in reverse order.
                deletions.insert(0, i)
              elif k == "__reorder__":
                # Hack for handling misordering of special powers (ie eax052)
                sp = self.special_powers[i]
                del self.special_powers[i]
                self.special_powers.insert(v, sp)
              else:
                self.special_powers[i][k] = v
          for deletion_idx in deletions:
            del self.special_powers[deletion_idx]
        elif update_mode == "insert_list_item":
          for i in range(len(value)):
            self.special_powers.insert(i, value[i])
        else:
          raise RuntimeError("Don't know how to handle update_mode %s" % update_mode)
      elif key == "dial":
        for i in range(len(value)):
          if i >= len(self.dial):
            print("Warning: update for '%s' is adding click '%d'" % (self.unit_id, len(self.dial)))
            self.dial.append(OrderedDict())
          for (k, v) in value[i].items():
            if k.endswith("_power") and v == u"":
              del self.dial[i][k]
            else:
              self.dial[i][k] = v
      elif (key == "name" or
            key == "real_name" or
            key == "keywords" or
            key == "defense_type" or
            key == "object_size" or
            key == "point_values" or
            key == "team_abilities" or
            key == "improved_movement" or
            key == "improved_targeting"):
        setattr(self, key, value)
      else:
        raise RuntimeError("The update type '%s' for '%s' is currently not supported" % (key, self.unit_id))

  def validate(self):
    if len(self.name) <= 0:
      print("Warning: unit '%s' has an empty name" % (self.unit_id))
    if not self.type in TYPE_VALUES:
      print("Warning: unit '%s' has an unknown type '%s'" % (self.unit_id, self.type))
    if self.rarity and not self.rarity in RARITY_VALUES:
      print("Warning: unit '%s' has an unknown rarity '%s'" % (self.unit_id, self.rarity))

    for property in self.properties:
      if not property in PROPERTY_VALUES:
        print("Warning: unit '%s' has an unknown property '%s'" % (self.unit_id, property))
    
    for sp in self.special_powers:
      sp_type = sp.get("type", None)
      if sp_type and not sp_type in SPECIAL_POWER_TYPE_VALUES:
        print("Warning: unit '%s' has an unknown special power type '%s'" % (self.unit_id, sp_type))
        continue
      if not sp.get("name", None):
        print("Warning: unit '%s' does not have a special power name" % (self.unit_id))
      if not sp.get("description", None):
        print("Warning: unit '%s' does not have a special power description" % (self.unit_id))
      if sp_type == "costed_trait":
        sp_point_value = sp.get("point_value", None)
        if not sp_point_value:
          print("Warning: unit '%s' has a costed trait without a point value" % (self.unit_id))
      if sp_type == "rally":
        sp_rally_type = sp.get("rally_type", None)
        if not sp_rally_type:
          print("Warning: unit '%s' has a rally trait without a rally type" % (self.unit_id))
        if not sp_rally_type in RALLY_TYPE_VALUES:
          print("Warning: unit '%s' has an unknown rally type '%s'" % (self.unit_id, sp_rally_type))
        sp_rally_die = sp.get("rally_die", None)
        if not sp_rally_die:
          print("Warning: unit '%s' has a rally trait without a rally die" % (self.unit_id))
        if sp_rally_die < 1 or sp_rally_die > 6:
          print("Warning: unit '%s' has an invalid rally die '%d'" % (self.unit_id, sp_rally_die))
      if sp_type == "plus_plot_points" or sp_type == "minus_plot_points":
        plot_points = sp.get("plot_points", 1000)
        if plot_points == 1000:
          print("Warning: unit '%s' has a title trait without a plot point value" % (self.unit_id))
      if sp_type == "location":
        sp_point_value = sp.get("point_value", None)
        if not sp_point_value:
          print("Warning: unit '%s' has a location without a point value" % (self.unit_id))
      sp_powers = sp.get("powers", [])
      for power in sp_powers:
        if not power in POWER_VALUES:
          print("Warning: unit '%s' has a special power with an invalid power '%s'" % (self.unit_id, power))

    for im in self.improved_movement:
      if not im in IMPROVED_MOVEMENT_VALUES:
        print("Warning: unit '%s' has an unknown improved movement value '%s'" % (self.unit_id, im))

    for it in self.improved_targeting:
      if not it in IMPROVED_TARGETING_VALUES:
        print("Warning: unit '%s' has an unknown improved targeting value '%s'" % (self.unit_id, it))

    # Sanity-check object types.
    if self.type == "object" or self.type == "equipment":
      if not self.object_type:
        print("Warning: for unit '%s' with type 'object' - missing object_type" % self.unit_id)
      elif not self.object_type in OBJECT_TYPE_VALUES:
        print("Warning: for unit '%s' with type 'object' - invalid object_type '%s'" % (self.unit_id, self.object_type))
      if not self.object_size:
        print("Warning: for unit '%s' with type 'object' - missing object_size" % self.unit_id)
      elif not self.object_size in OBJECT_SIZE_VALUES:
        print("Warning: for unit '%s' with type 'object' - invalid object_size '%s'" % (self.unit_id, self.object_size))
      for ok in self.object_keyphrases:
        if not ok in OBJECT_KEYPHRASE_VALUES:
          print("Warning: for unit '%s' with type 'object' - invalid object_keyphrase '%s'" % (self.unit_id, ok))

    # Sanity-check bystander types.
    if self.type == "bystander":
      if not self.bystander_type:
        print("Warning: for unit '%s' with type 'bystander' - missing bystander_type" % self.unit_id)
      if not self.bystander_type in BYSTANDER_TYPE_VALUES:
        print("Warning: for unit '%s' with type 'bystander' - unknown bystander_type '%s'" % (self.unit_id, self.bystander_type))

    if self.type == "character" or self.type == "bystander":
      if self.unit_range < 0 or self.unit_range > 13:
        print("Warning: unit '%s' has unexpected range '%d'" % (self.unit_id, self.unit_range))
      if self.targets < 0 or self.targets > 3:
        print("Warning: unit '%s' has unexpected targets '%d'" % (self.unit_id, self.targets))
      if self.passengers < -1 or self.passengers > 8:
        print("Warning: unit '%s' has unexpected passengers '%d'" % (self.unit_id, self.passengers))
      if not self.speed_type:
        print("Warning: unit '%s' has a missing speed_type" % (self.unit_id))
      elif not self.speed_type in SPEED_TYPE_VALUES:
        print("Warning: unit '%s' has an unknown type '%s'" % (self.unit_id, self.speed_type))
      if not self.attack_type:
        print("Warning: unit '%s' has a missing attack_type" % (self.unit_id))
      elif not self.attack_type in ATTACK_TYPE_VALUES:
        print("Warning: unit '%s' has an unknown type '%s'" % (self.unit_id, self.attack_type))
      if not self.defense_type:
        print("Warning: unit '%s' has a missing defense_type" % (self.unit_id))
      elif not self.defense_type in DEFENSE_TYPE_VALUES:
        print("Warning: unit '%s' has an unknown type '%s'" % (self.unit_id, self.defense_type))
      if not self.damage_type:
        print("Warning: unit '%s' has a missing damage_type" % (self.unit_id))
      elif not self.damage_type in DAMAGE_TYPE_VALUES:
        print("Warning: unit '%s' has an unknown type '%s'" % (self.unit_id, self.damage_type))

      for click in self.dial:
        click_number = click.get("click_number", 0)
        if click_number <= 0 or click_number > 26:
          print("Warning: unit '%s' has an invalid click number '%d'" % (self.unit_id, click_number))
        for field in ["speed", "attack", "defense", "damage"]:
          value = click.get(field + "_value", -1)
          if isinstance(value, unicode):
            if len(value) > 1:
              print("Warning: unit '%s' click '%d' has an %s value '%s'" % (self.unit_id, click_number, field, value))
          elif isinstance(value, int) and value < 0 or value > 21:
            print("Warning: unit '%s' click '%d' has an unexpected %s value '%s'" % (self.unit_id, click_number, field, str(value)))
          power = click.get(field + "_power", None)
          if power and power != "special":
            if not power in POWER_VALUES:
              print("Warning: unit '%s' click '%d' has an invalid %s power '%s'" % (self.unit_id, click_number, field, power))

  def output_xml(self):
    # Convert the unit ID into the value we prefer - (set_id + collector_number)
    # which may be different than HCRealms.
    unit_id = self.set_id + self.collector_number
    xml = u"""
    <unit_id>{}</unit_id>
    <set_id>{}</set_id>
    <collector_number>{}</collector_number>
    <name>{}</name>
    <type>{}</type>""".format(unit_id, self.set_id, self.collector_number, clean_string(self.name), self.type)
    #if self.age:
    #  xml += "\n    <age>%s</age>" % self.age
    if self.rarity:
      xml += "\n    <rarity>%s</rarity>" % self.rarity
    if self.real_name:
      xml += "\n    <real_name>%s</real_name>" % clean_string(self.real_name)
    if self.dimensions:
      xml += "\n    <dimensions>%s</dimensions>" % self.dimensions
    xml += u"""
    <point_values>{}</point_values>
    <properties>{}</properties>
    <team_abilities>{}</team_abilities>
    <keywords>{}</keywords>
    <special_powers>{}</special_powers>
    <improved_movement>{}</improved_movement>
    <improved_targeting>{}</improved_targeting>""".format(
      json.dumps(self.point_values), json.dumps(self.properties), json.dumps(self.team_abilities),
      json.dumps(self.keywords), json.dumps(self.special_powers, indent=2),
      json.dumps(self.improved_movement), json.dumps(self.improved_targeting))
    if self.object_type:
      xml += "\n    <object_type>%s</object_type>" % self.object_type
    if self.object_size:
      xml += "\n    <object_size>%s</object_size>" % self.object_size
    xml += "\n    <object_keyphrases>%s</object_keyphrases>" % json.dumps(self.object_keyphrases)
    if self.bystander_type:
      xml += "\n    <bystander_type>%s</bystander_type>" % self.bystander_type
    if self.map_url:
      xml += "\n    <map_url>%s</map_url>" % self.map_url
    if self.passengers >= 0:
      xml += "\n    <passengers>%s</passengers>" % self.passengers
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
      set_info = SET_MAP.get(self.set_id, None)
      if not set_info:
        raise RuntimeError("Cannot find set '%s' in the SET_MAP" % self.set_id)
      set_name = set_info["name"]
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
    
    ranges = SET_MAP[self.set_id].get("ranges", None);
    range_index = 0
    in_range = False
    unit_count = 0
    for units_link in units_links:
      link = units_link['onclick']
      unit_id = re.search(r"showFigure\('(.+)'\)", link).group(1)
      # Skip the units that fall outside of the range, if there was one.
      if ranges and not in_range:
        if unit_id == ranges[range_index][0]:
          in_range = True
        else:
          continue
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

      if ranges and in_range:
        if unit_id == ranges[range_index][1]:
          in_range = False
          range_index += 1
          if range_index >= len(ranges):
            break

    return set_list
        
  def fetch_unit_page(self, unit_id):
    unit_path = get_unit_cache_path(self.set_id, unit_id);
    if not self.skip_cache and os.path.exists(unit_path):
      #print("Reading unit from cache at " + unit_path)
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
      #print("Cached unit page to " + filename)
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

  # Make sure the set path exists.
  if not os.path.exists(args.set_id):
    os.mkdir(args.set_id);

  # Try to load an associated patch file.
  patch = {}
  patch_filename = "%s/patch.json" % args.set_id
  if os.path.exists(patch_filename):
    with open(patch_filename, "r") as f:
      patch = json.loads(f.read())
  deletions = patch.get("deletions", [])
  updates = patch.get("updates", {})

  units = []
  fetcher = Fetcher(args.set_id, args.skip_cache)
  try:
    set_list_page = fetcher.fetch_set_list_page()
    set_list = fetcher.parse_set_list_page(set_list_page, args.unit_id_start, int(args.max_units))
    for set in set_list:
      unit_id = set["unit_id"]
      dimensions = set["dimensions"]
      if args.unit_id_stop and unit_id == args.unit_id_stop:
        break
      
      # Skip the units in the "deletions" section of the patch.
      if unit_id in deletions:
        continue

      unit_page = fetcher.fetch_unit_page(unit_id);
      unit = Unit(set_id=args.set_id, dimensions=dimensions)
      if unit.parse_unit_page(unit_page):
        # If the unit ID ends in 'r', 'e', or 'v', check for other units with
        # similar same unit ID and if so, merge point values.
        main_unit = None
        if unit.unit_id.endswith(('r', 'e', 'v', 'x', 'p')):
          main_unit = next((u for u in units if u.unit_id == unit.unit_id[:-1] and u.type == unit.type), None)
        # If the unit ID ends in with its point value, check for other units with
        # similar same unit ID and if so, merge point values.
        else:
          match_obj = re.search(r"(.*)-\d{2,3}$", unit.unit_id)
          if match_obj:
            main_unit = next((u for u in units if u.unit_id == match_obj.group(1) and u.type == unit.type), None)

        if main_unit:
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
            unit.properties.append("team_up")
          else:
            print("Failed to find corresponding unit for team-up %s" % unit_id)
            unit = None

        if unit:
          units.append(unit)

    if patch.get("additions", None):
      for addition in patch["additions"]:
        if len(units) < int(args.max_units):
          unit = Unit(**addition)
          units.append(unit)

  except Exception as e:
    print("An error has occurred: ", e, "\n", traceback.format_exc())

  fetcher.close()

  for unit in units:
    # Apply any updates from the patches. Needs to be done outside of the loop
    # in case there are any merges that occur.
    if unit.unit_id in updates:
      unit.apply_update(updates[unit.unit_id])

  # Sort the units so that maps are last, otherwise by their unit ID
  units.sort()

  num_processed = 0
  output_xml = "<resultset>"
  for unit in units:
    unit.validate()
    unit_xml = unit.output_xml()
    if unit_xml:
      output_xml += "\n  <row>"
      output_xml += unit_xml
      output_xml += "\n  </row>"
      num_processed += 1
  output_xml += "\n</resultset>"
  filename = "%s/%s.xml" % (args.set_id, args.set_id)
  f = open(filename, "w")
  f.write(output_xml.encode('utf-8'))
  f.close()
  print("Wrote %d units to %s" % (num_processed, filename))

  # Also save the JSON file for debugging.
  json_list = []
  xml_list = xmltodict.parse(output_xml, force_list={"row"})
  # Convert JSON fields into dicts
  resultset = xml_list.get("resultset", None)
  if resultset:
    for unit in resultset["row"]:
      for field in ["point_values",
                    "properties",
                    "team_abilities",
                    "keywords",
                    "special_powers",
                    "improved_movement",
                    "improved_targeting",
                    "object_keyphrases",
                    "dial"]:
        unit[field] = json.loads(unit[field], object_pairs_hook=OrderedDict)
      json_list.append(unit)
  
    with open("%s/%s.json" % (args.set_id, args.set_id), "w") as json_file:
      json_file.write(json.dumps(json_list, indent=2))