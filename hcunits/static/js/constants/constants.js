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

const COLOR_MAP = {
  "red": COLOR_RED,
  "orange": COLOR_ORANGE,
  "yellow": COLOR_YELLOW,
  "lightgreen": COLOR_LIGHT_GREEN,
  "green": COLOR_GREEN,
  "lightblue": COLOR_LIGHT_BLUE,
  "blue": COLOR_BLUE,
  "purple": COLOR_PURPLE,
  "pink": COLOR_PINK,
  "brown": COLOR_BROWN,
  "black": COLOR_BLACK,
  "gray": COLOR_GRAY,
  "white": COLOR_WHITE,
}
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

// This constant is first indexed by the number of point values,
// then the order of colors corresponds to the color of each point value.
const POINT_VALUE_COLORS = [
  [COLOR_WHITE],
  [COLOR_GREEN, COLOR_RED],
  [COLOR_RED, COLOR_BLUE, COLOR_YELLOW],
  [COLOR_RED, COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE],
  [COLOR_WHITE, COLOR_RED, COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE],
];

// This constant is first indexed by the number of starting lines,
// then the order of colors corresponds to the color of each line.
const STARTING_LINE_COLORS = [
  [COLOR_GREEN],
  [COLOR_GREEN, COLOR_RED],
  [COLOR_RED, COLOR_BLUE, COLOR_YELLOW],
  [COLOR_RED, COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE],
  [COLOR_GREEN, COLOR_RED, COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE],
];


function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;")
         .replace(/’/g, "&#039;");
}

function getQueryParam(name) {
  const url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  var results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function updateQueryParams(queryParamList) {
  var queryString = "";
  if (queryParamList.length > 0) {
    for (const queryParam of queryParamList) {
      if (queryString.length == 0) {
        queryString = "?";
      } else {
        queryString += "&";
      }
      queryString += queryParam;
    }
  }
  window.history.replaceState(null, null, queryString);
}