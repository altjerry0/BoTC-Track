/******/ (() => { // webpackBootstrap
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return r; }; var t, r = {}, e = Object.prototype, n = e.hasOwnProperty, o = "function" == typeof Symbol ? Symbol : {}, i = o.iterator || "@@iterator", a = o.asyncIterator || "@@asyncIterator", u = o.toStringTag || "@@toStringTag"; function c(t, r, e, n) { return Object.defineProperty(t, r, { value: e, enumerable: !n, configurable: !n, writable: !n }); } try { c({}, ""); } catch (t) { c = function c(t, r, e) { return t[r] = e; }; } function h(r, e, n, o) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype); return c(a, "_invoke", function (r, e, n) { var o = 1; return function (i, a) { if (3 === o) throw Error("Generator is already running"); if (4 === o) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var u = n.delegate; if (u) { var c = d(u, n); if (c) { if (c === f) continue; return c; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (1 === o) throw o = 4, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = 3; var h = s(r, e, n); if ("normal" === h.type) { if (o = n.done ? 4 : 2, h.arg === f) continue; return { value: h.arg, done: n.done }; } "throw" === h.type && (o = 4, n.method = "throw", n.arg = h.arg); } }; }(r, n, new Context(o || [])), !0), a; } function s(t, r, e) { try { return { type: "normal", arg: t.call(r, e) }; } catch (t) { return { type: "throw", arg: t }; } } r.wrap = h; var f = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var l = {}; c(l, i, function () { return this; }); var p = Object.getPrototypeOf, y = p && p(p(x([]))); y && y !== e && n.call(y, i) && (l = y); var v = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(l); function g(t) { ["next", "throw", "return"].forEach(function (r) { c(t, r, function (t) { return this._invoke(r, t); }); }); } function AsyncIterator(t, r) { function e(o, i, a, u) { var c = s(t[o], t, i); if ("throw" !== c.type) { var h = c.arg, f = h.value; return f && "object" == _typeof(f) && n.call(f, "__await") ? r.resolve(f.__await).then(function (t) { e("next", t, a, u); }, function (t) { e("throw", t, a, u); }) : r.resolve(f).then(function (t) { h.value = t, a(h); }, function (t) { return e("throw", t, a, u); }); } u(c.arg); } var o; c(this, "_invoke", function (t, n) { function i() { return new r(function (r, o) { e(t, n, r, o); }); } return o = o ? o.then(i, i) : i(); }, !0); } function d(r, e) { var n = e.method, o = r.i[n]; if (o === t) return e.delegate = null, "throw" === n && r.i["return"] && (e.method = "return", e.arg = t, d(r, e), "throw" === e.method) || "return" !== n && (e.method = "throw", e.arg = new TypeError("The iterator does not provide a '" + n + "' method")), f; var i = s(o, r.i, e.arg); if ("throw" === i.type) return e.method = "throw", e.arg = i.arg, e.delegate = null, f; var a = i.arg; return a ? a.done ? (e[r.r] = a.value, e.next = r.n, "return" !== e.method && (e.method = "next", e.arg = t), e.delegate = null, f) : a : (e.method = "throw", e.arg = new TypeError("iterator result is not an object"), e.delegate = null, f); } function w(t) { this.tryEntries.push(t); } function m(r) { var e = r[4] || {}; e.type = "normal", e.arg = t, r[4] = e; } function Context(t) { this.tryEntries = [[-1]], t.forEach(w, this), this.reset(!0); } function x(r) { if (null != r) { var e = r[i]; if (e) return e.call(r); if ("function" == typeof r.next) return r; if (!isNaN(r.length)) { var o = -1, a = function e() { for (; ++o < r.length;) if (n.call(r, o)) return e.value = r[o], e.done = !1, e; return e.value = t, e.done = !0, e; }; return a.next = a; } } throw new TypeError(_typeof(r) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, c(v, "constructor", GeneratorFunctionPrototype), c(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = c(GeneratorFunctionPrototype, u, "GeneratorFunction"), r.isGeneratorFunction = function (t) { var r = "function" == typeof t && t.constructor; return !!r && (r === GeneratorFunction || "GeneratorFunction" === (r.displayName || r.name)); }, r.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, c(t, u, "GeneratorFunction")), t.prototype = Object.create(v), t; }, r.awrap = function (t) { return { __await: t }; }, g(AsyncIterator.prototype), c(AsyncIterator.prototype, a, function () { return this; }), r.AsyncIterator = AsyncIterator, r.async = function (t, e, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(h(t, e, n, o), i); return r.isGeneratorFunction(e) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, g(v), c(v, u, "Generator"), c(v, i, function () { return this; }), c(v, "toString", function () { return "[object Generator]"; }), r.keys = function (t) { var r = Object(t), e = []; for (var n in r) e.unshift(n); return function t() { for (; e.length;) if ((n = e.pop()) in r) return t.value = n, t.done = !1, t; return t.done = !0, t; }; }, r.values = x, Context.prototype = { constructor: Context, reset: function reset(r) { if (this.prev = this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(m), !r) for (var e in this) "t" === e.charAt(0) && n.call(this, e) && !isNaN(+e.slice(1)) && (this[e] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0][4]; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(r) { if (this.done) throw r; var e = this; function n(t) { a.type = "throw", a.arg = r, e.next = t; } for (var o = e.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i[4], u = this.prev, c = i[1], h = i[2]; if (-1 === i[0]) return n("end"), !1; if (!c && !h) throw Error("try statement without catch or finally"); if (null != i[0] && i[0] <= u) { if (u < c) return this.method = "next", this.arg = t, n(c), !0; if (u < h) return n(h), !1; } } }, abrupt: function abrupt(t, r) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var n = this.tryEntries[e]; if (n[0] > -1 && n[0] <= this.prev && this.prev < n[2]) { var o = n; break; } } o && ("break" === t || "continue" === t) && o[0] <= r && r <= o[2] && (o = null); var i = o ? o[4] : {}; return i.type = t, i.arg = r, o ? (this.method = "next", this.next = o[2], f) : this.complete(i); }, complete: function complete(t, r) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && r && (this.next = r), f; }, finish: function finish(t) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var e = this.tryEntries[r]; if (e[2] === t) return this.complete(e[4], e[3]), m(e), f; } }, "catch": function _catch(t) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var e = this.tryEntries[r]; if (e[0] === t) { var n = e[4]; if ("throw" === n.type) { var o = n.arg; m(e); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(r, e, n) { return this.delegate = { i: x(r), r: e, n: n }, "next" === this.method && (this.arg = t), f; } }, r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// This is the main script for the popup interface.
// It orchestrates calls to functions defined in userManager.js and sessionManager.js
// Globally accessible filter options for the popup
var currentFilterOptions = {
  officialOnly: false,
  hideCompleted: false
};
document.addEventListener('DOMContentLoaded', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
  var fetchButton, officialOnlyCheckbox, searchInput, exportPlayersButton, importPlayersButton, importFileInput, importStatusDiv, addPlayerButton, clearAllPlayerDataButton, darkModeToggle, sessionListDiv, loadingIndicator, knownPlayersDiv, onlineFavoritesListDiv, onlineFavoritesCountSpan, openInTabButton, fetchStatsSpan, tabButtons, tabContents, latestSessionData, showOfficialOnly, searchTimeout, setLatestSessionData, parseJwt, setDarkMode, waitForUserManagerAndRenderKnownPlayers, themeResult, tokenResponse, showTab, accountTabLoaded, loadAccountTabScript, refreshDisplayedSessions, _refreshDisplayedSessions, applySessionFilters, openInTabBtn;
  return _regeneratorRuntime().wrap(function _callee7$(_context7) {
    while (1) switch (_context7.prev = _context7.next) {
      case 0:
        applySessionFilters = function _applySessionFilters() {
          if (!window.renderSessions) {
            console.error('renderSessions function not found. Cannot re-render with filters.');
            if (sessionListDiv) sessionListDiv.innerHTML = '<p class="error-message">Error applying filter.</p>';
            return;
          }
          if (!latestSessionData) {
            console.warn('No session data available to filter.');
            // Optionally show a message or just do nothing
            if (sessionListDiv) sessionListDiv.innerHTML = '<p>Fetch session data first to apply filters.</p>';
            return;
          }

          // Update global filter options based on current checkbox states
          currentFilterOptions.officialOnly = officialOnlyCheckbox ? officialOnlyCheckbox.checked : false;

          // Display a temporary message while re-rendering
          if (sessionListDiv) {
            sessionListDiv.innerHTML = '<p class="loading-message">Applying filter...</p>';
          }

          // Call renderSessions with existing data and updated filters
          window.renderSessions(latestSessionData, window.playerData,
          // Assumes playerData is up-to-date
          sessionListDiv, currentFilterOptions,
          // Pass the updated filter object
          window.userManager && window.userManager.addPlayer ? window.userManager.addPlayer : function (id, name, score, notes, isFavorite, callback) {
            console.error("userManager.addPlayer is not available. Add operation failed.");
            if (callback) callback(false);
          }, window.userManager && window.userManager.createUsernameHistoryModal ? window.userManager.createUsernameHistoryModal : function (player, currentPlayerData) {
            console.error("userManager.createUsernameHistoryModal is not available.");
            // Potentially return a dummy element or throw error to indicate failure
            return document.createElement('div');
          });
        };
        _refreshDisplayedSessions = function _refreshDisplayedSess2() {
          _refreshDisplayedSessions = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
            var playerDataResponse, addPlayerFunction, createUsernameHistoryModalFunction, fetchAndDisplaySessionsFunc;
            return _regeneratorRuntime().wrap(function _callee6$(_context6) {
              while (1) switch (_context6.prev = _context6.next) {
                case 0:
                  // console.log('[Popup] Refreshing displayed sessions...');
                  if (loadingIndicator) loadingIndicator.style.display = 'block';
                  if (sessionListDiv) sessionListDiv.innerHTML = ''; // Clear previous sessions
                  if (fetchStatsSpan) fetchStatsSpan.textContent = ''; // Clear previous stats

                  // Update currentFilterOptions based on checkbox state
                  currentFilterOptions.officialOnly = officialOnlyCheckbox ? officialOnlyCheckbox.checked : false;

                  // Ensure window.playerData is populated. It should be by the time this is called after initial setup.
                  // If called before initial setup, it might be empty, which sessionManager now handles with a warning.
                  if (window.playerData) {
                    _context6.next = 17;
                    break;
                  }
                  console.warn('[Popup] refreshDisplayedSessions called but window.playerData is not yet initialized.');
                  // Attempt to load it now as a fallback - ideally, popup.js structure ensures it's loaded prior.
                  _context6.prev = 6;
                  _context6.next = 9;
                  return sendMessagePromise({
                    type: 'GET_PLAYER_DATA'
                  });
                case 9:
                  playerDataResponse = _context6.sent;
                  window.playerData = playerDataResponse && playerDataResponse.playerData ? playerDataResponse.playerData : {};
                  // console.log('[Popup] Fallback playerData load completed during refresh.');
                  _context6.next = 17;
                  break;
                case 13:
                  _context6.prev = 13;
                  _context6.t0 = _context6["catch"](6);
                  console.error('[Popup] Error during fallback playerData load:', _context6.t0);
                  window.playerData = {}; // Ensure it's at least an empty object
                case 17:
                  _context6.prev = 17;
                  addPlayerFunction = window.userManager && window.userManager.addPlayer ? window.userManager.addPlayer : function (id, name, score, notes, isFavorite, callback) {
                    console.error("userManager.addPlayer is not available. Add operation failed.");
                    if (callback) callback(false);
                  };
                  createUsernameHistoryModalFunction = window.userManager && window.userManager.createUsernameHistoryModal ? window.userManager.createUsernameHistoryModal : function (player, currentPlayerData) {
                    console.error("userManager.createUsernameHistoryModal is not available.");
                    // Potentially return a dummy element or throw error to indicate failure
                    return document.createElement('div');
                  }; // Check if the function exists on window, if not - try accessing it via a more reliable method
                  fetchAndDisplaySessionsFunc = window.fetchAndDisplaySessions || typeof sessionManager !== 'undefined' && sessionManager.fetchAndDisplaySessions;
                  if (fetchAndDisplaySessionsFunc) {
                    _context6.next = 23;
                    break;
                  }
                  throw new Error('fetchAndDisplaySessions function not found. SessionManager may not be fully loaded.');
                case 23:
                  _context6.next = 25;
                  return fetchAndDisplaySessionsFunc(addPlayerFunction, createUsernameHistoryModalFunction, window.updateOnlineFavoritesListFunc, sessionListDiv, currentFilterOptions, function (sessions, error) {
                    // onCompleteCallback
                    if (loadingIndicator) loadingIndicator.style.display = 'none';
                    if (error) {
                      console.error("[Popup] Error reported by fetchAndDisplaySessions:", error);
                      if (sessionListDiv) sessionListDiv.innerHTML = "<p class='error-message'>Failed to display sessions: ".concat(error, "</p>");
                    } else {
                      // console.log("[Popup] Sessions displayed/updated.");
                      latestSessionData = sessions; // Store the latest session data
                      // After sessions are rendered, update the user management tab if it's active
                      // This ensures player statuses (e.g., online) are current
                      if (document.getElementById('userManagement').classList.contains('active') && window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                        // Use the existing renderKnownPlayers function instead of undefined refreshUserManagementTab
                        window.userManager.renderKnownPlayers(knownPlayersDiv, userSearchInput ? userSearchInput.value : '');
                      }
                    }
                  });
                case 25:
                  _context6.next = 32;
                  break;
                case 27:
                  _context6.prev = 27;
                  _context6.t1 = _context6["catch"](17);
                  console.error("[Popup] Critical error calling fetchAndDisplaySessions:", _context6.t1);
                  if (loadingIndicator) loadingIndicator.style.display = 'none';
                  if (sessionListDiv) sessionListDiv.innerHTML = "<p class='error-message'>A critical error occurred: ".concat(_context6.t1.message, "</p>");
                case 32:
                case "end":
                  return _context6.stop();
              }
            }, _callee6, null, [[6, 13], [17, 27]]);
          }));
          return _refreshDisplayedSessions.apply(this, arguments);
        };
        refreshDisplayedSessions = function _refreshDisplayedSess() {
          return _refreshDisplayedSessions.apply(this, arguments);
        };
        loadAccountTabScript = function _loadAccountTabScript(callback) {
          // Check if already loaded to prevent duplicate loading
          if (accountTabLoaded || document.querySelector('script[src="accountTab.js"]')) {
            console.log("accountTab.js already loaded, skipping duplicate load");
            accountTabLoaded = true;
            if (callback) callback();
            return;
          }
          console.log("Loading accountTab.js dynamically");
          var script = document.createElement('script');
          script.src = 'accountTab.js';
          script.onload = function () {
            accountTabLoaded = true;
            if (callback) callback();
          };
          document.head.appendChild(script);
        };
        showTab = function _showTab(tabName) {
          console.log("Switching to tab: ".concat(tabName));
          document.querySelectorAll('.tab-content').forEach(function (tab) {
            if (tab.id === tabName || tabName === 'account' && tab.id === 'accountTab') {
              tab.style.display = 'block';
              tab.classList.add('active');
            } else {
              tab.style.display = 'none';
              tab.classList.remove('active');
            }
          });
          if (tabName === 'account') {
            console.log("Switching to Account tab");
            loadAccountTabScript(function () {
              console.log("Calling window.initAccountTab");
              if (window.initAccountTab) window.initAccountTab();
            });
          }
        };
        waitForUserManagerAndRenderKnownPlayers = function _waitForUserManagerAn(container, searchTerm) {
          var maxRetries = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 20;
          var delay = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 50;
          if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function' && typeof window.userManager.getOnlinePlayerIds === 'function') {
            window.userManager.renderKnownPlayers(container, searchTerm);
          } else if (maxRetries > 0) {
            setTimeout(function () {
              waitForUserManagerAndRenderKnownPlayers(container, searchTerm, maxRetries - 1, delay);
            }, delay);
          } else {
            console.error('window.userManager.getOnlinePlayerIds is not available after waiting.');
          }
        };
        setDarkMode = function _setDarkMode(isDark) {
          if (isDark) {
            document.body.classList.add('dark-mode');
          } else {
            document.body.classList.remove('dark-mode');
          }
          // Save preference
          var themeToSave = isDark ? 'dark' : 'light';
          chrome.storage.local.set({
            theme: themeToSave
          }, function () {
            if (chrome.runtime.lastError) {
              console.error('Error saving theme preference:', chrome.runtime.lastError);
            }
          });
        };
        parseJwt = function _parseJwt(token) {
          if (!token) {
            console.warn("Attempted to parse a null or empty token.");
            return null;
          }
          try {
            var base64Url = token.split('.')[1];
            if (!base64Url) {
              console.error("Invalid JWT: Missing payload.");
              return null;
            }
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            var decodedToken = JSON.parse(jsonPayload);
            return decodedToken.id || null;
          } catch (error) {
            console.error('Failed to parse JWT:', error);
            return null;
          }
        };
        setLatestSessionData = function _setLatestSessionData(sessions) {
          latestSessionData = sessions;
          window.latestSessionData = sessions;
          console.log('[setLatestSessionData] latestSessionData set:', sessions);
        };
        // Request current game info from background script
        chrome.runtime.sendMessage({
          type: 'GET_CURRENT_GAME_INFO'
        }, function (response) {
          if (response && response.gameInfo) {
            console.log('[Popup] Received current game info:', response.gameInfo);
            window.liveGameInfo = response.gameInfo;
          } else {
            console.log('[Popup] No current game info available');
            window.liveGameInfo = null;
          }
        });

        // Assign core utility functions to window object IMMEDIATELY
        // so they are available even if subsequent async operations fail.
        window.sendMessagePromise = function (message) {
          return new Promise(function (resolve, reject) {
            chrome.runtime.sendMessage(message, function (response) {
              if (chrome.runtime.lastError) {
                // Don't reject if the error is expected (like popup closed before response)
                // but log it as a warning.
                if (chrome.runtime.lastError.message.includes("Extension context invalidated") || chrome.runtime.lastError.message.includes("Could not establish connection") || chrome.runtime.lastError.message.includes("message port closed")) {
                  console.warn("sendMessagePromise: Ignoring expected error - ".concat(chrome.runtime.lastError.message));
                  // Resolve indicating potential issue but not a hard error
                  resolve({
                    error: chrome.runtime.lastError.message,
                    potentiallyClosed: true
                  });
                } else {
                  console.error("sendMessagePromise Runtime Error:", chrome.runtime.lastError.message);
                  reject(chrome.runtime.lastError);
                }
              } else {
                resolve(response);
              }
            });
          });
        };
        window.parseJwt = parseJwt;

        // Button and Controls References
        fetchButton = document.getElementById('fetchButton');
        officialOnlyCheckbox = document.getElementById('officialOnlyCheckbox');
        searchInput = document.getElementById('userSearch');
        exportPlayersButton = document.getElementById('export-players-button');
        importPlayersButton = document.getElementById('import-players-button');
        importFileInput = document.getElementById('import-file-input');
        importStatusDiv = document.getElementById('import-status');
        addPlayerButton = document.getElementById('add-player-button');
        clearAllPlayerDataButton = document.getElementById('clear-all-player-data-button');
        darkModeToggle = document.getElementById('darkModeToggle');
        sessionListDiv = document.getElementById('sessionList');
        loadingIndicator = document.getElementById('loadingIndicator');
        knownPlayersDiv = document.getElementById('knownPlayers');
        onlineFavoritesListDiv = document.getElementById('onlineFavoritesList');
        onlineFavoritesCountSpan = document.getElementById('onlineFavoritesCount');
        openInTabButton = document.getElementById('open-in-tab-btn');
        fetchStatsSpan = document.getElementById('fetchStats'); // Tab References
        tabButtons = document.querySelectorAll('.tab-button');
        tabContents = document.querySelectorAll('.tab-content'); // Content Area References
        // State
        latestSessionData = null;
        showOfficialOnly = false;
        searchTimeout = null; // Utility to keep both variables in sync
        window.setLatestSessionData = setLatestSessionData;

        // Expose latestSessionData globally for online player detection
        window.latestSessionData = latestSessionData;
        // Expose fetchOnlinePlayerIds globally for userManager.js
        window.fetchOnlinePlayerIds = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
          var ids;
          return _regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                console.log('[fetchOnlinePlayerIds] function called');
                console.log('[fetchOnlinePlayerIds] window.latestSessionData:', window.latestSessionData);
                if (window.latestSessionData) {
                  _context.next = 5;
                  break;
                }
                if (!window._fetchOnlinePlayerIdsWarned) {
                  console.warn('[fetchOnlinePlayerIds] Not available: session data is not present.');
                  window._fetchOnlinePlayerIdsWarned = true;
                }
                return _context.abrupt("return", new Set());
              case 5:
                console.log('[fetchOnlinePlayerIds] window.userManager:', window.userManager);
                console.log('[fetchOnlinePlayerIds] window.userManager.getOnlinePlayerIds:', window.userManager ? window.userManager.getOnlinePlayerIds : undefined);
                if (!(window.userManager && typeof window.userManager.getOnlinePlayerIds === 'function')) {
                  _context.next = 12;
                  break;
                }
                ids = window.userManager.getOnlinePlayerIds(window.latestSessionData);
                console.log('[fetchOnlinePlayerIds] latestSessionData:', window.latestSessionData);
                console.log('[fetchOnlinePlayerIds] online IDs:', Array.from(ids));
                return _context.abrupt("return", ids);
              case 12:
                return _context.abrupt("return", new Set());
              case 13:
              case "end":
                return _context.stop();
            }
          }, _callee);
        }));

        // Function to update the online favorites list UI
        window.updateOnlineFavoritesListFunc = function (playerData, onlinePlayersObject) {
          console.log('[updateOnlineFavoritesListFunc] called');

          // CRITICAL DEBUG - Log the entire player data structure
          console.log('[updateOnlineFavoritesListFunc] playerData FULL:', JSON.stringify(playerData, null, 2));
          console.log('[updateOnlineFavoritesListFunc] onlinePlayersObject FULL:', JSON.stringify(onlinePlayersObject, null, 2));
          var onlineFavoritesListDiv = document.getElementById('onlineFavoritesList');
          var onlineFavoritesCountSpan = document.getElementById('onlineFavoritesCount');
          if (!onlineFavoritesListDiv || !onlineFavoritesCountSpan) {
            console.warn('[updateOnlineFavoritesListFunc] Required DOM elements not found');
            return;
          }

          // Clear existing list
          onlineFavoritesListDiv.innerHTML = '';

          // Get favorite players who are currently online
          var onlineFavorites = [];
          var favoriteCount = 0;
          var onlineCount = 0;
          var onlinePlayersByNumericId = {};

          // Check if playerData is valid
          if (!playerData || _typeof(playerData) !== 'object') {
            console.error('[updateOnlineFavoritesListFunc] playerData is invalid:', playerData);
            onlineFavoritesListDiv.innerHTML = '<p>Error: Player data unavailable</p>';
            return;
          }

          // First, restructure the onlinePlayersObject for easier matching
          // Create a lookup by numeric-only IDs
          if (onlinePlayersObject && _typeof(onlinePlayersObject) === 'object') {
            for (var onlinePlayerId in onlinePlayersObject) {
              // Store both the original ID format and a numeric-only version
              var numericId = onlinePlayerId.replace(/\D/g, '');
              onlinePlayersByNumericId[numericId] = onlinePlayersObject[onlinePlayerId];
              onlineCount++;
            }
          } else {
            console.warn('[updateOnlineFavoritesListFunc] onlinePlayersObject is invalid or empty');
          }
          console.log("[updateOnlineFavoritesListFunc] Restructured ".concat(onlineCount, " online players into ").concat(Object.keys(onlinePlayersByNumericId).length, " numeric IDs"));

          // DEBUG: Print sample of the first few player entries
          console.log('[updateOnlineFavoritesListFunc] First 3 player records:');
          var count = 0;
          for (var playerId in playerData) {
            if (count < 3) {
              console.log("Player ID: ".concat(playerId, ", Data:"), playerData[playerId]);
              // Check explicitly for the isFavorite property
              console.log("  Has .isFavorite property: ".concat(playerData[playerId].hasOwnProperty('isFavorite')));
              console.log("  Value of .isFavorite: ".concat(playerData[playerId].isFavorite));
              count++;
            } else {
              break;
            }
          }

          // Find all favorite players
          for (var _playerId in playerData) {
            // Extra safety check
            if (!playerData[_playerId]) continue;

            // Check if player is marked as favorite
            var isFavorite = playerData[_playerId].isFavorite === true;
            if (isFavorite) {
              favoriteCount++;
              console.log("[updateOnlineFavoritesListFunc] Found FAVORITE player: ".concat(playerData[_playerId].name || _playerId, " (ID: ").concat(_playerId, ")"));

              // Get the numeric version of the player ID
              var numericPlayerId = _playerId.replace(/\D/g, '');

              // Check if the player is online using both original and numeric formats
              var isOnlineExact = !!onlinePlayersObject[_playerId];
              var isOnlineNumeric = !!onlinePlayersByNumericId[numericPlayerId];
              var isOnline = isOnlineExact || isOnlineNumeric;

              // Get session name from whichever match worked
              var sessionName = null;
              if (isOnlineExact) {
                sessionName = onlinePlayersObject[_playerId];
              } else if (isOnlineNumeric) {
                sessionName = onlinePlayersByNumericId[numericPlayerId];
              }
              console.log("  Online check - exact match: ".concat(isOnlineExact, ", numeric match: ").concat(isOnlineNumeric));
              if (isOnline) {
                console.log("  \u2705 MATCH! This favorite player is ONLINE: ".concat(playerData[_playerId].name || _playerId, " in session: ").concat(sessionName));
                onlineFavorites.push(_objectSpread({
                  id: _playerId,
                  name: playerData[_playerId].name || _playerId,
                  sessionName: sessionName === true ? "Unknown Session" : sessionName
                }, playerData[_playerId]));
              }
            }
          }
          console.log("[updateOnlineFavoritesListFunc] Stats: ".concat(favoriteCount, " favorites, ").concat(onlineCount, " online, ").concat(onlineFavorites.length, " online favorites"));

          // Update count display
          onlineFavoritesCountSpan.textContent = onlineFavorites.length;

          // Populate the list
          if (onlineFavorites.length > 0) {
            // Clear previous content
            onlineFavoritesListDiv.innerHTML = '';

            // Create simple list of online favorite players
            onlineFavorites.forEach(function (player) {
              var playerItem = document.createElement('div');
              playerItem.className = 'online-favorite-item';

              // Create main player name span
              var nameSpan = document.createElement('span');
              nameSpan.className = 'favorite-player-name';
              nameSpan.textContent = player.name;

              // Create session name span
              var sessionSpan = document.createElement('span');
              sessionSpan.className = 'favorite-player-session';
              sessionSpan.textContent = player.sessionName ? " (".concat(player.sessionName, ")") : '';
              sessionSpan.style.fontSize = '0.9em';
              sessionSpan.style.color = 'var(--text-secondary-color, #777)';
              sessionSpan.style.fontStyle = 'italic';

              // Add name and session to the player item
              playerItem.appendChild(nameSpan);
              playerItem.appendChild(sessionSpan);
              playerItem.style.cursor = 'pointer'; // Show it's clickable

              // Add click handler to navigate to the session when clicked
              playerItem.addEventListener('click', function () {
                var url;
                // If session name is available and not just 'true' or 'Unknown Session'
                if (player.sessionName && player.sessionName !== true && player.sessionName !== 'Unknown Session') {
                  // Convert the session name to a URL-friendly format and join by session name
                  var encodedSessionName = encodeURIComponent(player.sessionName.toLowerCase());
                  url = "https://botc.app/join/".concat(encodedSessionName);
                } else {
                  // URL = Nothing
                  url = "";
                }
                window.open(url, '_blank');
              });
              onlineFavoritesListDiv.appendChild(playerItem);
            });
          } else {
            onlineFavoritesListDiv.innerHTML = '<p>No favorite players currently online.</p>';
          }
          console.log('[updateOnlineFavoritesListFunc] Updated favorites list with', onlineFavorites.length, 'players');
        };

        // Global scope for popup lifecycle
        window.currentUserID = null;
        window.liveGameInfo = null;
        window.playerData = {}; // Initialize playerData

        // Function to parse JWT and extract user ID

        // --- Dark Mode Functionality ---

        // Helper to wait for userManager to be ready before rendering known players

        // --- Search Input Listener (User Management Tab) ---
        if (searchInput) {
          searchInput.addEventListener('input', function () {
            if (searchTimeout) {
              clearTimeout(searchTimeout);
            }
            searchTimeout = setTimeout(function () {
              if (document.getElementById('userManagement').classList.contains('active')) {
                waitForUserManagerAndRenderKnownPlayers(knownPlayersDiv, searchInput.value.trim());
              }
            }, 300);
          });
        } else {
          console.warn('Search input element not found.');
        }

        // --- Initial Async Setup --- 
        _context7.prev = 42;
        _context7.next = 45;
        return new Promise(function (resolve) {
          return chrome.storage.local.get(['theme'], resolve);
        });
      case 45:
        themeResult = _context7.sent;
        if (themeResult && themeResult.theme === 'dark') {
          setDarkMode(true);
          if (darkModeToggle) darkModeToggle.checked = true;
        } else {
          setDarkMode(false);
          if (darkModeToggle) darkModeToggle.checked = false;
        }

        // Fetch Auth Token and parse User ID
        // console.log('[Popup Init] Requesting Auth Token...');
        _context7.next = 49;
        return sendMessagePromise({
          type: 'GET_AUTH_TOKEN'
        });
      case 49:
        tokenResponse = _context7.sent;
        if (tokenResponse && tokenResponse.token) {
          // console.log('[Popup Init] Auth Token received.');
          window.currentUserID = parseJwt(tokenResponse.token);
          // console.log('[Popup Init] Parsed User ID:', window.currentUserID);
        } else {
          console.warn('[Popup Init] No Auth Token received from background.');
          window.currentUserID = null;
        }

        // Fetch initial player data using userManager
        _context7.prev = 51;
        if (!(window.userManager && typeof window.userManager.getAllPlayerData === 'function')) {
          _context7.next = 58;
          break;
        }
        _context7.next = 55;
        return window.userManager.getAllPlayerData();
      case 55:
        window.playerData = _context7.sent;
        _context7.next = 60;
        break;
      case 58:
        console.error('[Popup Init] window.userManager.getAllPlayerData is not available. Initializing window.playerData to empty object.');
        window.playerData = {};
      case 60:
        _context7.next = 66;
        break;
      case 62:
        _context7.prev = 62;
        _context7.t0 = _context7["catch"](51);
        console.error('[Popup Init] Error loading player data via userManager:', _context7.t0);
        window.playerData = {}; // Ensure playerData is an empty object on error
      case 66:
        _context7.next = 75;
        break;
      case 68:
        _context7.prev = 68;
        _context7.t1 = _context7["catch"](42);
        console.error('[Popup Init] Error during initial async setup:', _context7.t1);
        // Ensure defaults are set in case of error
        window.currentUserID = null;
        window.liveGameInfo = null;
        setDarkMode(false);
        if (darkModeToggle) darkModeToggle.checked = false;
      case 75:
        // Dark Mode Toggle Logic (no longer needs to be conditional on settings modal elements)
        if (darkModeToggle && typeof darkModeToggle.addEventListener === 'function') {
          darkModeToggle.addEventListener('change', function () {
            setDarkMode(this.checked);
          });
        } else {
          console.error('darkModeToggle is NOT valid or addEventListener is missing after UI change. This should not happen.');
          // Fallback or further error logging if needed, but the element should exist directly in the header now.
        }

        // --- Proceed with rest of initialization AFTER async setup ---

        // Function to show a specific tab
        // --- Dynamic loader for Account Tab ---
        accountTabLoaded = false;
        // Tab Button Listeners
        tabButtons.forEach(function (button) {
          button.addEventListener('click', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
            var tabName;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  tabButtons.forEach(function (btn) {
                    return btn.classList.remove('active');
                  });
                  button.classList.add('active');
                  tabName = button.dataset.tab;
                  showTab(tabName);
                  // Render known players when switching to userManagement tab
                  if (!(tabName === 'userManagement')) {
                    _context2.next = 14;
                    break;
                  }
                  console.log('Switching to userManagement tab');
                  if (window.latestSessionData) {
                    _context2.next = 12;
                    break;
                  }
                  console.log('[TabSwitch] No session data, fetching sessions before rendering known players...');
                  _context2.next = 10;
                  return window.fetchAndDisplaySessions(window.userManager && window.userManager.addPlayer ? window.userManager.addPlayer : function (id, name, score, notes, isFavorite, callback) {
                    console.error("userManager.addPlayer is not available. Add operation failed.");
                    if (callback) callback(false);
                  }, window.userManager && window.userManager.createUsernameHistoryModal ? window.userManager.createUsernameHistoryModal : function (player, currentPlayerData) {
                    console.error("userManager.createUsernameHistoryModal is not available.");
                    return document.createElement('div');
                  }, window.updateOnlineFavoritesListFunc, sessionListDiv, {
                    officialOnly: showOfficialOnly
                  }, function (sessions, finalPlayerData) {
                    latestSessionData = sessions;
                    window.latestSessionData = sessions;
                    if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                      window.userManager.renderKnownPlayers(knownPlayersDiv, searchInput ? searchInput.value.trim() : '');
                    }
                  });
                case 10:
                  _context2.next = 14;
                  break;
                case 12:
                  console.log('Rendering known players (session data already available)');
                  if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                    window.userManager.renderKnownPlayers(knownPlayersDiv, searchInput ? searchInput.value.trim() : '');
                  }
                case 14:
                case "end":
                  return _context2.stop();
              }
            }, _callee2);
          })));
        });

        // Function to refresh the session display

        // --- Initialize Event Listeners ---

        // Search Input Listener (User Management Tab)
        if (searchInput) {
          searchInput.addEventListener('input', function () {
            // Clear the previous timeout if there is one
            if (searchTimeout) {
              clearTimeout(searchTimeout);
            }
            searchTimeout = setTimeout(function () {
              if (document.getElementById('userManagement').classList.contains('active')) {
                waitForUserManagerAndRenderKnownPlayers(knownPlayersDiv, searchInput.value.trim());
              }
            }, 300);
          });
        }
        fetchButton.addEventListener('click', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
          return _regeneratorRuntime().wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
              case 0:
                if (sessionListDiv) {
                  sessionListDiv.innerHTML = '<p class="loading-message">Fetching sessions...</p>';
                }
                if (loadingIndicator) loadingIndicator.style.display = 'block';
                if (sessionListDiv) sessionListDiv.style.display = 'none';
                _context3.next = 5;
                return window.fetchAndDisplaySessions(window.userManager && window.userManager.addPlayer ? window.userManager.addPlayer : function (id, name, score, notes, isFavorite, callback) {
                  console.error("userManager.addPlayer is not available. Add operation failed.");
                  if (callback) callback(false);
                }, window.userManager && window.userManager.createUsernameHistoryModal ? window.userManager.createUsernameHistoryModal : function (player, currentPlayerData) {
                  console.error("userManager.createUsernameHistoryModal is not available.");
                  // Potentially return a dummy element or throw error to indicate failure
                  return document.createElement('div');
                }, window.updateOnlineFavoritesListFunc, sessionListDiv, {
                  officialOnly: showOfficialOnly
                }, function (sessions, finalPlayerData) {
                  setLatestSessionData(sessions);
                  if (loadingIndicator) loadingIndicator.style.display = 'none';
                  if (sessionListDiv) sessionListDiv.style.display = 'block';
                  // --- Force re-render of User Management tab if active ---
                  var userManagementTab = document.getElementById('userManagement');
                  if (userManagementTab && userManagementTab.classList.contains('active')) {
                    waitForUserManagerAndRenderKnownPlayers(knownPlayersDiv, searchInput ? searchInput.value.trim() : '');
                  }
                });
              case 5:
              case "end":
                return _context3.stop();
            }
          }, _callee3);
        })));

        // --- Filter Checkbox Listeners ---

        // Helper function to re-render sessions with current filters

        // Listener for 'Official Games Only' checkbox
        if (officialOnlyCheckbox) {
          officialOnlyCheckbox.addEventListener('change', applySessionFilters);
        } else {
          console.warn("'officialOnlyCheckbox' not found.");
        }

        // --- End Filter Checkbox Listeners ---

        // Add Player Manually Button (Handles both Add and Update via window.addPlayer)
        if (addPlayerButton) {
          addPlayerButton.innerHTML = '<img src="../icons/addbutton.svg" alt="Add Player" class="button-icon" /> Add';
          addPlayerButton.title = 'Add Player Manually';
          addPlayerButton.addEventListener('click', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
            return _regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  if (window.userManager && typeof window.userManager.editPlayerDetails === 'function') {
                    window.userManager.editPlayerDetails(null, true, function () {
                      if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                        window.userManager.renderKnownPlayers(knownPlayersDiv, searchInput.value.trim());
                      } else {
                        console.error("window.userManager.renderKnownPlayers is not available for callback.");
                      }
                    });
                  } else {
                    console.error("window.userManager.editPlayerDetails is not available.");
                  }
                case 1:
                case "end":
                  return _context4.stop();
              }
            }, _callee4);
          })));
        } else {
          console.warn('Add Player Manually button not found.');
        }

        // --- Export/Import Buttons ---
        if (exportPlayersButton) {
          exportPlayersButton.addEventListener('click', function () {
            if (typeof window.exportPlayerDataCSV === 'function') {
              // Assuming exportPlayerDataCSV uses window.playerData internally or we pass it
              // Let's assume it uses window.playerData for now.
              window.exportPlayerDataCSV(window.playerData);
            } else {
              console.error('Export function (window.exportPlayerDataCSV) not found.');
              ModalManager.showAlert('Error', 'Export functionality is currently unavailable.');
            }
          });
        } else {
          console.warn('Export players button not found.');
        }
        if (importPlayersButton && importFileInput) {
          importPlayersButton.addEventListener('click', function () {
            importFileInput.click(); // Trigger the hidden file input
          });
          importFileInput.addEventListener('change', function (event) {
            var file = event.target.files[0];
            if (file) {
              // Make the successCallback async to use await inside
              var successCallback = /*#__PURE__*/function () {
                var _ref6 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(parsedData) {
                  return _regeneratorRuntime().wrap(function _callee5$(_context5) {
                    while (1) switch (_context5.prev = _context5.next) {
                      case 0:
                        _context5.prev = 0;
                        _context5.next = 3;
                        return window.replaceAllPlayerDataAndSave(parsedData);
                      case 3:
                        // Code that was previously in the inner callback now runs after await
                        importStatusDiv.textContent = 'Player data imported successfully! Reloading list...';
                        if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                          window.userManager.renderKnownPlayers(knownPlayersDiv, ''); // Re-render with empty search
                        } else {
                          console.error("window.userManager.renderKnownPlayers is not available for callback after clearing data.");
                        }
                        refreshDisplayedSessions(); // Refresh session display as well
                        _context5.next = 14;
                        break;
                      case 8:
                        _context5.prev = 8;
                        _context5.t0 = _context5["catch"](0);
                        console.error('Error processing imported data:', _context5.t0);
                        importStatusDiv.textContent = 'Error saving imported data. Check console.';
                        importStatusDiv.className = 'import-status-message error';
                        importStatusDiv.style.display = 'block';
                      case 14:
                      case "end":
                        return _context5.stop();
                    }
                  }, _callee5, null, [[0, 8]]);
                }));
                return function successCallback(_x) {
                  return _ref6.apply(this, arguments);
                };
              }();
              window.importPlayerDataCSV(file, successCallback, function (message, isError) {
                importStatusDiv.textContent = message;
                importStatusDiv.className = "import-status-message ".concat(isError ? 'error' : 'success');
                importStatusDiv.style.display = 'block';
              });
            } else {
              importStatusDiv.textContent = 'No file selected.';
              importStatusDiv.className = 'import-status-message error';
              importStatusDiv.style.display = 'block';
            }
          });
        } else {
          console.warn('Import Players button, file input, or status div not found.');
        }
        if (clearAllPlayerDataButton) {
          clearAllPlayerDataButton.addEventListener('click', function () {
            console.log('Clear all player data button clicked');

            // Define confirm and cancel handlers first
            var handleConfirm = function handleConfirm() {
              console.log('Clear data confirmed by user');
              if (window.userManager && typeof window.userManager.replaceAllPlayerDataAndSave === 'function') {
                console.log('Calling replaceAllPlayerDataAndSave');
                window.userManager.replaceAllPlayerDataAndSave({}, function (success) {
                  if (success) {
                    console.log('All player data cleared successfully.');
                    ModalManager.showNotification("Success", "All player data has been cleared.", 2000);
                    if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                      window.userManager.renderKnownPlayers(knownPlayersDiv, ''); // Re-render with empty search
                    } else {
                      console.error("window.userManager.renderKnownPlayers is not available for callback after clearing data.");
                    }
                    refreshDisplayedSessions(); // Refresh session display as well
                  } else {
                    ModalManager.showNotification("Error", "Failed to clear player data.", 3000);
                  }
                });
              } else {
                console.error("window.userManager.replaceAllPlayerDataAndSave is not available.");
                ModalManager.showNotification("Critical Error", "Clear data function not found. Please reload the extension.", 3000);
              }
            };
            var handleCancel = function handleCancel() {
              console.log('Clear data cancelled by user');
            };

            // Call the confirm modal with our properly defined handlers
            ModalManager.showConfirm("Clear Player Data", "Are you sure you want to delete ALL player data? This action cannot be undone.", handleConfirm, handleCancel);
          });
        } else {
          console.warn('Clear all player data button not found.');
        }

        // --- Initialization Sequence ---

        // Initial setup
        refreshDisplayedSessions();

        // Show the default tab (sessions)
        showTab('sessions');

        // --- Event Listener for Open in Tab --- 
        openInTabBtn = document.getElementById('open-in-tab-btn');
        if (openInTabBtn) {
          openInTabBtn.addEventListener('click', function () {
            chrome.tabs.create({
              url: chrome.runtime.getURL("src/popup/popup.html")
            });
          });
        } else {
          console.error('Could not find the #open-in-tab-btn element.');
        }

        // Add listener for live game info updates from background script
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
          if (request.type === 'LIVE_GAME_INFO_UPDATED') {
            // console.log('[Popup] Received LIVE_GAME_INFO_UPDATED:', JSON.stringify(request.payload, null, 2));
            var oldLiveGameInfoString = JSON.stringify(window.liveGameInfo);
            window.liveGameInfo = request.payload;
            var newLiveGameInfoString = JSON.stringify(window.liveGameInfo);
            if (newLiveGameInfoString !== oldLiveGameInfoString) {
              console.log('[Popup] Live game info has changed. Refreshing session display.');
              refreshDisplayedSessions();
            } else {
              console.log('[Popup] Live game info received, but no change detected. No refresh needed.');
            }
            // sendResponse({status: "Popup processed LIVE_GAME_INFO_UPDATED"}); // Optional: send response if needed
            return true; // Keep channel open for potential async response, good practice
          }
          return false; // For synchronous messages or if not handling this specific message type
        });
      case 90:
      case "end":
        return _context7.stop();
    }
  }, _callee7, null, [[42, 68], [51, 62]]);
})));
/******/ })()
;