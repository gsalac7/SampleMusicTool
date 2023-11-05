/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./main.js":
/*!*****************!*\
  !*** ./main.js ***!
  \*****************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("// main.js\nvar _require = __webpack_require__(/*! electron */ \"./node_modules/electron/index.js\"),\n  app = _require.app,\n  BrowserWindow = _require.BrowserWindow;\nfunction createWindow() {\n  // Create the browser window.\n  var win = new BrowserWindow({\n    width: 800,\n    height: 600,\n    webPreferences: {\n      nodeIntegration: true\n    }\n  });\n\n  // Load your HTML file.\n  win.loadFile('public/index.html');\n}\n\n// This method will be called when Electron has finished initialization.\napp.whenReady().then(createWindow);\n\n// Quit when all windows are closed (except on macOS).\napp.on('window-all-closed', function () {\n  if (process.platform !== 'darwin') app.quit();\n});\n\n//# sourceURL=webpack:///./main.js?");

/***/ }),

/***/ "./node_modules/electron/index.js":
/*!****************************************!*\
  !*** ./node_modules/electron/index.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("var __dirname = \"/\";\nconst fs = __webpack_require__(Object(function webpackMissingModule() { var e = new Error(\"Cannot find module 'fs'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));\nconst path = __webpack_require__(Object(function webpackMissingModule() { var e = new Error(\"Cannot find module 'path'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));\n\nconst pathFile = path.join(__dirname, 'path.txt');\n\nfunction getElectronPath () {\n  let executablePath;\n  if (fs.existsSync(pathFile)) {\n    executablePath = fs.readFileSync(pathFile, 'utf-8');\n  }\n  if (process.env.ELECTRON_OVERRIDE_DIST_PATH) {\n    return path.join(process.env.ELECTRON_OVERRIDE_DIST_PATH, executablePath || 'electron');\n  }\n  if (executablePath) {\n    return path.join(__dirname, 'dist', executablePath);\n  } else {\n    throw new Error('Electron failed to install correctly, please delete node_modules/electron and try installing again');\n  }\n}\n\nmodule.exports = getElectronPath();\n\n\n//# sourceURL=webpack:///./node_modules/electron/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./main.js");
/******/ 	
/******/ })()
;