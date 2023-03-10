#!/usr/bin/env python
import argparse
import json
import xmltodict
from collections import OrderedDict

if __name__ == "__main__":
  parser = argparse.ArgumentParser()
  parser.add_argument("--set_id", help="The set ID to convert", required=True)
  args = parser.parse_args()

  with open("set_%s.xml" % args.set_id) as xml_file:
    xml_list = xmltodict.parse(xml_file.read(), force_list={"row"})

  json_list = []
  # Convert JSON fields into dicts
  for unit in xml_list["resultset"]["row"]:
    unit["point_values"] = json.loads(unit["point_values"], object_pairs_hook=OrderedDict)
    unit["team_abilities"] = json.loads(unit["team_abilities"], object_pairs_hook=OrderedDict)
    unit["keywords"] = json.loads(unit["keywords"], object_pairs_hook=OrderedDict)
    unit["special_powers"] = json.loads(unit["special_powers"], object_pairs_hook=OrderedDict)
    unit["improved_movement"] = json.loads(unit["improved_movement"], object_pairs_hook=OrderedDict)
    unit["improved_targeting"] = json.loads(unit["improved_targeting"], object_pairs_hook=OrderedDict)
    unit["object_keyphrases"] = json.loads(unit["object_keyphrases"], object_pairs_hook=OrderedDict)
    unit["dial"] = json.loads(unit["dial"], object_pairs_hook=OrderedDict)
    json_list.append(unit)

  with open("set_%s.json" % args.set_id, "w") as json_file:
    json_file.write(json.dumps(json_list, indent=2))