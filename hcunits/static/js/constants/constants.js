const RARITY_COMMON_COLOR = "black";
const RARITY_UNCOMMON_COLOR = "#6ebd45";
const RARITY_RARE_COLOR = "#a7bdc8";
const RARITY_SUPER_RARE_COLOR = "#ffd503";
const RARITY_CHASE_COLOR = "#ef8322";
const RARITY_ULTRA_CHASE_COLOR = "#00a1df";
const RARITY_TO_COLOR = {
  "common": RARITY_COMMON_COLOR,
  "uncommon": RARITY_UNCOMMON_COLOR,
  "rare": RARITY_RARE_COLOR,
  "super_rare": RARITY_SUPER_RARE_COLOR,
  "chase": RARITY_CHASE_COLOR,
  "ultra_chase": RARITY_ULTRA_CHASE_COLOR
};

const COLOR_RED = "#fe0000";
const COLOR_ORANGE = "#ffc000";
const COLOR_YELLOW = "#ffff00";
const COLOR_LIGHT_GREEN = "#92d14f";
const COLOR_GREEN = "#00af50";
const COLOR_LIGHT_BLUE = "#01b0f1";
const COLOR_BLUE = "#0071c1";
const COLOR_PURPLE = "#7030a0";
const COLOR_PINK = "#ffcccc";
const COLOR_BROWN = "#9a6600";
const COLOR_BLACK = "black";
const COLOR_GRAY = "#7f7f7f";
const COLOR_WHITE = "white";

const STYLE_RED = "color:black; background-color: " + COLOR_RED + ";";
const STYLE_ORANGE = "color:black; background-color: " + COLOR_ORANGE + ";";
const STYLE_YELLOW = "color:black; background-color: " + COLOR_YELLOW + ";";
const STYLE_LIGHT_GREEN = "color:black; background-color: " + COLOR_LIGHT_GREEN + ";";
const STYLE_GREEN = "color:black; background-color: " + COLOR_GREEN + ";";
const STYLE_LIGHT_BLUE = "color:black; background-color: " + COLOR_LIGHT_BLUE + ";";
const STYLE_BLUE = "color:white; background-color: " + COLOR_BLUE + ";";
const STYLE_PURPLE = "color:white; background-color: " + COLOR_PURPLE + ";";
const STYLE_PINK = "color:black; background-color: " + COLOR_PINK + ";";
const STYLE_BROWN = "color:white; background-color: " + COLOR_BROWN + ";";
const STYLE_BLACK = "color:white; background-color:" + COLOR_BLACK + ";";
const STYLE_GRAY = "color:white; background-color: " + COLOR_GRAY + ";";
const STYLE_WHITE = "color:black; background-color: " + COLOR_WHITE + "; border: 2px solid black;";

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;")
         .replace(/’/g, "&#039;");
}

// This constant is first indexed by the number of point values,
// then the order of colors corresponds to the color of each point value.
const POINT_VALUE_COLORS = [
  [],
  [COLOR_WHITE],
  [COLOR_GREEN, COLOR_RED],
  [COLOR_RED, COLOR_BLUE, COLOR_YELLOW],
  [COLOR_RED, COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE],
];

// This constant is first indexed by the number of starting lines,
// then the order of colors corresponds to the color of each line.
const STARTING_LINE_COLORS = [
  [],
  [COLOR_GREEN],
  [COLOR_GREEN, COLOR_RED],
  [COLOR_RED, COLOR_BLUE, COLOR_YELLOW],
  [COLOR_RED, COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE],
];