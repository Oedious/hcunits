const IMPROVED_MOVEMENT_LIST = {
  "elevated": {
    "name": "Elevated",
    "description": "This character can move up or down across Elevated terrain (without using elevation transition squares)."
  },
  "hindering": {
    "name": "Hindering",
    "description": "N/A"
  },
  "blocking": {
    "name": "Blocking",
    "description": "This character can move through Blocking terrain."
  },
  "outdoor_blocking": {
    "name": "Outdoor Blocking",
    "description": "This character can move through Outdoor Blocking terrain."
  },
  "destroy_blocking": {
    "name": "Destroy Blocking",
    "description": "This character can move through Blocking terrain. Immediately after movement resolves, destroy all Blocking terrain moved through."
  },
  "characters": {
    "name": "Characters",
    "description": "This character automatically breaks away and can move through squares adjacent to or occupied by opposing characters without stopping."
  },
  "move_through": {
    "name": "Move Through",
    "description": "This character can move through squares occupied by or adjacent to opposing characters without stopping (they still must break away)."
  },
  "water": {
    "name": "Water",
    "description": "N/A"
  },
}

const IMPROVED_TARGETING_LIST = {
  "elevated": {
    "name": "Elevated",
    "description": "Lines of fire drawn by this character are not blocked by Elevated terrain."
  },
  "hindering": {
    "name": "Hindering",
    "description": "Lines of fire drawn by this character can’t be hindered."
  },
  "blocking": {
    "name": "Blocking",
    "description": "Lines of fire drawn by this character are not blocked by Blocking terrain."
  },
  "destroy_blocking": {
    "name": "Destroy Blocking",
    "description": "Once per range attack, this character can draw a line of fire through one piece of Blocking terrain. Immediately after the attack resolves, destroy that piece of Blocking."
  },
  "characters": {
    "name": "Characters",
    "description": "Lines of fire drawn by this character are not blocked by characters."
  },
  "adjacent": {
    "name": "Adjacent",
    "description": "This character can make range attacks while adjacent to opposing characters."
  },
  "water": {
    "name": "Water",
    "description": "N/A"
  },
}