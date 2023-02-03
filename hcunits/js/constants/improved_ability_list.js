const IMPROVED_MOVEMENT_LIST = {
  "elevated": {
    "name": "Elevated",
    "rules": "This character can move up or down across Elevated terrain (without using elevation transition squares)."
  },
  "hindering": {
    "name": "Hindering",
    "rules": "N/A"
  },
  "blocking": {
    "name": "Blocking",
    "rules": "This character can move through Blocking terrain."
  },
  "outdoor_blocking": {
    "name": "Outdoor Blocking",
    "rules": "This character can move through Outdoor Blocking terrain."
  },
  "destroy_blocking": {
    "name": "Destroy Blocking",
    "rules": "This character can move through Blocking terrain. Immediately after movement resolves, destroy all Blocking terrain moved through."
  },
  "characters": {
    "name": "Characters",
    "rules": "This character automatically breaks away and can move through squares adjacent to or occupied by opposing characters without stopping."
  },
  "move_through": {
    "name": "Move Through",
    "rules": "This character can move through squares occupied by or adjacent to opposing characters without stopping (they still must break away)."
  }
}

const IMPROVED_TARGETING_LIST = {
  "elevated": {
    "name": "Elevated",
    "rules": "Lines of fire drawn by this character are not blocked by Elevated terrain."
  },
  "hindering": {
    "name": "Hindering",
    "rules": "Lines of fire drawn by this character can’t be hindered."
  },
  "blocking": {
    "name": "Blocking",
    "rules": "Lines of fire drawn by this character are not blocked by Blocking terrain."
  },
  "destroy_blocking": {
    "name": "Destroy Blocking",
    "rules": "Once per range attack, this character can draw a line of fire through one piece of Blocking terrain. Immediately after the attack resolves, destroy that piece of Blocking."
  },
  "characters": {
    "name": "Characters",
    "rules": "Lines of fire drawn by this character are not blocked by characters."
  },
  "adjacent": {
    "name": "Adjacent",
    "rules": "This character can make range attacks while adjacent to opposing characters."
  }
}