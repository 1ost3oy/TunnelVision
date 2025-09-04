/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/ansi-color";
exports.ids = ["vendor-chunks/ansi-color"];
exports.modules = {

/***/ "(action-browser)/./node_modules/ansi-color/lib/ansi-color.js":
/*!***************************************************!*\
  !*** ./node_modules/ansi-color/lib/ansi-color.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("// ANSI color code outputs for strings\n\nvar ANSI_CODES = {\n  \"off\": 0,\n  \"bold\": 1,\n  \"italic\": 3,\n  \"underline\": 4,\n  \"blink\": 5,\n  \"inverse\": 7,\n  \"hidden\": 8,\n  \"black\": 30,\n  \"red\": 31,\n  \"green\": 32,\n  \"yellow\": 33,\n  \"blue\": 34,\n  \"magenta\": 35,\n  \"cyan\": 36,\n  \"white\": 37,\n  \"black_bg\": 40,\n  \"red_bg\": 41,\n  \"green_bg\": 42,\n  \"yellow_bg\": 43,\n  \"blue_bg\": 44,\n  \"magenta_bg\": 45,\n  \"cyan_bg\": 46,\n  \"white_bg\": 47\n};\n\nexports.set = function(str, color) {\n  if(!color) return str;\n\n  var color_attrs = color.split(\"+\");\n  var ansi_str = \"\";\n  for(var i=0, attr; attr = color_attrs[i]; i++) {\n    ansi_str += \"\\033[\" + ANSI_CODES[attr] + \"m\";\n  }\n  ansi_str += str + \"\\033[\" + ANSI_CODES[\"off\"] + \"m\";\n  return ansi_str;\n};//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFjdGlvbi1icm93c2VyKS8uL25vZGVfbW9kdWxlcy9hbnNpLWNvbG9yL2xpYi9hbnNpLWNvbG9yLmpzIiwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFdBQVc7QUFDWDs7QUFFQTtBQUNBO0FBQ0EscUJBQXFCLHVCQUF1QjtBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXGFtaW5fXFxEb3dubG9hZHNcXENvbXByZXNzZWRcXFR1bm5lbFZpc2lvblxcbm9kZV9tb2R1bGVzXFxhbnNpLWNvbG9yXFxsaWJcXGFuc2ktY29sb3IuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQU5TSSBjb2xvciBjb2RlIG91dHB1dHMgZm9yIHN0cmluZ3NcblxudmFyIEFOU0lfQ09ERVMgPSB7XG4gIFwib2ZmXCI6IDAsXG4gIFwiYm9sZFwiOiAxLFxuICBcIml0YWxpY1wiOiAzLFxuICBcInVuZGVybGluZVwiOiA0LFxuICBcImJsaW5rXCI6IDUsXG4gIFwiaW52ZXJzZVwiOiA3LFxuICBcImhpZGRlblwiOiA4LFxuICBcImJsYWNrXCI6IDMwLFxuICBcInJlZFwiOiAzMSxcbiAgXCJncmVlblwiOiAzMixcbiAgXCJ5ZWxsb3dcIjogMzMsXG4gIFwiYmx1ZVwiOiAzNCxcbiAgXCJtYWdlbnRhXCI6IDM1LFxuICBcImN5YW5cIjogMzYsXG4gIFwid2hpdGVcIjogMzcsXG4gIFwiYmxhY2tfYmdcIjogNDAsXG4gIFwicmVkX2JnXCI6IDQxLFxuICBcImdyZWVuX2JnXCI6IDQyLFxuICBcInllbGxvd19iZ1wiOiA0MyxcbiAgXCJibHVlX2JnXCI6IDQ0LFxuICBcIm1hZ2VudGFfYmdcIjogNDUsXG4gIFwiY3lhbl9iZ1wiOiA0NixcbiAgXCJ3aGl0ZV9iZ1wiOiA0N1xufTtcblxuZXhwb3J0cy5zZXQgPSBmdW5jdGlvbihzdHIsIGNvbG9yKSB7XG4gIGlmKCFjb2xvcikgcmV0dXJuIHN0cjtcblxuICB2YXIgY29sb3JfYXR0cnMgPSBjb2xvci5zcGxpdChcIitcIik7XG4gIHZhciBhbnNpX3N0ciA9IFwiXCI7XG4gIGZvcih2YXIgaT0wLCBhdHRyOyBhdHRyID0gY29sb3JfYXR0cnNbaV07IGkrKykge1xuICAgIGFuc2lfc3RyICs9IFwiXFwwMzNbXCIgKyBBTlNJX0NPREVTW2F0dHJdICsgXCJtXCI7XG4gIH1cbiAgYW5zaV9zdHIgKz0gc3RyICsgXCJcXDAzM1tcIiArIEFOU0lfQ09ERVNbXCJvZmZcIl0gKyBcIm1cIjtcbiAgcmV0dXJuIGFuc2lfc3RyO1xufTsiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(action-browser)/./node_modules/ansi-color/lib/ansi-color.js\n");

/***/ })

};
;