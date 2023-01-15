const RARITY_COMMON_COLOR = "white";
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

const STYLE_RED = "color:black; background-color: #fe0000;";
const STYLE_ORANGE = "color:black; background-color: #ffc000;";
const STYLE_YELLOW = "color:black; background-color: #ffff00;";
const STYLE_LIGHT_GREEN = "color:black; background-color: #92d14f;";
const STYLE_GREEN = "color:black; background-color: #00af50;";
const STYLE_LIGHT_BLUE = "color:black; background-color: #01b0f1;";
const STYLE_BLUE = "color:white; background-color: #0071c1;";
const STYLE_PURPLE = "color:white; background-color: #7030a0;";
const STYLE_PINK = "color:black; background-color: #ffcccc;";
const STYLE_BROWN = "color:white; background-color: #9a6600;";
const STYLE_BLACK = "color:white; background-color: black;";
const STYLE_GRAY = "color:white; background-color: #7f7f7f;";
const STYLE_WHITE = "color:black; background-color: white; border: 2px solid black;";

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;")
         .replace(/’/g, "&#039;");
}