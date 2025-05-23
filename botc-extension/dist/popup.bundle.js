/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/popup/userManager.js
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return r; }; var t, r = {}, e = Object.prototype, n = e.hasOwnProperty, o = "function" == typeof Symbol ? Symbol : {}, i = o.iterator || "@@iterator", a = o.asyncIterator || "@@asyncIterator", u = o.toStringTag || "@@toStringTag"; function c(t, r, e, n) { return Object.defineProperty(t, r, { value: e, enumerable: !n, configurable: !n, writable: !n }); } try { c({}, ""); } catch (t) { c = function c(t, r, e) { return t[r] = e; }; } function h(r, e, n, o) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype); return c(a, "_invoke", function (r, e, n) { var o = 1; return function (i, a) { if (3 === o) throw Error("Generator is already running"); if (4 === o) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var u = n.delegate; if (u) { var c = d(u, n); if (c) { if (c === f) continue; return c; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (1 === o) throw o = 4, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = 3; var h = s(r, e, n); if ("normal" === h.type) { if (o = n.done ? 4 : 2, h.arg === f) continue; return { value: h.arg, done: n.done }; } "throw" === h.type && (o = 4, n.method = "throw", n.arg = h.arg); } }; }(r, n, new Context(o || [])), !0), a; } function s(t, r, e) { try { return { type: "normal", arg: t.call(r, e) }; } catch (t) { return { type: "throw", arg: t }; } } r.wrap = h; var f = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var l = {}; c(l, i, function () { return this; }); var p = Object.getPrototypeOf, y = p && p(p(x([]))); y && y !== e && n.call(y, i) && (l = y); var v = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(l); function g(t) { ["next", "throw", "return"].forEach(function (r) { c(t, r, function (t) { return this._invoke(r, t); }); }); } function AsyncIterator(t, r) { function e(o, i, a, u) { var c = s(t[o], t, i); if ("throw" !== c.type) { var h = c.arg, f = h.value; return f && "object" == _typeof(f) && n.call(f, "__await") ? r.resolve(f.__await).then(function (t) { e("next", t, a, u); }, function (t) { e("throw", t, a, u); }) : r.resolve(f).then(function (t) { h.value = t, a(h); }, function (t) { return e("throw", t, a, u); }); } u(c.arg); } var o; c(this, "_invoke", function (t, n) { function i() { return new r(function (r, o) { e(t, n, r, o); }); } return o = o ? o.then(i, i) : i(); }, !0); } function d(r, e) { var n = e.method, o = r.i[n]; if (o === t) return e.delegate = null, "throw" === n && r.i["return"] && (e.method = "return", e.arg = t, d(r, e), "throw" === e.method) || "return" !== n && (e.method = "throw", e.arg = new TypeError("The iterator does not provide a '" + n + "' method")), f; var i = s(o, r.i, e.arg); if ("throw" === i.type) return e.method = "throw", e.arg = i.arg, e.delegate = null, f; var a = i.arg; return a ? a.done ? (e[r.r] = a.value, e.next = r.n, "return" !== e.method && (e.method = "next", e.arg = t), e.delegate = null, f) : a : (e.method = "throw", e.arg = new TypeError("iterator result is not an object"), e.delegate = null, f); } function w(t) { this.tryEntries.push(t); } function m(r) { var e = r[4] || {}; e.type = "normal", e.arg = t, r[4] = e; } function Context(t) { this.tryEntries = [[-1]], t.forEach(w, this), this.reset(!0); } function x(r) { if (null != r) { var e = r[i]; if (e) return e.call(r); if ("function" == typeof r.next) return r; if (!isNaN(r.length)) { var o = -1, a = function e() { for (; ++o < r.length;) if (n.call(r, o)) return e.value = r[o], e.done = !1, e; return e.value = t, e.done = !0, e; }; return a.next = a; } } throw new TypeError(_typeof(r) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, c(v, "constructor", GeneratorFunctionPrototype), c(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = c(GeneratorFunctionPrototype, u, "GeneratorFunction"), r.isGeneratorFunction = function (t) { var r = "function" == typeof t && t.constructor; return !!r && (r === GeneratorFunction || "GeneratorFunction" === (r.displayName || r.name)); }, r.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, c(t, u, "GeneratorFunction")), t.prototype = Object.create(v), t; }, r.awrap = function (t) { return { __await: t }; }, g(AsyncIterator.prototype), c(AsyncIterator.prototype, a, function () { return this; }), r.AsyncIterator = AsyncIterator, r.async = function (t, e, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(h(t, e, n, o), i); return r.isGeneratorFunction(e) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, g(v), c(v, u, "Generator"), c(v, i, function () { return this; }), c(v, "toString", function () { return "[object Generator]"; }), r.keys = function (t) { var r = Object(t), e = []; for (var n in r) e.unshift(n); return function t() { for (; e.length;) if ((n = e.pop()) in r) return t.value = n, t.done = !1, t; return t.done = !0, t; }; }, r.values = x, Context.prototype = { constructor: Context, reset: function reset(r) { if (this.prev = this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(m), !r) for (var e in this) "t" === e.charAt(0) && n.call(this, e) && !isNaN(+e.slice(1)) && (this[e] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0][4]; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(r) { if (this.done) throw r; var e = this; function n(t) { a.type = "throw", a.arg = r, e.next = t; } for (var o = e.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i[4], u = this.prev, c = i[1], h = i[2]; if (-1 === i[0]) return n("end"), !1; if (!c && !h) throw Error("try statement without catch or finally"); if (null != i[0] && i[0] <= u) { if (u < c) return this.method = "next", this.arg = t, n(c), !0; if (u < h) return n(h), !1; } } }, abrupt: function abrupt(t, r) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var n = this.tryEntries[e]; if (n[0] > -1 && n[0] <= this.prev && this.prev < n[2]) { var o = n; break; } } o && ("break" === t || "continue" === t) && o[0] <= r && r <= o[2] && (o = null); var i = o ? o[4] : {}; return i.type = t, i.arg = r, o ? (this.method = "next", this.next = o[2], f) : this.complete(i); }, complete: function complete(t, r) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && r && (this.next = r), f; }, finish: function finish(t) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var e = this.tryEntries[r]; if (e[2] === t) return this.complete(e[4], e[3]), m(e), f; } }, "catch": function _catch(t) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var e = this.tryEntries[r]; if (e[0] === t) { var n = e[4]; if ("throw" === n.type) { var o = n.arg; m(e); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(r, e, n) { return this.delegate = { i: x(r), r: e, n: n }, "next" === this.method && (this.arg = t), f; } }, r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * User Manager Module
 * Handles all user-related functionality including:
 * - Storing and retrieving user data
 * - Username history tracking
 * - User interface for managing players
 */



// Store reference to player data
var allPlayerData = null;

/**
 * Load player data from Chrome storage.
 * @returns {Promise<Object>} A promise that resolves with the player data object.
 */
function loadPlayerData() {
  return _loadPlayerData.apply(this, arguments);
}
/**
 * Save player data to Chrome storage.
 * @param {Object} playerData - Player data to save.
 * @returns {Promise<void>} A promise that resolves when saving is complete.
 */
function _loadPlayerData() {
  _loadPlayerData = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          return _context.abrupt("return", new Promise(function (resolve, reject) {
            chrome.storage.local.get('playerData', function (data) {
              if (chrome.runtime.lastError) {
                console.error("Error loading playerData from storage:", chrome.runtime.lastError.message);
                // Resolve with an empty object in case of error to prevent breaking subsequent logic
                allPlayerData = {};
                resolve({});
              } else {
                allPlayerData = data.playerData || {};
                resolve(JSON.parse(JSON.stringify(allPlayerData))); // Return deep copy
              }
            });
          }));
        case 1:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _loadPlayerData.apply(this, arguments);
}
function savePlayerData(_x) {
  return _savePlayerData.apply(this, arguments);
}
/**
 * Retrieves a deep copy of all player data from the in-memory cache.
 * Loads it from storage if the cache is not yet initialized.
 * @returns {Promise<Object>} A deep copy of the player data.
 */
function _savePlayerData() {
  _savePlayerData = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(playerData) {
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          return _context2.abrupt("return", new Promise(function (resolve, reject) {
            allPlayerData = JSON.parse(JSON.stringify(playerData)); // Update cache with deep copy
            chrome.storage.local.set({
              playerData: allPlayerData
            }, function () {
              if (chrome.runtime.lastError) {
                console.error("Error saving playerData to storage:", chrome.runtime.lastError.message);
                reject(chrome.runtime.lastError);
              } else {
                resolve(); // Resolve promise on successful save
              }
            });
          }));
        case 1:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _savePlayerData.apply(this, arguments);
}
function getAllPlayerData() {
  return _getAllPlayerData.apply(this, arguments);
}
/**
 * Format timestamp to readable date and time
 * @param {number} timestamp - Timestamp to format
 * @returns {string} Formatted date and time
 */
function _getAllPlayerData() {
  _getAllPlayerData = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          if (!(allPlayerData === null)) {
            _context3.next = 3;
            break;
          }
          _context3.next = 3;
          return loadPlayerData();
        case 3:
          return _context3.abrupt("return", JSON.parse(JSON.stringify(allPlayerData || {})));
        case 4:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return _getAllPlayerData.apply(this, arguments);
}
function formatTimestamp(timestamp) {
  var date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * Formats a timestamp into a human-readable 'time ago' string.
 * e.g., "5 minutes ago", "2 hours ago", "3 days ago".
 * @param {number} timestamp - The Unix timestamp in milliseconds.
 * @returns {string} A human-readable string representing the time since the timestamp, or "Not seen yet" if timestamp is invalid.
 */
function formatTimeSince(timestamp) {
  if (!timestamp || isNaN(timestamp) || timestamp <= 0) {
    return "Not seen yet";
  }
  var now = Date.now();
  var seconds = Math.round((now - timestamp) / 1000);
  if (seconds < 0) {
    // Timestamp is in the future
    return "In the future"; // Or handle as an error/default
  }
  if (seconds < 60) {
    return seconds + " sec ago";
  }
  var minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return minutes + (minutes === 1 ? " min ago" : " mins ago");
  }
  var hours = Math.round(minutes / 60);
  if (hours < 24) {
    return hours + (hours === 1 ? " hour ago" : " hours ago");
  }
  var days = Math.round(hours / 24);
  if (days < 30) {
    return days + (days === 1 ? " day ago" : " days ago");
  }
  var months = Math.round(days / 30);
  if (months < 12) {
    return months + (months === 1 ? " month ago" : " months ago");
  }
  var years = Math.round(months / 12);
  return years + (years === 1 ? " year ago" : " years ago");
}

/**
 * Create modal to display username history
 * @param {Array} history - Array of username history entries
 * @param {string} currentName - Current username
 */
function createUsernameHistoryModal(history, currentName) {
  // Remove any existing modal first to prevent duplicates
  var existingModal = document.querySelector('.username-history-modal');
  if (existingModal) {
    existingModal.remove();
  }
  var modal = document.createElement('div');
  modal.className = 'username-history-modal';
  var modalContent = document.createElement('div');
  modalContent.className = 'username-history-content';
  var closeButton = document.createElement('span');
  closeButton.className = 'username-history-close';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = function () {
    return document.body.removeChild(modal);
  };
  var title = document.createElement('h2');
  title.className = 'username-history-title';
  title.textContent = 'Username History';
  var currentNameElement = document.createElement('div');
  currentNameElement.className = 'username-history-current';
  currentNameElement.innerHTML = "<strong>Current:</strong> <span style=\"font-weight: bold;\">".concat(currentName, "</span>");
  var historyList = document.createElement('div');
  historyList.className = 'username-history-list';
  if (history && history.length > 0) {
    history.forEach(function (entry) {
      var historyItem = document.createElement('div');
      historyItem.className = 'username-history-item';
      var nameElement = document.createElement('span');
      nameElement.className = 'username-history-name';
      if (entry.oldName && entry.newName) {
        historyItem.classList.add('username-history-change');
        nameElement.innerHTML = "<span class=\"old-name\">".concat(entry.oldName, "</span><span class=\"arrow\"> &rarr; </span><span class=\"new-name\">").concat(entry.newName, "</span>");
      } else {
        nameElement.textContent = entry.name || entry.username || 'Unknown Change';
      }
      var timeElement = document.createElement('span');
      timeElement.className = 'username-history-time';
      timeElement.textContent = formatTimestamp(entry.timestamp);
      historyItem.appendChild(nameElement);
      historyItem.appendChild(timeElement);
      historyList.appendChild(historyItem);
    });
  } else {
    var noHistory = document.createElement('p');
    noHistory.textContent = 'No history available.';
    historyList.appendChild(noHistory);
  }
  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);
  modalContent.appendChild(currentNameElement);
  modalContent.appendChild(historyList);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Close when clicking outside the modal
  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

/**
 * Compares two players for sorting according to specific criteria:
 * 1. Online Favorite players first (sorted by rating desc, then name asc).
 * 2. Online Non-Favorite players next (sorted by rating desc, then name asc).
 * 3. Offline players last (sorted by lastSeenTimestamp desc (recent first, no data last), then rating desc, then name asc).
 * @param {Array} a - First player entry: [idString, playerObjectA]
 * @param {Array} b - Second player entry: [idString, playerObjectB]
 * @param {Set<string>} onlinePlayerIds - Set of IDs for players currently online.
 * @returns {number} -1 if a < b, 1 if a > b, 0 if a === b.
 */
function comparePlayersForSorting(a, b, onlinePlayerIds) {
  try {
    // Handle invalid inputs
    if (!Array.isArray(a) || !Array.isArray(b) || a.length < 2 || b.length < 2) return 0;
    if (!(onlinePlayerIds instanceof Set)) onlinePlayerIds = new Set();
    var _a = _slicedToArray(a, 2),
      idA = _a[0],
      playerAData = _a[1];
    var _b = _slicedToArray(b, 2),
      idB = _b[0],
      playerBData = _b[1];

    // Handle invalid player data
    if (!idA || !idB || !playerAData || !playerBData || _typeof(playerAData) !== 'object' || _typeof(playerBData) !== 'object') {
      return 0;
    }

    // Safely convert IDs to strings and check online status
    var playerIdA = String(idA || '');
    var playerIdB = String(idB || '');
    var isOnlineA = playerIdA && onlinePlayerIds.has(playerIdA);
    var isOnlineB = playerIdB && onlinePlayerIds.has(playerIdB);
    var isFavoriteA = playerAData.isFavorite || false;
    var isFavoriteB = playerBData.isFavorite || false;

    // Priority 1: Online AND Favorite
    var aIsOnlineFav = isOnlineA && isFavoriteA;
    var bIsOnlineFav = isOnlineB && isFavoriteB;
    if (aIsOnlineFav !== bIsOnlineFav) {
      return aIsOnlineFav ? -1 : 1; // OnlineFav (true) comes before not OnlineFav (false)
    }

    // Priority 2: Online
    if (isOnlineA !== isOnlineB) {
      return isOnlineA ? -1 : 1; // Online (true) comes before not Online (false)
    }

    // Priority 3: Favorite
    if (isFavoriteA !== isFavoriteB) {
      return isFavoriteA ? -1 : 1; // Favorite (true) comes before not Favorite (false)
    }

    // Priority 4: Rating
    var scoreA = playerAData.score !== undefined && playerAData.score !== null ? Number(playerAData.score) : -Infinity;
    var scoreB = playerBData.score !== undefined && playerBData.score !== null ? Number(playerBData.score) : -Infinity;
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Higher score first
    }

    // Finally, sort by name
    var nameA = String(playerAData.name || '').toLowerCase();
    var nameB = String(playerBData.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  } catch (error) {
    console.error('Error comparing players:', error);
    return 0;
  }
}

/**
 * Helper function to extract a Set of online player IDs from session data.
 * @param {Array|Set|null} sessionData - Active session data or a Set of online IDs.
 * @returns {Set<string>} A Set of player IDs that are currently online.
 */
/**
 * Extract online player IDs from session data.
 * @param {Array} sessionData - Array of session objects from the API
 * @returns {Set<string>} Set of online player IDs
 */
function getOnlinePlayerIds(sessionData) {
  try {
    // Validate input
    if (!Array.isArray(sessionData)) {
      return new Set();
    }
    var onlinePlayerIds = new Set();

    // Process each session
    sessionData.forEach(function (session) {
      try {
        // Skip invalid sessions
        if (!session || !Array.isArray(session.usersAll)) return;

        // Find online users in this session
        session.usersAll.forEach(function (user) {
          try {
            // Skip invalid users
            if (!user || _typeof(user) !== 'object') return;
            if (!user.id || user.isOnline !== true) return;

            // Safely convert ID to string and add to set
            var userId = String(user.id);
            if (userId) onlinePlayerIds.add(userId);
          } catch (userError) {
            console.warn('Error processing user in getOnlinePlayerIds:', userError);
          }
        });
      } catch (sessionError) {
        console.warn('Error processing session in getOnlinePlayerIds:', sessionError);
      }
    });
    return onlinePlayerIds;
  } catch (error) {
    console.error('Error in getOnlinePlayerIds:', error);
    return new Set();
  }
}

/**
 * Displays known players in the specified container, filtered by search term and indicating online status.
 * @param {HTMLElement} container - The container element to display players in.
 * @param {string} [searchTerm=''] - Optional search term to filter players.
 * @param {Object} playerData - The player data object.
 * @param {Set<string>} onlinePlayerIds - A Set containing the IDs of currently online players.
 * @param {Function} createUsernameHistoryModalFunc - Function to create the history modal.
 * @param {Function} refreshCallback - Callback to refresh the list after edits or favorite changes.
 */
/**
 * Displays known players in the specified container, filtered by search term (including score conditions) and indicating online status.
 * Supports queries like 'score > 2', 'score <= 4', 'score = 3', etc., combined with regular text search.
 * @param {HTMLElement} container - The container element to display players in.
 * @param {string} [searchTerm=''] - Optional search term to filter players.
 * @param {Object} playerData - The player data object.
 * @param {Set<string>} onlinePlayerIds - A Set containing the IDs of currently online players.
 * @param {Function} createUsernameHistoryModalFunc - Function to create the history modal.
 * @param {Function} refreshCallback - Callback to refresh the list after edits or favorite changes.
 */
function displayKnownPlayers(_x2) {
  return _displayKnownPlayers.apply(this, arguments);
}
/**
 * Add or update a player in the data
 * @param {string} id - Player ID
 * @param {string} name - Player name
 * @param {number} score - Player rating
 * @param {string} notes - Player notes
 * @param {boolean} isFavorite - Player favorite status
 * @param {Function} [updateUICallback] - Optional callback to execute after saving, receives updated player data
 */
function _displayKnownPlayers() {
  _displayKnownPlayers = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(container) {
    var searchTerm,
      playerData,
      onlinePlayerIds,
      createUsernameHistoryModalFunc,
      refreshCallback,
      parseScoreFilter,
      evaluateScore,
      scoreFilter,
      textSearch,
      lowerSearchTerm,
      entries,
      filteredPlayersArray,
      sortedPlayersArray,
      _args4 = arguments;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          evaluateScore = function _evaluateScore(score, op, value) {
            if (typeof score === 'string') score = parseInt(score, 10);
            if (typeof score !== 'number' || isNaN(score)) return false;
            switch (op) {
              case '>':
                return score > value;
              case '<':
                return score < value;
              case '>=':
                return score >= value;
              case '<=':
                return score <= value;
              case '==':
                return score === value;
              default:
                return false;
            }
          };
          parseScoreFilter = function _parseScoreFilter(input) {
            // e.g. score > 2, score <= 4, score=3, score==3
            var regex = /score\s*(<=|>=|=|==|<|>)\s*(\d+)/i;
            var match = input.match(regex);
            if (!match) return null;
            var _match = _slicedToArray(match, 3),
              op = _match[1],
              value = _match[2];
            if (op === '=') op = '==';
            return {
              op: op,
              value: parseInt(value, 10),
              raw: match[0]
            };
          };
          searchTerm = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : '';
          playerData = _args4.length > 2 ? _args4[2] : undefined;
          onlinePlayerIds = _args4.length > 3 ? _args4[3] : undefined;
          createUsernameHistoryModalFunc = _args4.length > 4 ? _args4[4] : undefined;
          refreshCallback = _args4.length > 5 ? _args4[5] : undefined; // --- Score filter parsing ---
          // Parse score filter and remove it from the search term for text search
          scoreFilter = null;
          textSearch = searchTerm || '';
          if (searchTerm) {
            scoreFilter = parseScoreFilter(searchTerm);
            if (scoreFilter) {
              // Remove the score filter part from the text search
              textSearch = textSearch.replace(scoreFilter.raw, '').trim();
            }
          }
          lowerSearchTerm = textSearch ? textSearch.toLowerCase() : '';
          container.innerHTML = '';
          // Filter and then sort the player data
          entries = _typeof(playerData) === 'object' && playerData !== null ? Object.entries(playerData) : [];
          filteredPlayersArray = entries.filter(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
              id = _ref2[0],
              player = _ref2[1];
            // Skip invalid entries
            if (!id || !player || _typeof(player) !== 'object') return false;
            // Score filter
            if (scoreFilter) {
              var playerScore = player.score !== undefined && player.score !== null ? parseInt(player.score, 10) : null;
              if (!evaluateScore(playerScore, scoreFilter.op, scoreFilter.value)) return false;
            }
            // Text search
            if (!lowerSearchTerm) return true; // If only score filter, pass
            var playerName = String(player.name || '');
            var playerNotes = String(player.notes || '');
            var playerId = String(id || '');
            var playerScoreStr = player.score !== undefined && player.score !== null ? String(player.score) : '';
            var nameMatch = playerName.toLowerCase().includes(lowerSearchTerm);
            var notesMatch = playerNotes.toLowerCase().includes(lowerSearchTerm);
            var scoreMatch = playerScoreStr.toLowerCase().includes(lowerSearchTerm);
            var idMatch = playerId.toLowerCase().includes(lowerSearchTerm);
            return nameMatch || notesMatch || scoreMatch || idMatch;
          }); // Ensure we have valid data before sorting
          sortedPlayersArray = Array.isArray(filteredPlayersArray) ? filteredPlayersArray.sort(function (a, b) {
            try {
              return comparePlayersForSorting(a, b, onlinePlayerIds);
            } catch (error) {
              console.error('Error sorting players:', error);
              return 0; // Keep original order on error
            }
          }) : [];
          if (!(sortedPlayersArray.length === 0 && searchTerm)) {
            _context4.next = 18;
            break;
          }
          container.innerHTML = '<p>No players match your search.</p>';
          return _context4.abrupt("return");
        case 18:
          if (!(sortedPlayersArray.length === 0)) {
            _context4.next = 21;
            break;
          }
          container.innerHTML = '<p>No players known. Add some!</p>';
          return _context4.abrupt("return");
        case 21:
          // For each player, create a card
          sortedPlayersArray.forEach(function (_ref3) {
            var _ref4 = _slicedToArray(_ref3, 2),
              id = _ref4[0],
              player = _ref4[1];
            // Corrected: Destructure id and player here
            var card = document.createElement('div');
            card.className = 'player-card known-player';
            card.dataset.playerId = id;

            // Add rating class for styling
            card.classList.add(getRatingClass(player.score));
            var isOnline = onlinePlayerIds.has(id.toString()); // Correctly use destructured id
            var hasMetaInfo = false; // Declare hasMetaInfo here for broader scope within the loop iteration

            if (isOnline) {
              card.classList.add('online');
            }
            if (player.isFavorite) {
              card.classList.add('favorite-player');
            }

            // --- Player Info Container ---
            var infoContainer = document.createElement('div');
            infoContainer.className = 'player-info-container';
            if (isOnline) {
              var nameElement = document.createElement('strong');
              nameElement.textContent = player.name || "Player ".concat(id);
              infoContainer.appendChild(nameElement);
              var idElement = document.createElement('small');
              idElement.textContent = " (ID: ".concat(id, ")");
              idElement.style.color = 'var(--subtle-text-color)';
              infoContainer.appendChild(idElement);
              var sessionName = null;
              if (player.lastSeenSessionId) {
                sessionName = player.lastSeenSessionId;
              }
              var onlineBadge = document.createElement('span');
              onlineBadge.classList.add('online-badge');
              onlineBadge.title = 'Online';
              infoContainer.appendChild(onlineBadge);
              if (sessionName) {
                var sessionNameSpan = document.createElement('small');
                sessionNameSpan.style.color = 'var(--accent-color)';
                sessionNameSpan.style.marginLeft = '5px';
                sessionNameSpan.textContent = " (in: ".concat(sessionName, ")");
                infoContainer.appendChild(sessionNameSpan);
              }
            } else {
              // Offline player name and ID (similar to online, but no badge or current session name)
              var _nameElement = document.createElement('strong');
              _nameElement.textContent = player.name || "Player ".concat(id);
              infoContainer.appendChild(_nameElement);
              var _idElement = document.createElement('small');
              _idElement.textContent = " (ID: ".concat(id, ")");
              _idElement.style.color = 'var(--subtle-text-color)';
              infoContainer.appendChild(_idElement);
            }

            // Create a container for meta info (Sessions, Last Seen) - applies to ALL players
            var metaInfoContainer = document.createElement('div');
            metaInfoContainer.className = 'player-meta-info';
            var addedSessionInfo = false;
            // Add session count information (for ALL players if available)
            if (player.lastSeenSessionId) {
              var sessionInfoText = document.createElement('span');
              sessionInfoText.textContent = "Sessions: ".concat(player.uniqueSessionCount || 1);
              sessionInfoText.style.color = 'var(--subtle-text-color)';
              metaInfoContainer.appendChild(sessionInfoText);
              hasMetaInfo = true;
              addedSessionInfo = true;
            }

            // Handle offline player last seen time (ONLY for offline players)
            if (!isOnline && player.lastSeenTimestamp) {
              if (addedSessionInfo) {
                // Add a separator if session info was already added
                var separator = document.createElement('span');
                separator.textContent = ' | ';
                separator.style.color = 'var(--subtle-text-color)';
                separator.style.marginLeft = '5px';
                separator.style.marginRight = '5px';
                metaInfoContainer.appendChild(separator);
              }
              var lastSeenTextContent = player.lastSeenTimestamp && player.lastSeenTimestamp > 0 ? formatTimeSince(player.lastSeenTimestamp) : 'Never';
              var lastSeenElement = document.createElement('span');
              lastSeenElement.textContent = "Last seen: ".concat(lastSeenTextContent);
              lastSeenElement.className = 'last-seen-text';
              lastSeenElement.style.color = 'var(--subtle-text-color)';
              metaInfoContainer.appendChild(lastSeenElement);
              hasMetaInfo = true;
            }
            if (hasMetaInfo) {
              infoContainer.appendChild(metaInfoContainer);
            }
            var scoreElement = document.createElement('span');
            scoreElement.textContent = "Score: ".concat(player.score !== undefined ? player.score : 'N/A', "/5");
            scoreElement.style.display = 'block'; // Make score take its own line after meta info
            scoreElement.style.marginTop = hasMetaInfo ? '5px' : '0'; // Now hasMetaInfo should be defined
            infoContainer.appendChild(scoreElement);
            if (player.notes) {
              var notesElement = document.createElement('p');
              notesElement.textContent = "Notes: ".concat(player.notes);
              notesElement.className = 'player-notes';
              // Check if notes already contain session count to avoid duplication if logic is complex
              // For now, assuming session count is primarily handled by the new metaInfoContainer
              infoContainer.appendChild(notesElement);
            }
            card.appendChild(infoContainer);

            // --- Player Actions (Buttons) ---
            var buttonContainer = document.createElement('div');
            buttonContainer.className = 'player-actions'; // Updated class for consistency

            // Favorite Button
            var favoriteButton = document.createElement('button');
            favoriteButton.classList.add('player-action-button', 'favorite-button'); // Ensure player-action-button is present
            favoriteButton.innerHTML = player.isFavorite ? '★' : '☆'; // Updated Star icons
            favoriteButton.title = player.isFavorite ? 'Unfavorite Player' : 'Favorite Player';
            favoriteButton.addEventListener('click', function (e) {
              e.stopPropagation();
              toggleFavoriteStatus(id, favoriteButton, player, refreshCallback); // Pass player object and the refreshCallback
            });
            buttonContainer.appendChild(favoriteButton);

            // Edit Button
            var editButton = document.createElement('button');
            editButton.classList.add('player-action-button');
            editButton.innerHTML = "<img src=\"../icons/editbutton.svg\" alt=\"Edit\" class=\"button-icon\">";
            editButton.title = 'Edit Player';
            editButton.addEventListener('click', function (e) {
              e.stopPropagation();
              editPlayerDetails(id, false, refreshCallback); // Pass 'refreshCallback' to 'editPlayerDetails'
            });
            buttonContainer.appendChild(editButton);

            // History Button (if history exists)
            if (player.usernameHistory && player.usernameHistory.length > 0) {
              var historyButton = document.createElement('button');
              historyButton.classList.add('player-action-button'); // Removed 'history-button' class
              historyButton.innerHTML = "\uD83D\uDD52"; // Updated Clock icon
              historyButton.title = "View Username History (".concat(player.usernameHistory.length, " entries)");
              historyButton.addEventListener('click', function (e) {
                e.stopPropagation();
                createUsernameHistoryModalFunc(player.usernameHistory, player.name);
              });
              buttonContainer.appendChild(historyButton);
            }

            // Refresh Username Button (only if player has an ID, which they should)
            var refreshUsernameButton = document.createElement('button');
            refreshUsernameButton.classList.add('player-action-button'); // Removed 'refresh-username-button' class
            refreshUsernameButton.innerHTML = '🔄'; // Updated Refresh icon
            refreshUsernameButton.title = 'Refresh Username from Server';
            refreshUsernameButton.addEventListener('click', function (e) {
              e.stopPropagation();
              handleRefreshUserName(id, refreshUsernameButton, refreshCallback);
            });
            buttonContainer.appendChild(refreshUsernameButton);

            // Delete Button
            var deleteButton = document.createElement('button');
            deleteButton.classList.add('player-action-button');
            deleteButton.innerHTML = "<img src=\"../icons/deletebutton.svg\" alt=\"Delete\" class=\"button-icon\">";
            deleteButton.title = 'Delete Player';
            deleteButton.addEventListener('click', function (e) {
              e.stopPropagation();
              deletePlayer(id, function () {
                // Pass the refreshCallback to the version of deletePlayer that accepts it.
                // console.log("Player deleted, attempting to refresh list after modal confirmation.");
                if (typeof refreshCallback === 'function') {
                  refreshCallback();
                }
              });
            });
            buttonContainer.appendChild(deleteButton);
            card.appendChild(infoContainer);
            card.appendChild(buttonContainer);
            container.appendChild(card);
          });
        case 22:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return _displayKnownPlayers.apply(this, arguments);
}
function addPlayer(_x3, _x4, _x5, _x6, _x7, _x8) {
  return _addPlayer.apply(this, arguments);
}
/**
 * Checks if a player's username from a session differs from the stored one.
 * If it differs, updates the username and history in storage.
 * @param {string} userId - The ID of the player.
 * @param {string} sessionUsername - The username found in the current session data.
 * @param {Object} currentPlayerData - The currently loaded player data object.
 * @param {Function} callback - Callback function, receives (wasUpdated: boolean, updatedPlayerData: Object).
 */
function _addPlayer() {
  _addPlayer = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(id, name, score, notes, isFavorite, updateUICallback) {
    var parsedScore, finalScore, playerData, isUpdate, oldPlayerData, usernameHistory, sessionHistoryArray, uniqueSessionCount, lastSeenSessionId, lastSeenTimestamp, newIsFavoriteValue;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          // Validate score input
          parsedScore = parseInt(score, 10);
          finalScore = !isNaN(parsedScore) && parsedScore >= -5 && parsedScore <= 5 ? parsedScore : null;
          _context5.next = 4;
          return loadPlayerData();
        case 4:
          playerData = _context5.sent;
          if (id) {
            _context5.next = 8;
            break;
          }
          console.error('Attempted to add player with no ID.');
          return _context5.abrupt("return");
        case 8:
          // Check if player exists for potential update
          isUpdate = !!playerData[id];
          oldPlayerData = isUpdate ? _objectSpread({}, playerData[id]) : null; // Preserve or initialize username history
          usernameHistory = isUpdate && playerData[id].usernameHistory ? _toConsumableArray(playerData[id].usernameHistory) : []; // Preserve or initialize session history
          sessionHistoryArray = isUpdate && Array.isArray(playerData[id].sessionHistory) ? _toConsumableArray(playerData[id].sessionHistory) : [];
          uniqueSessionCount = isUpdate && typeof playerData[id].uniqueSessionCount === 'number' ? playerData[id].uniqueSessionCount : 0;
          lastSeenSessionId = isUpdate && playerData[id].lastSeenSessionId ? playerData[id].lastSeenSessionId : null;
          lastSeenTimestamp = isUpdate && playerData[id].lastSeenTimestamp ? playerData[id].lastSeenTimestamp : null; // Determine the new favorite status
          if (isUpdate) {
            // For updates, use the provided 'isFavorite' parameter if it's a boolean, otherwise keep the existing one.
            newIsFavoriteValue = typeof isFavorite === 'boolean' ? isFavorite : playerData[id].isFavorite;
          } else {
            // For new players, use the provided 'isFavorite' parameter if it's a boolean, otherwise default to false.
            newIsFavoriteValue = typeof isFavorite === 'boolean' ? isFavorite : false;
          }

          // If updating, check if name changed and update history
          if (isUpdate && playerData[id].name !== name) {
            // console.log(`Updating name for ${id}: "${playerData[id].name}" -> "${name}"`);
            usernameHistory.unshift({
              username: playerData[id].name,
              timestamp: Date.now()
            });
            // Limit history size if needed (e.g., keep last 10)
            if (usernameHistory.length > 10) {
              usernameHistory = usernameHistory.slice(0, 10);
            }
          }

          // Update or create player data
          playerData[id] = {
            id: id,
            name: name,
            score: finalScore,
            notes: notes || (isUpdate ? playerData[id].notes : ''),
            usernameHistory: usernameHistory,
            sessionHistory: sessionHistoryArray,
            uniqueSessionCount: uniqueSessionCount,
            lastSeenSessionId: lastSeenSessionId,
            lastSeenTimestamp: lastSeenTimestamp,
            isFavorite: newIsFavoriteValue
          };
          _context5.next = 20;
          return savePlayerData(playerData);
        case 20:
          // Pass the updated data for this specific player to the callback
          if (updateUICallback && typeof updateUICallback === 'function') {
            // Ensure the callback receives the full updated player data, including isFavorite
            updateUICallback(playerData[id]);
          }
        case 21:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
  }));
  return _addPlayer.apply(this, arguments);
}
function updateUsernameHistoryIfNeeded(_x9, _x0, _x1) {
  return _updateUsernameHistoryIfNeeded.apply(this, arguments);
}
/**
 * Checks if a player is seen in a new session compared to the last recorded one.
 * If it's a new session, increments the unique session count and updates the last seen ID.
 * @param {string} userId - The ID of the player.
 * @param {string} currentSessionId - The ID of the session the player was just seen in.
 * @param {Object} currentPlayerData - The currently loaded player data object.
 * @param {Function} callback - Callback function, receives (wasUpdated: boolean, updatedPlayerData: Object).
 */
function _updateUsernameHistoryIfNeeded() {
  _updateUsernameHistoryIfNeeded = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(userId, sessionUsername, currentPlayerData) {
    var player, updatedData, needsSave, currentStoredName, history, latestHistoryEntry;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          player = currentPlayerData[userId];
          updatedData = _objectSpread({}, currentPlayerData); // Work on a copy
          needsSave = false; // If player isn't known at all, we can't update history (should be added first)
          if (player) {
            _context6.next = 5;
            break;
          }
          return _context6.abrupt("return", false);
        case 5:
          // Initialize history if it doesn't exist
          if (!player.usernameHistory) {
            player.usernameHistory = [];
            needsSave = true; // Need to save if we initialize the array structure
          }
          currentStoredName = player.name;
          history = player.usernameHistory; // Check if the session username is different from the currently stored name
          if (sessionUsername && currentStoredName !== sessionUsername) {
            // Check if this session username is already the *latest* in history (avoids redundant entries)
            latestHistoryEntry = history.length > 0 ? history[history.length - 1] : null; // Add the *previous* name to history only if it's not already the latest entry
            if (!latestHistoryEntry || latestHistoryEntry.username !== currentStoredName) {
              history.push({
                username: currentStoredName,
                timestamp: Date.now()
              });
              // console.log(`[Username History] Added '${currentStoredName}' to history for player ${player.id}. New name: '${sessionUsername}'.`);
              needsSave = true;
            }

            // Update the player's current name to the new one from the session
            player.name = sessionUsername;
            needsSave = true;
          } else {
            // If names match, ensure the current name is at least the first entry if history is empty
            if (history.length === 0 && currentStoredName) {
              history.push({
                username: currentStoredName,
                timestamp: Date.now()
              });
              needsSave = true;
            }
          }

          // If any changes occurred that require saving
          if (!needsSave) {
            _context6.next = 15;
            break;
          }
          _context6.next = 12;
          return savePlayerData(updatedData);
        case 12:
          return _context6.abrupt("return", true);
        case 15:
          return _context6.abrupt("return", false);
        case 16:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return _updateUsernameHistoryIfNeeded.apply(this, arguments);
}
function updateSessionHistoryIfNeeded(_x10, _x11, _x12) {
  return _updateSessionHistoryIfNeeded.apply(this, arguments);
}
/**
 * Helper function to get CSS class based on player rating.
 * Ensures rating is clamped between 1 and 5 for class generation.
 * @param {number|string} rating - Player rating.
 * @returns {string} CSS class name (e.g., 'rating-3', 'rating-unknown').
 */
function _updateSessionHistoryIfNeeded() {
  _updateSessionHistoryIfNeeded = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(userId, currentSessionId, currentPlayerData) {
    var player, changed, newUniqueSessionCount, newTimestamp;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          if (!(!userId || !currentSessionId)) {
            _context7.next = 2;
            break;
          }
          return _context7.abrupt("return", false);
        case 2:
          player = currentPlayerData[userId];
          if (player) {
            _context7.next = 5;
            break;
          }
          return _context7.abrupt("return", false);
        case 5:
          changed = false; // Initialize session tracking fields if they don't exist
          if (!Array.isArray(player.sessionHistory)) {
            player.sessionHistory = [];
            changed = true; // Mark as changed if we initialize this
          }
          if (typeof player.uniqueSessionCount !== 'number') {
            // Also ensure uniqueSessionCount is a number
            player.uniqueSessionCount = player.sessionHistory.length; // Or 0 if sessionHistory was also just init'd
            changed = true; // Mark as changed
          }
          // Ensure lastSeenSessionId exists, though it will be updated shortly if different
          if (player.lastSeenSessionId === undefined) {
            player.lastSeenSessionId = null;
            changed = true;
          }
          // Ensure lastSeenTimestamp exists
          if (player.lastSeenTimestamp === undefined) {
            player.lastSeenTimestamp = null;
            changed = true;
          }

          // Add current session ID if it's not already in the history
          if (!player.sessionHistory.includes(currentSessionId)) {
            player.sessionHistory.push(currentSessionId);
            changed = true;
          }

          // Update unique session count based on the length of the (now potentially updated) sessionHistory array
          newUniqueSessionCount = player.sessionHistory.length;
          if (player.uniqueSessionCount !== newUniqueSessionCount) {
            player.uniqueSessionCount = newUniqueSessionCount;
            changed = true;
          }

          // Update lastSeenSessionId (could be the same as current if it's a repeat, or new)
          if (player.lastSeenSessionId !== currentSessionId) {
            player.lastSeenSessionId = currentSessionId;
            changed = true;
          }

          // Always update lastSeenTimestamp if processing this player from a session
          newTimestamp = Date.now();
          if (player.lastSeenTimestamp !== newTimestamp) {
            // Could be redundant if always updating, but good for explicitness
            player.lastSeenTimestamp = newTimestamp;
            changed = true;
          }
          if (!changed) {
            _context7.next = 22;
            break;
          }
          _context7.next = 19;
          return savePlayerData(_objectSpread(_objectSpread({}, currentPlayerData), {}, _defineProperty({}, userId, player)));
        case 19:
          return _context7.abrupt("return", true);
        case 22:
          return _context7.abrupt("return", false);
        case 23:
        case "end":
          return _context7.stop();
      }
    }, _callee7);
  }));
  return _updateSessionHistoryIfNeeded.apply(this, arguments);
}
function getRatingClass(rating) {
  if (rating === null || rating === undefined || rating === '') return 'rating-unknown';
  var numRating = parseInt(rating, 10);
  if (isNaN(numRating)) return 'rating-unknown';
  var validRating = Math.max(1, Math.min(5, numRating));
  return "rating-".concat(validRating);
}

/**
 * Adds a new player manually using their ID.
 * @param {string} playerId - The unique ID of the player.
 * @param {string} initialName - The initial name to assign.
 * @param {string|number} initialScore - The initial score (validated later).
 * @param {string} initialNotes - The initial notes.
 * @param {function} [callback] - Optional callback after saving.
 */

// -- START: Data Management & Utility --

/**
 * Replaces all player data in memory and saves it to Chrome storage.
 * @param {Object} newData - The new player data object to replace the current data.
 * @param {Function} [callback] - Optional callback to execute after saving.
 */
function replaceAllPlayerDataAndSave(_x13, _x14) {
  return _replaceAllPlayerDataAndSave.apply(this, arguments);
} // -- START: Initialization & Utility --
/**
 * Toggles the favorite status of a player and updates storage and UI.
 * @param {string} playerId - The ID of the player.
 * @param {HTMLElement} buttonElement - The button element to update.
 * @param {Object} [playerObject] - Optional: The player object, to update its isFavorite status directly for immediate UI feedback.
 * @param {Function} [callback] - Optional callback to execute after saving.
 */
function _replaceAllPlayerDataAndSave() {
  _replaceAllPlayerDataAndSave = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8(newData, callback) {
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return new Promise(function (resolve, reject) {
            chrome.storage.local.remove('playerData', function () {
              if (chrome.runtime.lastError) {
                console.error('[userManager] Error removing playerData from storage:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
              } else {
                // Debug logging removed
                resolve();
              }
            });
          });
        case 3:
          // Now set the memory cache and save the new (empty) data
          allPlayerData = newData || {}; // Replace in-memory store, ensure it's an object

          // Save the empty data object
          _context8.next = 6;
          return new Promise(function (resolve, reject) {
            chrome.storage.local.set({
              playerData: allPlayerData
            }, function () {
              if (chrome.runtime.lastError) {
                console.error('[userManager] Error saving empty playerData:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
              } else {
                // Debug logging removed
                resolve();
              }
            });
          });
        case 6:
          // Debug logging removed

          // Call the callback with success=true if provided
          if (typeof callback === 'function') {
            callback(true);
          }
          return _context8.abrupt("return", true);
        case 10:
          _context8.prev = 10;
          _context8.t0 = _context8["catch"](0);
          console.error('[userManager] Error clearing player data:', _context8.t0);

          // Call the callback with success=false if provided
          if (typeof callback === 'function') {
            callback(false);
          }
          return _context8.abrupt("return", false);
        case 15:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[0, 10]]);
  }));
  return _replaceAllPlayerDataAndSave.apply(this, arguments);
}
function toggleFavoriteStatus(_x15, _x16, _x17, _x18) {
  return _toggleFavoriteStatus.apply(this, arguments);
}
/**
 * Deletes a player from the stored data.
 * @param {string} playerId - The ID of the player to delete.
 * @param {Function} callback - Function to call after deletion attempt (receives success: boolean, deletedPlayerId: string|null, message: string).
 */
function _toggleFavoriteStatus() {
  _toggleFavoriteStatus = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee9(playerId, buttonElement, playerObject, callback) {
    var playerData;
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _context9.next = 2;
          return loadPlayerData();
        case 2:
          playerData = _context9.sent;
          if (playerData[playerId]) {
            _context9.next = 7;
            break;
          }
          console.warn("Player ".concat(playerId, " not found for toggling favorite."));
          ModalManager.showNotification("Player ".concat(playerId, " not found."), true, 3000);
          return _context9.abrupt("return");
        case 7:
          playerData[playerId].isFavorite = !playerData[playerId].isFavorite;
          if (playerObject) {
            // Update the passed object for immediate UI consistency if provided
            playerObject.isFavorite = playerData[playerId].isFavorite;
          }
          _context9.next = 11;
          return savePlayerData(playerData);
        case 11:
          // Update button text/appearance
          if (buttonElement) {
            buttonElement.innerHTML = playerData[playerId].isFavorite ? '★' : '☆';
            buttonElement.title = playerData[playerId].isFavorite ? 'Unfavorite Player' : 'Favorite Player';
            buttonElement.classList.toggle('favorite-active', playerData[playerId].isFavorite);
          }
          // Call the callback if provided
          if (typeof callback === 'function') {
            callback();
          }
        case 13:
        case "end":
          return _context9.stop();
      }
    }, _callee9);
  }));
  return _toggleFavoriteStatus.apply(this, arguments);
}
function deletePlayer(_x19, _x20) {
  return _deletePlayer.apply(this, arguments);
}
/**
 * Handles the process of refreshing a player's username from the API.
 * @param {string} playerId - The ID of the player whose name to refresh.
 * @param {HTMLElement} buttonElement - The refresh button element for UI feedback.
 * @param {Function} refreshListCallback - Callback to refresh the user list display.
 */
function _deletePlayer() {
  _deletePlayer = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee1(playerId, callback) {
    return _regeneratorRuntime().wrap(function _callee1$(_context1) {
      while (1) switch (_context1.prev = _context1.next) {
        case 0:
          ModalManager.showConfirm('Delete Player', "Are you sure you want to delete player ".concat(playerId, "? This cannot be undone."), /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee0() {
            var playerData, deletedPlayerName;
            return _regeneratorRuntime().wrap(function _callee0$(_context0) {
              while (1) switch (_context0.prev = _context0.next) {
                case 0:
                  _context0.next = 2;
                  return loadPlayerData();
                case 2:
                  playerData = _context0.sent;
                  if (playerData[playerId]) {
                    _context0.next = 8;
                    break;
                  }
                  console.warn("[Delete Player] Player with ID ".concat(playerId, " not found."));
                  ModalManager.showNotification('Error', "Player not found.", 500);
                  if (callback) callback(false, null, "Player not found.");
                  return _context0.abrupt("return");
                case 8:
                  deletedPlayerName = playerData[playerId].name || playerId;
                  delete playerData[playerId]; // Delete the player data
                  _context0.next = 12;
                  return savePlayerData(playerData);
                case 12:
                  ModalManager.showNotification('Success', "Player ".concat(deletedPlayerName, " deleted."), 500);
                  if (callback) callback(true, playerId, "Player deleted.");
                case 14:
                case "end":
                  return _context0.stop();
              }
            }, _callee0);
          })), function () {
            // onCancel
            ModalManager.showNotification('Cancelled', 'Delete operation cancelled.', 500);
            if (callback) callback(false, null, "Delete operation cancelled.");
          });
        case 1:
        case "end":
          return _context1.stop();
      }
    }, _callee1);
  }));
  return _deletePlayer.apply(this, arguments);
}
function handleRefreshUserName(_x21, _x22, _x23) {
  return _handleRefreshUserName.apply(this, arguments);
}
/**
 * Updates the username history for a player if the new username is different.
 * This function is adapted from background.js and should be available in userManager.js context.
 * @param {Object} playerObject - The player object from playerData.
 * @param {string} oldUsername - The username before the update.
 */
function _handleRefreshUserName() {
  _handleRefreshUserName = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee10(playerId, buttonElement, refreshListCallback) {
    var authToken, response, errorData, data, newUsername, playerData, player, oldUsername;
    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          buttonElement.disabled = true;
          buttonElement.innerHTML = '&#x21bb;'; // Loading/hourglass emoji
          _context10.prev = 2;
          _context10.next = 5;
          return new Promise(function (resolve, reject) {
            chrome.storage.local.get('authToken', function (result) {
              if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
              }
              resolve(result.authToken);
            });
          });
        case 5:
          authToken = _context10.sent;
          if (authToken) {
            _context10.next = 9;
            break;
          }
          ModalManager.showAlert('Error', 'Authentication token not found. Please ensure you are logged in to botc.app.');
          throw new Error('Auth token not found');
        case 9:
          _context10.next = 11;
          return fetch("https://botc.app/backend/user/".concat(playerId), {
            headers: {
              'Authorization': authToken
            }
          });
        case 11:
          response = _context10.sent;
          if (response.ok) {
            _context10.next = 18;
            break;
          }
          _context10.next = 15;
          return response.json()["catch"](function () {
            return {
              message: response.statusText
            };
          });
        case 15:
          errorData = _context10.sent;
          ModalManager.showAlert('Error', "Error fetching user data: ".concat(errorData.message || response.statusText));
          throw new Error("API error: ".concat(response.status));
        case 18:
          _context10.next = 20;
          return response.json();
        case 20:
          data = _context10.sent;
          newUsername = data && data.user ? data.user.username : null;
          if (!newUsername) {
            _context10.next = 40;
            break;
          }
          _context10.next = 25;
          return loadPlayerData();
        case 25:
          playerData = _context10.sent;
          player = playerData[playerId];
          if (!(player && player.name !== newUsername)) {
            _context10.next = 37;
            break;
          }
          oldUsername = player.name;
          player.name = newUsername;
          updateUsernameHistory(player, oldUsername); // Ensure this function is defined and works
          _context10.next = 33;
          return savePlayerData(playerData);
        case 33:
          ModalManager.showAlert('Success', "Player ".concat(playerId, "'s name updated from \"").concat(oldUsername, "\" to \"").concat(newUsername, "\"."));
          if (refreshListCallback) refreshListCallback();
          _context10.next = 38;
          break;
        case 37:
          if (player && player.name === newUsername) {
            ModalManager.showAlert('Success', "Player ".concat(playerId, "'s name \"").concat(newUsername, "\" is already up-to-date."));
          } else {
            ModalManager.showAlert('Error', "Player ".concat(playerId, " not found in local data. This shouldn't happen."));
          }
        case 38:
          _context10.next = 41;
          break;
        case 40:
          ModalManager.showAlert('Error', "Could not retrieve a valid username for player ".concat(playerId, "."));
        case 41:
          _context10.next = 46;
          break;
        case 43:
          _context10.prev = 43;
          _context10.t0 = _context10["catch"](2);
          console.error('Error refreshing username:', _context10.t0);
          // ModalManager.showAlert('Error', 'Failed to refresh username. See console for details.'); // Already alerted specific errors
        case 46:
          _context10.prev = 46;
          buttonElement.disabled = false;
          buttonElement.innerHTML = '&#x21bb;'; // Reset to refresh icon
          return _context10.finish(46);
        case 50:
        case "end":
          return _context10.stop();
      }
    }, _callee10, null, [[2, 43, 46, 50]]);
  }));
  return _handleRefreshUserName.apply(this, arguments);
}
function updateUsernameHistory(playerObject, oldUsername) {
  if (!playerObject) return false;
  var newUsername = playerObject.name; // Assumes playerObject.name has been updated to the new name

  if (oldUsername && newUsername && oldUsername.toLowerCase() !== newUsername.toLowerCase()) {
    if (!playerObject.usernameHistory) {
      playerObject.usernameHistory = [];
    }

    // Check if the old username is already the most recent entry (to avoid duplicates if rapidly changed)
    var lastHistoryEntry = playerObject.usernameHistory.length > 0 ? playerObject.usernameHistory[0].username : null;

    // Add the *previous* name to history only if it's not already the latest entry
    if (!lastHistoryEntry || lastHistoryEntry.toLowerCase() !== oldUsername.toLowerCase()) {
      playerObject.usernameHistory.unshift({
        username: oldUsername,
        timestamp: Date.now()
      });
      // console.log(`[Username History] Added '${oldUsername}' to history for player ${playerObject.id}. New name: '${newUsername}'.`);
      return true; // Indicates history was updated
    }
  }
  return false; // No update to history needed
}

/**
 * Function to allow editing of player details or adding a new player
 * @param {string|null} playerId - The ID of the player to edit, null for new player
 * @param {boolean} isNewPlayer - Whether this is a new player being added
 * @param {Function} callback - Optional callback after player is saved
 */
function editPlayerDetails(_x24) {
  return _editPlayerDetails.apply(this, arguments);
}
/**
 * Render the known players list, optionally filtering by search term.
 * @param {HTMLElement} container - The container element to render into.
 * @param {string} [searchTerm=''] - Optional search term to filter players.
 */
function _editPlayerDetails() {
  _editPlayerDetails = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee12(playerId) {
    var isNewPlayer,
      _callback,
      playerData,
      player,
      modalTitle,
      playerDataForForm,
      modalBodyContent,
      idDiv,
      idLabel,
      idInput,
      idHelperText,
      nameDiv,
      nameLabel,
      nameInput,
      scoreDiv,
      scoreLabel,
      scoreInput,
      notesDiv,
      notesLabel,
      notesTextarea,
      buttonsConfig,
      _args12 = arguments;
    return _regeneratorRuntime().wrap(function _callee12$(_context12) {
      while (1) switch (_context12.prev = _context12.next) {
        case 0:
          isNewPlayer = _args12.length > 1 && _args12[1] !== undefined ? _args12[1] : false;
          _callback = _args12.length > 2 ? _args12[2] : undefined;
          _context12.next = 4;
          return loadPlayerData();
        case 4:
          playerData = _context12.sent;
          player = null;
          modalTitle = 'Add New Player';
          playerDataForForm = {
            name: '',
            score: null,
            notes: ''
          }; // If editing an existing player
          if (!(playerId && !isNewPlayer)) {
            _context12.next = 15;
            break;
          }
          player = playerData[playerId];
          if (player) {
            _context12.next = 13;
            break;
          }
          ModalManager.showAlert('Error', 'Player not found.');
          return _context12.abrupt("return");
        case 13:
          modalTitle = "Edit Player: ".concat(player.name || "ID: ".concat(playerId));
          playerDataForForm = playerData[playerId]; // Get existing data
        case 15:
          // Create modal body content using DOM manipulation
          modalBodyContent = document.createElement('div');
          modalBodyContent.classList.add('modal-edit-player-form');

          // Player ID (for Add New)
          idDiv = document.createElement('div');
          idLabel = document.createElement('label');
          idLabel.htmlFor = 'modalEditPlayerId';
          idLabel.textContent = 'Player ID:';
          idInput = document.createElement('input');
          idInput.type = 'text';
          idInput.id = 'modalEditPlayerId';
          idInput.required = true;
          idInput.value = playerId || '';
          idInput.disabled = !isNewPlayer; // Only enable editing for new players
          idDiv.appendChild(idLabel);
          idDiv.appendChild(idInput);
          modalBodyContent.appendChild(idDiv);

          // Add ID format helper text for new players
          if (isNewPlayer) {
            idHelperText = document.createElement('small');
            idHelperText.textContent = 'Enter a 10+ digit numerical ID (from botc.app)';
            idHelperText.style.display = 'block';
            idHelperText.style.marginTop = '2px';
            idHelperText.style.fontSize = '0.8em';
            idHelperText.style.color = 'var(--text-muted)';
            idDiv.appendChild(idHelperText);
          }

          // Player Name
          nameDiv = document.createElement('div');
          nameLabel = document.createElement('label');
          nameLabel.htmlFor = 'modalEditPlayerName';
          nameLabel.textContent = 'Player Name:';
          nameInput = document.createElement('input');
          nameInput.type = 'text';
          nameInput.id = 'modalEditPlayerName';
          nameInput.value = playerDataForForm.name || '';
          nameDiv.appendChild(nameLabel);
          nameDiv.appendChild(nameInput);
          modalBodyContent.appendChild(nameDiv);

          // Score
          scoreDiv = document.createElement('div');
          scoreLabel = document.createElement('label');
          scoreLabel.htmlFor = 'modalEditPlayerScore';
          scoreLabel.textContent = 'Score (1-5, optional):';
          scoreInput = document.createElement('input');
          scoreInput.type = 'number';
          scoreInput.id = 'modalEditPlayerScore';
          scoreInput.value = playerDataForForm.score === null || playerDataForForm.score === undefined ? '' : playerDataForForm.score;
          scoreInput.min = '1';
          scoreInput.max = '5';
          scoreDiv.appendChild(scoreLabel);
          scoreDiv.appendChild(scoreInput);
          modalBodyContent.appendChild(scoreDiv);

          // Notes
          notesDiv = document.createElement('div');
          notesLabel = document.createElement('label');
          notesLabel.htmlFor = 'modalEditPlayerNotes';
          notesLabel.textContent = 'Notes (optional):';
          notesTextarea = document.createElement('textarea');
          notesTextarea.id = 'modalEditPlayerNotes';
          notesTextarea.rows = 3;
          notesTextarea.textContent = playerDataForForm.notes || ''; // Use textContent for textarea
          notesDiv.appendChild(notesLabel);
          notesDiv.appendChild(notesTextarea);
          modalBodyContent.appendChild(notesDiv);

          // Define button configuration
          buttonsConfig = [{
            text: 'Cancel',
            className: 'modal-button-secondary',
            callback: function callback() {
              return ModalManager.closeModal();
            },
            // Simple close on cancel
            closesModal: true
          }, {
            text: 'Save Changes',
            className: 'modal-button-primary',
            callback: function () {
              var _callback2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee11() {
                var newId, newName, newScoreStr, newNotes, newScore, parsedScore, _playerData$playerId, uiUpdateCallback, finalPlayerId, existingFavoriteStatus;
                return _regeneratorRuntime().wrap(function _callee11$(_context11) {
                  while (1) switch (_context11.prev = _context11.next) {
                    case 0:
                      newId = document.getElementById('modalEditPlayerId').value.trim();
                      newName = document.getElementById('modalEditPlayerName').value.trim();
                      newScoreStr = document.getElementById('modalEditPlayerScore').value.trim();
                      newNotes = document.getElementById('modalEditPlayerNotes').value.trim(); // Validate new player ID if this is a new player
                      if (!isNewPlayer) {
                        _context11.next = 14;
                        break;
                      }
                      if (newId) {
                        _context11.next = 8;
                        break;
                      }
                      ModalManager.showAlert('Invalid Input', 'Player ID is required.');
                      return _context11.abrupt("return");
                    case 8:
                      if (/^\d{10,}$/.test(newId)) {
                        _context11.next = 11;
                        break;
                      }
                      ModalManager.showAlert('Invalid Input', 'Player ID must be a numerical value of at least 10 digits.');
                      return _context11.abrupt("return");
                    case 11:
                      if (!playerData[newId]) {
                        _context11.next = 14;
                        break;
                      }
                      ModalManager.showAlert('Player Exists', 'A player with this ID already exists. Please edit that player instead.');
                      return _context11.abrupt("return");
                    case 14:
                      newScore = null;
                      if (!newScoreStr) {
                        _context11.next = 23;
                        break;
                      }
                      parsedScore = parseInt(newScoreStr, 10);
                      if (!(isNaN(parsedScore) || parsedScore < 1 || parsedScore > 5)) {
                        _context11.next = 22;
                        break;
                      }
                      ModalManager.showAlert('Invalid Input', 'Invalid score. Must be a number between 1 and 5. Score will not be changed unless corrected.');
                      return _context11.abrupt("return");
                    case 22:
                      newScore = parsedScore;
                    case 23:
                      _context11.prev = 23;
                      // Define the UI update callback for after player data is saved
                      uiUpdateCallback = function uiUpdateCallback(updatedPlayer) {
                        if (updatedPlayer) {
                          if (isNewPlayer) {
                            ModalManager.showAlert('Success', "Player ".concat(updatedPlayer.name || updatedPlayer.id, " added successfully!"));
                          } else {
                            ModalManager.showAlert('Success', "Player ".concat(updatedPlayer.name || updatedPlayer.id, " details updated."));
                          }

                          // Call the provided callback function if it exists
                          if (typeof _callback === 'function') {
                            _callback(updatedPlayer);
                          } else if (typeof window.renderKnownPlayers === 'function') {
                            window.renderKnownPlayers(); // Refresh the list
                          } else if (typeof renderKnownPlayers === 'function') {
                            renderKnownPlayers(); // If called from within userManager.js context
                          }
                          ModalManager.closeModal();
                        }
                      }; // Use the appropriate player ID based on whether we're adding or editing
                      finalPlayerId = isNewPlayer ? newId : playerId; // If adding a new player, don't carry over any favorite status
                      existingFavoriteStatus = isNewPlayer ? false : ((_playerData$playerId = playerData[playerId]) === null || _playerData$playerId === void 0 ? void 0 : _playerData$playerId.isFavorite) || false; // Call addPlayer (which handles both creation and updates)
                      _context11.next = 29;
                      return addPlayer(finalPlayerId, newName || "Player ".concat(finalPlayerId), newScore, newNotes, existingFavoriteStatus, uiUpdateCallback);
                    case 29:
                      _context11.next = 35;
                      break;
                    case 31:
                      _context11.prev = 31;
                      _context11.t0 = _context11["catch"](23);
                      console.error("Failed to update player:", _context11.t0);
                      ModalManager.showAlert('Error', "Failed to update player: ".concat(_context11.t0.message));
                    case 35:
                    case "end":
                      return _context11.stop();
                  }
                }, _callee11, null, [[23, 31]]);
              }));
              function callback() {
                return _callback2.apply(this, arguments);
              }
              return callback;
            }(),
            closesModal: false // Handle close explicitly in callback after save/error
          }]; // Call ModalManager with the created DOM element and button config

          ModalManager.showModal(modalTitle, modalBodyContent, buttonsConfig);
        case 68:
        case "end":
          return _context12.stop();
      }
    }, _callee12);
  }));
  return _editPlayerDetails.apply(this, arguments);
}
function renderKnownPlayers(_x25) {
  return _renderKnownPlayers.apply(this, arguments);
}
/**
 * Fetches and updates a player's name from the API.
 * @param {string} playerId - The ID of the player to update.
 * @param {Function} [refreshListCallback] - Optional callback to refresh the list after updating.
 */
function _renderKnownPlayers() {
  _renderKnownPlayers = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee13(container) {
    var searchTerm,
      playerData,
      onlinePlayerIds,
      ids,
      _args13 = arguments;
    return _regeneratorRuntime().wrap(function _callee13$(_context13) {
      while (1) switch (_context13.prev = _context13.next) {
        case 0:
          searchTerm = _args13.length > 1 && _args13[1] !== undefined ? _args13[1] : '';
          if (container) {
            _context13.next = 4;
            break;
          }
          console.error("Container element not provided for rendering known players.");
          return _context13.abrupt("return");
        case 4:
          _context13.next = 6;
          return loadPlayerData();
        case 6:
          _context13.t0 = _context13.sent;
          if (_context13.t0) {
            _context13.next = 9;
            break;
          }
          _context13.t0 = {};
        case 9:
          playerData = _context13.t0;
          if (!(_typeof(playerData) !== 'object')) {
            _context13.next = 13;
            break;
          }
          console.error('Invalid player data format');
          return _context13.abrupt("return");
        case 13:
          // Fetch the latest set of online player IDs
          onlinePlayerIds = new Set();
          _context13.prev = 14;
          if (!(typeof window.fetchOnlinePlayerIds === 'function')) {
            _context13.next = 22;
            break;
          }
          _context13.next = 18;
          return window.fetchOnlinePlayerIds();
        case 18:
          ids = _context13.sent;
          // Ensure we have a valid Set
          onlinePlayerIds = ids instanceof Set ? ids : new Set();
          _context13.next = 23;
          break;
        case 22:
          console.warn("window.fetchOnlinePlayerIds function not found.");
        case 23:
          _context13.next = 28;
          break;
        case 25:
          _context13.prev = 25;
          _context13.t1 = _context13["catch"](14);
          console.error("Error fetching online player IDs in renderKnownPlayers:", _context13.t1);
          // Continue with empty Set on error
        case 28:
          _context13.prev = 28;
          _context13.next = 31;
          return displayKnownPlayers(container, searchTerm || '', playerData, onlinePlayerIds, typeof createUsernameHistoryModal === 'function' ? createUsernameHistoryModal : null, function () {
            return renderKnownPlayers(container, searchTerm);
          });
        case 31:
          _context13.next = 37;
          break;
        case 33:
          _context13.prev = 33;
          _context13.t2 = _context13["catch"](28);
          console.error('Error displaying known players:', _context13.t2);
          container.innerHTML = '<p>Error displaying player list. Please try again.</p>';
        case 37:
        case "end":
          return _context13.stop();
      }
    }, _callee13, null, [[14, 25], [28, 33]]);
  }));
  return _renderKnownPlayers.apply(this, arguments);
}
function fetchAndUpdatePlayerName(_x26, _x27) {
  return _fetchAndUpdatePlayerName.apply(this, arguments);
} // Export functions to window for non-module access
function _fetchAndUpdatePlayerName() {
  _fetchAndUpdatePlayerName = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee14(playerId, refreshListCallback) {
    var authToken, response, errorData, data, newUsername, currentPlayerData, player, oldUsername;
    return _regeneratorRuntime().wrap(function _callee14$(_context14) {
      while (1) switch (_context14.prev = _context14.next) {
        case 0:
          if (playerId) {
            _context14.next = 2;
            break;
          }
          return _context14.abrupt("return");
        case 2:
          _context14.prev = 2;
          _context14.next = 5;
          return new Promise(function (resolve, reject) {
            chrome.storage.local.get('authToken', function (result) {
              if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
              }
              resolve(result.authToken);
            });
          });
        case 5:
          authToken = _context14.sent;
          if (authToken) {
            _context14.next = 9;
            break;
          }
          ModalManager.showAlert('Error', 'Authentication token not found for API call. Please log in.');
          throw new Error('Auth token not found for API call');
        case 9:
          _context14.next = 11;
          return fetch("https://botc.app/backend/user/".concat(playerId), {
            headers: {
              'Authorization': authToken
            }
          });
        case 11:
          response = _context14.sent;
          if (response.ok) {
            _context14.next = 17;
            break;
          }
          _context14.next = 15;
          return response.json()["catch"](function () {
            return {
              message: response.statusText
            };
          });
        case 15:
          errorData = _context14.sent;
          throw new Error("API request failed: ".concat(errorData.message || response.statusText));
        case 17:
          _context14.next = 19;
          return response.json();
        case 19:
          data = _context14.sent;
          newUsername = data && data.user ? data.user.username : null;
          if (!newUsername) {
            _context14.next = 29;
            break;
          }
          _context14.next = 24;
          return loadPlayerData();
        case 24:
          currentPlayerData = _context14.sent;
          // Load current data
          player = currentPlayerData[playerId];
          if (player) {
            oldUsername = player.name;
            if (player.name !== newUsername) {
              player.name = newUsername;
              // Update username history internally before saving through addPlayer
              // This logic is now encapsulated within addPlayer if name changes
              // For standalone name updates, ensure history is managed here or within addPlayer
              updateUsernameHistory(player, oldUsername); // Pass the player object and old name

              // Use addPlayer to ensure all fields are handled correctly and consistently
              // This will also trigger savePlayerData internally
              addPlayer(playerId, newUsername, player.score, player.notes, player.isFavorite, function (updatedPlayer) {
                ModalManager.showAlert('Success', "Player ".concat(playerId, "'s name updated from \"").concat(oldUsername, "\" to \"").concat(newUsername, "\"."));
                if (refreshListCallback) refreshListCallback();
              });
            } else {
              ModalManager.showAlert('Info', "Player ".concat(playerId, "'s name \"").concat(newUsername, "\" is already up-to-date."));
            }
          } else {
            ModalManager.showAlert('Notice', "Player ".concat(playerId, " not found in local data. You may add them if desired."));
            // Optionally trigger add player flow here if it's desired behavior
          }
          _context14.next = 30;
          break;
        case 29:
          ModalManager.showAlert('Warning', "Could not retrieve a valid username for player ".concat(playerId, " from API."));
        case 30:
          _context14.next = 36;
          break;
        case 32:
          _context14.prev = 32;
          _context14.t0 = _context14["catch"](2);
          console.error("Error fetching or updating player ".concat(playerId, " name:"), _context14.t0);
          ModalManager.showAlert('Error', "Failed to fetch/update player name: ".concat(_context14.t0.message));
        case 36:
        case "end":
          return _context14.stop();
      }
    }, _callee14, null, [[2, 32]]);
  }));
  return _fetchAndUpdatePlayerName.apply(this, arguments);
}
window.userManager = {
  getAllPlayerData: getAllPlayerData,
  loadPlayerData: loadPlayerData,
  savePlayerData: savePlayerData,
  addPlayer: addPlayer,
  updateUsernameHistoryIfNeeded: updateUsernameHistoryIfNeeded,
  updateSessionHistoryIfNeeded: updateSessionHistoryIfNeeded,
  createUsernameHistoryModal: createUsernameHistoryModal,
  displayKnownPlayers: displayKnownPlayers,
  renderKnownPlayers: renderKnownPlayers,
  editPlayerDetails: editPlayerDetails,
  deletePlayer: deletePlayer,
  toggleFavoriteStatus: toggleFavoriteStatus,
  handleRefreshUserName: handleRefreshUserName,
  fetchAndUpdatePlayerName: fetchAndUpdatePlayerName,
  replaceAllPlayerDataAndSave: replaceAllPlayerDataAndSave
};

// Export functions as a module


// Make getRatingClass globally available as other modules might use it directly
if (typeof window.getRatingClass === 'undefined') {
  window.getRatingClass = getRatingClass;
}
;// ./src/popup/popup.js
function popup_ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function popup_objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? popup_ownKeys(Object(t), !0).forEach(function (r) { popup_defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : popup_ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function popup_defineProperty(e, r, t) { return (r = popup_toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function popup_toPropertyKey(t) { var i = popup_toPrimitive(t, "string"); return "symbol" == popup_typeof(i) ? i : i + ""; }
function popup_toPrimitive(t, r) { if ("object" != popup_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != popup_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function popup_typeof(o) { "@babel/helpers - typeof"; return popup_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, popup_typeof(o); }
function popup_regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ popup_regeneratorRuntime = function _regeneratorRuntime() { return r; }; var t, r = {}, e = Object.prototype, n = e.hasOwnProperty, o = "function" == typeof Symbol ? Symbol : {}, i = o.iterator || "@@iterator", a = o.asyncIterator || "@@asyncIterator", u = o.toStringTag || "@@toStringTag"; function c(t, r, e, n) { return Object.defineProperty(t, r, { value: e, enumerable: !n, configurable: !n, writable: !n }); } try { c({}, ""); } catch (t) { c = function c(t, r, e) { return t[r] = e; }; } function h(r, e, n, o) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype); return c(a, "_invoke", function (r, e, n) { var o = 1; return function (i, a) { if (3 === o) throw Error("Generator is already running"); if (4 === o) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var u = n.delegate; if (u) { var c = d(u, n); if (c) { if (c === f) continue; return c; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (1 === o) throw o = 4, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = 3; var h = s(r, e, n); if ("normal" === h.type) { if (o = n.done ? 4 : 2, h.arg === f) continue; return { value: h.arg, done: n.done }; } "throw" === h.type && (o = 4, n.method = "throw", n.arg = h.arg); } }; }(r, n, new Context(o || [])), !0), a; } function s(t, r, e) { try { return { type: "normal", arg: t.call(r, e) }; } catch (t) { return { type: "throw", arg: t }; } } r.wrap = h; var f = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var l = {}; c(l, i, function () { return this; }); var p = Object.getPrototypeOf, y = p && p(p(x([]))); y && y !== e && n.call(y, i) && (l = y); var v = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(l); function g(t) { ["next", "throw", "return"].forEach(function (r) { c(t, r, function (t) { return this._invoke(r, t); }); }); } function AsyncIterator(t, r) { function e(o, i, a, u) { var c = s(t[o], t, i); if ("throw" !== c.type) { var h = c.arg, f = h.value; return f && "object" == popup_typeof(f) && n.call(f, "__await") ? r.resolve(f.__await).then(function (t) { e("next", t, a, u); }, function (t) { e("throw", t, a, u); }) : r.resolve(f).then(function (t) { h.value = t, a(h); }, function (t) { return e("throw", t, a, u); }); } u(c.arg); } var o; c(this, "_invoke", function (t, n) { function i() { return new r(function (r, o) { e(t, n, r, o); }); } return o = o ? o.then(i, i) : i(); }, !0); } function d(r, e) { var n = e.method, o = r.i[n]; if (o === t) return e.delegate = null, "throw" === n && r.i["return"] && (e.method = "return", e.arg = t, d(r, e), "throw" === e.method) || "return" !== n && (e.method = "throw", e.arg = new TypeError("The iterator does not provide a '" + n + "' method")), f; var i = s(o, r.i, e.arg); if ("throw" === i.type) return e.method = "throw", e.arg = i.arg, e.delegate = null, f; var a = i.arg; return a ? a.done ? (e[r.r] = a.value, e.next = r.n, "return" !== e.method && (e.method = "next", e.arg = t), e.delegate = null, f) : a : (e.method = "throw", e.arg = new TypeError("iterator result is not an object"), e.delegate = null, f); } function w(t) { this.tryEntries.push(t); } function m(r) { var e = r[4] || {}; e.type = "normal", e.arg = t, r[4] = e; } function Context(t) { this.tryEntries = [[-1]], t.forEach(w, this), this.reset(!0); } function x(r) { if (null != r) { var e = r[i]; if (e) return e.call(r); if ("function" == typeof r.next) return r; if (!isNaN(r.length)) { var o = -1, a = function e() { for (; ++o < r.length;) if (n.call(r, o)) return e.value = r[o], e.done = !1, e; return e.value = t, e.done = !0, e; }; return a.next = a; } } throw new TypeError(popup_typeof(r) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, c(v, "constructor", GeneratorFunctionPrototype), c(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = c(GeneratorFunctionPrototype, u, "GeneratorFunction"), r.isGeneratorFunction = function (t) { var r = "function" == typeof t && t.constructor; return !!r && (r === GeneratorFunction || "GeneratorFunction" === (r.displayName || r.name)); }, r.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, c(t, u, "GeneratorFunction")), t.prototype = Object.create(v), t; }, r.awrap = function (t) { return { __await: t }; }, g(AsyncIterator.prototype), c(AsyncIterator.prototype, a, function () { return this; }), r.AsyncIterator = AsyncIterator, r.async = function (t, e, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(h(t, e, n, o), i); return r.isGeneratorFunction(e) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, g(v), c(v, u, "Generator"), c(v, i, function () { return this; }), c(v, "toString", function () { return "[object Generator]"; }), r.keys = function (t) { var r = Object(t), e = []; for (var n in r) e.unshift(n); return function t() { for (; e.length;) if ((n = e.pop()) in r) return t.value = n, t.done = !1, t; return t.done = !0, t; }; }, r.values = x, Context.prototype = { constructor: Context, reset: function reset(r) { if (this.prev = this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(m), !r) for (var e in this) "t" === e.charAt(0) && n.call(this, e) && !isNaN(+e.slice(1)) && (this[e] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0][4]; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(r) { if (this.done) throw r; var e = this; function n(t) { a.type = "throw", a.arg = r, e.next = t; } for (var o = e.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i[4], u = this.prev, c = i[1], h = i[2]; if (-1 === i[0]) return n("end"), !1; if (!c && !h) throw Error("try statement without catch or finally"); if (null != i[0] && i[0] <= u) { if (u < c) return this.method = "next", this.arg = t, n(c), !0; if (u < h) return n(h), !1; } } }, abrupt: function abrupt(t, r) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var n = this.tryEntries[e]; if (n[0] > -1 && n[0] <= this.prev && this.prev < n[2]) { var o = n; break; } } o && ("break" === t || "continue" === t) && o[0] <= r && r <= o[2] && (o = null); var i = o ? o[4] : {}; return i.type = t, i.arg = r, o ? (this.method = "next", this.next = o[2], f) : this.complete(i); }, complete: function complete(t, r) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && r && (this.next = r), f; }, finish: function finish(t) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var e = this.tryEntries[r]; if (e[2] === t) return this.complete(e[4], e[3]), m(e), f; } }, "catch": function _catch(t) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var e = this.tryEntries[r]; if (e[0] === t) { var n = e[4]; if ("throw" === n.type) { var o = n.arg; m(e); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(r, e, n) { return this.delegate = { i: x(r), r: e, n: n }, "next" === this.method && (this.arg = t), f; } }, r; }
function popup_asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function popup_asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { popup_asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { popup_asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }



// Globally accessible filter options for the popup
var currentFilterOptions = {
  officialOnly: false,
  hideCompleted: false
};
document.addEventListener('DOMContentLoaded', /*#__PURE__*/popup_asyncToGenerator(/*#__PURE__*/popup_regeneratorRuntime().mark(function _callee0() {
  var setBotcGamePlayerId, fetchButton, officialOnlyCheckbox, searchInput, exportPlayersButton, importPlayersButton, importFileInput, importStatusDiv, addPlayerButton, clearAllPlayerDataButton, darkModeToggle, sessionListDiv, loadingIndicator, knownPlayersDiv, onlineFavoritesListDiv, onlineFavoritesCountSpan, openInTabButton, fetchStatsSpan, tabButtons, tabContents, latestSessionData, showOfficialOnly, searchTimeout, setLatestSessionData, setDarkMode, showTab, accountTabLoaded, loadAccountTabScript, refreshDisplayedSessions, _refreshDisplayedSessions, refreshAllViews, _refreshAllViews, refreshDependentViews, _refreshDependentViews, applySessionFilters, openInTabBtn;
  return popup_regeneratorRuntime().wrap(function _callee0$(_context0) {
    while (1) switch (_context0.prev = _context0.next) {
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
        _refreshDependentViews = function _refreshDependentView2() {
          _refreshDependentViews = popup_asyncToGenerator(/*#__PURE__*/popup_regeneratorRuntime().mark(function _callee9(updatedPlayerId) {
            var currentPlayerData, onlinePlayerIds, onlinePlayersObjectForFavorites, userManagementTab, _knownPlayersDiv3, _searchInput3;
            return popup_regeneratorRuntime().wrap(function _callee9$(_context9) {
              while (1) switch (_context9.prev = _context9.next) {
                case 0:
                  _context9.prev = 0;
                  console.log("[Popup] Refreshing dependent views for player ID: ".concat(updatedPlayerId));
                  _context9.next = 4;
                  return window.userManager.getAllPlayerData();
                case 4:
                  currentPlayerData = _context9.sent;
                  _context9.next = 7;
                  return window.fetchOnlinePlayerIds();
                case 7:
                  onlinePlayerIds = _context9.sent;
                  // Prepare onlinePlayersObject for favorites list
                  onlinePlayersObjectForFavorites = {};
                  if (window.latestSessionData && Array.isArray(window.latestSessionData)) {
                    window.latestSessionData.forEach(function (session) {
                      var _session$usersAll3;
                      (_session$usersAll3 = session.usersAll) === null || _session$usersAll3 === void 0 || _session$usersAll3.forEach(function (user) {
                        if (user !== null && user !== void 0 && user.id && onlinePlayerIds.has(user.id.toString())) {
                          onlinePlayersObjectForFavorites[user.id.toString()] = session.name || true;
                        }
                      });
                    });
                  }

                  // 1. Refresh Online Favorites list
                  if (typeof window.updateOnlineFavoritesListFunc === 'function') {
                    console.log("[Popup] Refreshing Online Favorites list (targeted).");
                    window.updateOnlineFavoritesListFunc(currentPlayerData, onlinePlayersObjectForFavorites);
                  }

                  // 2. Refresh Known Players list (User Management tab, if active)
                  userManagementTab = document.getElementById('userManagement');
                  _knownPlayersDiv3 = document.getElementById('knownPlayers'); // ensure it's defined
                  _searchInput3 = document.getElementById('userSearch'); // ensure it's defined
                  if (userManagementTab && userManagementTab.classList.contains('active') && _knownPlayersDiv3) {
                    console.log("[Popup] Refreshing Known Players list (targeted).");
                    // Note: renderKnownPlayers might need the updatedPlayerData directly
                    window.userManager.renderKnownPlayers(_knownPlayersDiv3, _searchInput3 ? _searchInput3.value.trim() : '', currentPlayerData,
                    // Pass the fresh data
                    onlinePlayerIds, window.userManager.createUsernameHistoryModal, window.refreshAllViews // Actions on these cards still use full refresh for now
                    );
                  }
                  console.log("[Popup] refreshDependentViews for player ID: ".concat(updatedPlayerId, " completed."));
                  _context9.next = 21;
                  break;
                case 18:
                  _context9.prev = 18;
                  _context9.t0 = _context9["catch"](0);
                  console.error("[Popup] Error during refreshDependentViews for player ID: ".concat(updatedPlayerId, ":"), _context9.t0);
                case 21:
                case "end":
                  return _context9.stop();
              }
            }, _callee9, null, [[0, 18]]);
          }));
          return _refreshDependentViews.apply(this, arguments);
        };
        refreshDependentViews = function _refreshDependentView(_x2) {
          return _refreshDependentViews.apply(this, arguments);
        };
        _refreshAllViews = function _refreshAllViews3() {
          _refreshAllViews = popup_asyncToGenerator(/*#__PURE__*/popup_regeneratorRuntime().mark(function _callee8(initiatingAction) {
            var currentPlayerData, onlinePlayerIds, onlinePlayersObjectForFavorites, userManagementTab, _knownPlayersDiv2, _searchInput2;
            return popup_regeneratorRuntime().wrap(function _callee8$(_context8) {
              while (1) switch (_context8.prev = _context8.next) {
                case 0:
                  console.log("[Popup] refreshAllViews called, initiated by: ".concat(initiatingAction || 'unknown'));
                  if (!(!window.userManager || typeof window.userManager.getAllPlayerData !== 'function' || typeof window.userManager.renderKnownPlayers !== 'function')) {
                    _context8.next = 4;
                    break;
                  }
                  console.error("[Popup] User manager not fully available for refreshAllViews.");
                  return _context8.abrupt("return");
                case 4:
                  _context8.prev = 4;
                  _context8.next = 7;
                  return window.userManager.getAllPlayerData();
                case 7:
                  currentPlayerData = _context8.sent;
                  window.playerData = currentPlayerData; // EXPLICITLY UPDATE window.playerData
                  _context8.next = 11;
                  return window.fetchOnlinePlayerIds();
                case 11:
                  onlinePlayerIds = _context8.sent;
                  // Returns a Set of IDs
                  // Reconstruct onlinePlayersObject (maps ID to session name or true) for favorites list
                  onlinePlayersObjectForFavorites = {};
                  if (window.latestSessionData && onlinePlayerIds.size > 0) {
                    window.latestSessionData.forEach(function (session) {
                      var _session$usersAll2;
                      (_session$usersAll2 = session.usersAll) === null || _session$usersAll2 === void 0 || _session$usersAll2.forEach(function (user) {
                        if (user !== null && user !== void 0 && user.id && onlinePlayerIds.has(user.id.toString())) {
                          onlinePlayersObjectForFavorites[user.id.toString()] = session.name || true;
                        }
                      });
                    });
                  }

                  // 1. Refresh Known Players list (User Management tab)
                  // Check if the User Management tab is active before re-rendering it.
                  userManagementTab = document.getElementById('userManagement');
                  _knownPlayersDiv2 = document.getElementById('knownPlayers'); // ensure it's defined
                  _searchInput2 = document.getElementById('userSearch'); // ensure it's defined
                  if (userManagementTab && userManagementTab.classList.contains('active') && _knownPlayersDiv2) {
                    console.log("[Popup] Refreshing Known Players list.");
                    // renderKnownPlayers expects: container, searchTerm, playerData, onlinePlayerIds (Set), createUsernameHistoryModalFunc, refreshCallback
                    // We need to ensure createUsernameHistoryModal and a suitable refresh callback (e.g., refreshAllViews itself, or a limited version) are passed if needed by displayKnownPlayers' actions.
                    // For now, assuming renderKnownPlayers handles its own internal action callbacks or we address that separately.
                    window.userManager.renderKnownPlayers(_knownPlayersDiv2, _searchInput2 ? _searchInput2.value.trim() : '', currentPlayerData, onlinePlayerIds, window.userManager.createUsernameHistoryModal,
                    // Pass the actual function
                    refreshAllViews // Pass refreshAllViews for actions within player cards
                    );
                  }

                  // 2. Refresh Online Favorites list
                  if (typeof window.updateOnlineFavoritesListFunc === 'function') {
                    console.log("[Popup] Refreshing Online Favorites list.");
                    window.updateOnlineFavoritesListFunc(currentPlayerData, onlinePlayersObjectForFavorites);
                  }

                  // 3. Refresh Sessions list
                  if (!(typeof refreshDisplayedSessions === 'function')) {
                    _context8.next = 23;
                    break;
                  }
                  console.log("[Popup] Refreshing Sessions list.");
                  // Consider if refreshDisplayedSessions needs currentPlayerData for player-specific highlights/info in session cards
                  _context8.next = 23;
                  return refreshDisplayedSessions();
                case 23:
                  console.log("[Popup] refreshAllViews completed.");
                  _context8.next = 29;
                  break;
                case 26:
                  _context8.prev = 26;
                  _context8.t0 = _context8["catch"](4);
                  console.error("[Popup] Error during refreshAllViews:", _context8.t0);
                case 29:
                case "end":
                  return _context8.stop();
              }
            }, _callee8, null, [[4, 26]]);
          }));
          return _refreshAllViews.apply(this, arguments);
        };
        refreshAllViews = function _refreshAllViews2(_x) {
          return _refreshAllViews.apply(this, arguments);
        };
        _refreshDisplayedSessions = function _refreshDisplayedSess2() {
          _refreshDisplayedSessions = popup_asyncToGenerator(/*#__PURE__*/popup_regeneratorRuntime().mark(function _callee7() {
            var playerDataResponse, addPlayerFunction, createUsernameHistoryModalFunction, fetchAndDisplaySessionsFunc;
            return popup_regeneratorRuntime().wrap(function _callee7$(_context7) {
              while (1) switch (_context7.prev = _context7.next) {
                case 0:
                  if (loadingIndicator) loadingIndicator.style.display = 'block';
                  if (sessionListDiv) sessionListDiv.innerHTML = ''; // Clear previous sessions
                  if (fetchStatsSpan) fetchStatsSpan.textContent = ''; // Clear previous stats

                  // Update currentFilterOptions based on checkbox state
                  currentFilterOptions.officialOnly = officialOnlyCheckbox ? officialOnlyCheckbox.checked : false;

                  // Ensure window.playerData is populated. It should be by the time this is called after initial setup.
                  // If called before initial setup, it might be empty, which sessionManager now handles with a warning.
                  // MODIFIED Condition: Check if playerData is falsy OR an empty object.
                  if (!(!window.playerData || Object.keys(window.playerData).length === 0)) {
                    _context7.next = 17;
                    break;
                  }
                  console.warn('[Popup] refreshDisplayedSessions: window.playerData is empty or not initialized. Attempting fallback load.');
                  // Attempt to load it now as a fallback - ideally, popup.js structure ensures it's loaded prior.
                  _context7.prev = 6;
                  _context7.next = 9;
                  return sendMessagePromise({
                    type: 'GET_PLAYER_DATA'
                  });
                case 9:
                  playerDataResponse = _context7.sent;
                  window.playerData = playerDataResponse && playerDataResponse.playerData ? playerDataResponse.playerData : {};
                  _context7.next = 17;
                  break;
                case 13:
                  _context7.prev = 13;
                  _context7.t0 = _context7["catch"](6);
                  console.error('[Popup] Error during fallback playerData load:', _context7.t0);
                  window.playerData = {}; // Ensure it's at least an empty object
                case 17:
                  _context7.prev = 17;
                  addPlayerFunction = addPlayer;
                  createUsernameHistoryModalFunction = createUsernameHistoryModal; // Check if the function exists on window, if not - try accessing it via a more reliable method
                  fetchAndDisplaySessionsFunc = window.fetchAndDisplaySessions || typeof sessionManager !== 'undefined' && sessionManager.fetchAndDisplaySessions;
                  if (fetchAndDisplaySessionsFunc) {
                    _context7.next = 23;
                    break;
                  }
                  throw new Error('fetchAndDisplaySessions function not found. SessionManager may not be fully loaded.');
                case 23:
                  _context7.next = 25;
                  return fetchAndDisplaySessionsFunc(addPlayer, createUsernameHistoryModal, window.updateOnlineFavoritesListFunc, sessionListDiv, currentFilterOptions, function (sessionsData, errorData) {
                    if (loadingIndicator) loadingIndicator.style.display = 'none';
                    if (errorData) {
                      console.error("[Popup] Error reported by fetchAndDisplaySessions (main load):", errorData);
                      if (sessionListDiv) sessionListDiv.innerHTML = "<p class='error-message'>Failed to display sessions: ".concat(errorData, "</p>");
                    } else {
                      // Success path for main load
                      latestSessionData = sessionsData;
                      window.latestSessionData = sessionsData; // Update global
                      if (document.getElementById('userManagement').classList.contains('active') && window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                        var _knownPlayersDiv = document.getElementById('knownPlayers');
                        var _searchInput = document.getElementById('userSearch');
                        window.userManager.renderKnownPlayers(_knownPlayersDiv, _searchInput ? _searchInput.value.trim() : '');
                      } else if (document.getElementById('userManagement').classList.contains('active')) {
                        console.error("User manager or renderKnownPlayers function not available (main load).");
                      }
                    }
                  });
                case 25:
                  _context7.next = 32;
                  break;
                case 27:
                  _context7.prev = 27;
                  _context7.t1 = _context7["catch"](17);
                  console.error("[Popup] Critical error calling fetchAndDisplaySessions:", _context7.t1);
                  if (loadingIndicator) loadingIndicator.style.display = 'none';
                  if (sessionListDiv) sessionListDiv.innerHTML = "<p class='error-message'>A critical error occurred: ".concat(_context7.t1.message, "</p>");
                case 32:
                case "end":
                  return _context7.stop();
              }
            }, _callee7, null, [[6, 13], [17, 27]]);
          }));
          return _refreshDisplayedSessions.apply(this, arguments);
        };
        refreshDisplayedSessions = function _refreshDisplayedSess() {
          return _refreshDisplayedSessions.apply(this, arguments);
        };
        loadAccountTabScript = function _loadAccountTabScript(callback) {
          // Check if already loaded to prevent duplicate loading
          if (accountTabLoaded || document.querySelector('script[src="accountTab.js"]')) {
            // Skip loading if already loaded
            accountTabLoaded = true;
            if (callback) callback();
            return;
          }

          // Load the script dynamically
          var script = document.createElement('script');
          script.src = 'accountTab.js';
          script.onload = function () {
            accountTabLoaded = true;
            if (callback) callback();
          };
          document.head.appendChild(script);
        };
        showTab = function _showTab(tabName) {
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
            // Load the account tab script when switching to that tab
            loadAccountTabScript(function () {
              if (window.initAccountTab) window.initAccountTab();
            });
          }
        };
        setDarkMode = function _setDarkMode(isDark) {
          document.body.classList.toggle('dark-mode', isDark);
          if (darkModeToggle) {
            darkModeToggle.checked = isDark;
          }
          chrome.storage.local.set({
            theme: isDark ? 'dark' : 'light'
          });
        };
        setLatestSessionData = function _setLatestSessionData(sessions) {
          latestSessionData = sessions;
          window.latestSessionData = sessions;
        };
        // Request current game info from background script
        chrome.runtime.sendMessage({
          type: 'GET_CURRENT_GAME_INFO'
        }, function (response) {
          if (response && response.gameInfo) {
            window.liveGameInfo = response.gameInfo;
          } else {
            window.liveGameInfo = null;
          }
          // Potentially refresh UI elements that depend on liveGameInfo here
        });

        // Function to parse botc.app authToken and set window.currentUserID
        setBotcGamePlayerId = function setBotcGamePlayerId(token) {
          var actualToken = token;
          if (typeof token === 'string' && token.toLowerCase().startsWith('bearer ')) {
            actualToken = token.substring(7); // Remove "Bearer " (7 characters)
          }
          var parsedToken = window.parseMyCustomBotcJwt(actualToken);
          if (parsedToken && parsedToken.id) {
            window.currentUserID = String(parsedToken.id);
          } else if (parsedToken && parsedToken.user_id) {
            window.currentUserID = String(parsedToken.user_id);
          } else if (parsedToken && parsedToken.sub) {
            window.currentUserID = String(parsedToken.sub);
          } else {
            window.currentUserID = null;
            if (actualToken) {
              // Only warn if there was a token to parse
              console.warn('[Popup] Failed to parse botc.app authToken or find ID field (id, user_id, sub). Token payload:', parsedToken);
            }
          }
          // If UI elements depend on currentUserID, refresh them here
        }; // Attempt to load botc.app authToken from storage and set currentUserID (for game context)

        chrome.storage.local.get('authToken', function (data) {
          if (data.authToken) {
            setBotcGamePlayerId(data.authToken);
          } else {
            window.currentUserID = null; // Ensure it's null if no token
          }
        });

        // Listen for botc.app token updates from background script
        chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
          if (message.type === 'TOKEN_ACQUIRED' || message.type === 'TOKEN_UPDATED') {
            // Listen for token updates
            setBotcGamePlayerId(message.token);
          }
          return false;
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
        // Global function to get online player IDs from latest session data
        window.fetchOnlinePlayerIds = /*#__PURE__*/popup_asyncToGenerator(/*#__PURE__*/popup_regeneratorRuntime().mark(function _callee() {
          var _window$latestSession, _window$userManager;
          var ids, onlineIds;
          return popup_regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                if (!(!((_window$latestSession = window.latestSessionData) !== null && _window$latestSession !== void 0 && _window$latestSession.length) || !Array.isArray(window.latestSessionData))) {
                  _context.next = 2;
                  break;
                }
                return _context.abrupt("return", new Set());
              case 2:
                if (!((_window$userManager = window.userManager) !== null && _window$userManager !== void 0 && _window$userManager.getOnlinePlayerIds)) {
                  _context.next = 5;
                  break;
                }
                ids = window.userManager.getOnlinePlayerIds(window.latestSessionData);
                return _context.abrupt("return", ids);
              case 5:
                // Fallback: process session data directly if userManager not available
                onlineIds = new Set();
                window.latestSessionData.forEach(function (session) {
                  var _session$usersAll;
                  (_session$usersAll = session.usersAll) === null || _session$usersAll === void 0 || _session$usersAll.forEach(function (user) {
                    if (user !== null && user !== void 0 && user.id && user.isOnline) {
                      onlineIds.add(user.id.toString());
                    }
                  });
                });
                return _context.abrupt("return", onlineIds);
              case 8:
              case "end":
                return _context.stop();
            }
          }, _callee);
        }));

        // Function to update the online favorites list UI
        window.updateOnlineFavoritesListFunc = function (playerData, onlinePlayersObject) {
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
          if (!playerData || popup_typeof(playerData) !== 'object') {
            console.error('[updateOnlineFavoritesListFunc] playerData is invalid:', playerData);
            onlineFavoritesListDiv.innerHTML = '<p>Error: Player data unavailable</p>';
            return;
          }

          // First, restructure the onlinePlayersObject for easier matching
          // Create a lookup by numeric-only IDs
          if (onlinePlayersObject && popup_typeof(onlinePlayersObject) === 'object') {
            for (var onlinePlayerId in onlinePlayersObject) {
              // Store both the original ID format and a numeric-only version
              var numericId = onlinePlayerId.replace(/\D/g, '');
              onlinePlayersByNumericId[numericId] = onlinePlayersObject[onlinePlayerId];
              onlineCount++;
            }
          } else {
            console.warn('[updateOnlineFavoritesListFunc] onlinePlayersObject is invalid or empty');
          }

          // Find all favorite players
          for (var playerId in playerData) {
            // Extra safety check
            if (!playerData[playerId]) continue;

            // Check if player is marked as favorite
            var isFavorite = playerData[playerId].isFavorite === true;
            if (isFavorite) {
              favoriteCount++;

              // Get the numeric version of the player ID
              var numericPlayerId = playerId.replace(/\D/g, '');

              // Check if the player is online using both original and numeric formats
              var isOnlineExact = !!onlinePlayersObject[playerId];
              var isOnlineNumeric = !!onlinePlayersByNumericId[numericPlayerId];
              var isOnline = isOnlineExact || isOnlineNumeric;

              // Get session name from whichever match worked
              var sessionName = null;
              if (isOnlineExact) {
                sessionName = onlinePlayersObject[playerId];
              } else if (isOnlineNumeric) {
                sessionName = onlinePlayersByNumericId[numericPlayerId];
              }
              if (isOnline) {
                onlineFavorites.push(popup_objectSpread({
                  id: playerId,
                  name: playerData[playerId].name || playerId,
                  sessionName: sessionName === true ? "Unknown Session" : sessionName
                }, playerData[playerId]));
              }
            }
          }

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
        };

        // Global scope for popup lifecycle
        window.currentUserID = null; // This will be the botc.app game player ID
        window.liveGameInfo = null;
        window.playerData = {}; // Initialize playerData

        // --- Dark Mode Functionality ---

        // Load saved theme preference or default to dark mode
        chrome.storage.local.get('theme', function (data) {
          if (data.theme === 'dark') {
            setDarkMode(true);
          } else if (data.theme === 'light') {
            setDarkMode(false);
          } else {
            // Default to dark mode if no theme is set
            setDarkMode(true);
          }
        });
        if (darkModeToggle) {
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
          button.addEventListener('click', /*#__PURE__*/popup_asyncToGenerator(/*#__PURE__*/popup_regeneratorRuntime().mark(function _callee2() {
            var tabName;
            return popup_regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  tabButtons.forEach(function (btn) {
                    return btn.classList.remove('active');
                  });
                  button.classList.add('active');
                  tabName = button.dataset.tab;
                  showTab(tabName);
                  // Render known players when switching to userManagement tab
                  if (tabName === 'userManagement') {
                    // Handle user management tab switching
                    if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                      // Always attempt to render known players first - this shouldn't depend on session data
                      window.userManager.renderKnownPlayers(knownPlayersDiv, searchInput ? searchInput.value.trim() : '');

                      // Attempt to fetch session data in the background for online status, but don't block the UI
                      if (!window.latestSessionData) {
                        // No session data available, fetch it but don't block user management rendering
                        window.fetchAndDisplaySessions(addPlayer, createUsernameHistoryModal, window.updateOnlineFavoritesListFunc, sessionListDiv, {
                          officialOnly: showOfficialOnly
                        }, function (sessionsData, errorData) {
                          if (loadingIndicator) loadingIndicator.style.display = 'none';
                          if (errorData) {
                            console.warn("[Popup] Error fetching sessions: " + errorData + ". User management will continue with limited functionality.");
                            if (sessionListDiv) sessionListDiv.innerHTML = "<p class='error-message'>Failed to display sessions: ".concat(errorData, "</p>");
                          } else {
                            // Success path for session data
                            latestSessionData = sessionsData;
                            window.latestSessionData = sessionsData; // Update global

                            // If user management tab is still active, refresh it with online status
                            if (document.getElementById('userManagement').classList.contains('active')) {
                              window.userManager.renderKnownPlayers(knownPlayersDiv, searchInput ? searchInput.value.trim() : '');
                            }
                          }
                        });
                      }
                    } else {
                      console.error("User manager or renderKnownPlayers function not available.");
                    }
                  }
                case 5:
                case "end":
                  return _context2.stop();
              }
            }, _callee2);
          })));
        });

        // Function to refresh the session display

        // --- Central UI Refresh Function ---

        window.refreshAllViews = refreshAllViews; // Expose globally if needed by other modules or for easier debugging

        // --- Targeted UI Refresh Function (excluding full session list re-render) ---

        window.refreshDependentViews = refreshDependentViews; // Expose globally

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
                if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                  window.userManager.renderKnownPlayers(knownPlayersDiv, searchInput.value.trim());
                } else {
                  console.error("User manager or renderKnownPlayers function not available for search.");
                }
              }
            }, 300);
          });
        }
        fetchButton.addEventListener('click', /*#__PURE__*/popup_asyncToGenerator(/*#__PURE__*/popup_regeneratorRuntime().mark(function _callee3() {
          return popup_regeneratorRuntime().wrap(function _callee3$(_context3) {
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
                }, function (sessionsData, errorData) {
                  if (loadingIndicator) loadingIndicator.style.display = 'none';
                  if (sessionListDiv) sessionListDiv.style.display = 'block';
                  // --- Force re-render of User Management tab if active ---
                  var userManagementTab = document.getElementById('userManagement');
                  if (userManagementTab && userManagementTab.classList.contains('active')) {
                    if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                      window.userManager.renderKnownPlayers(knownPlayersDiv, searchInput ? searchInput.value.trim() : '');
                    } else {
                      console.error("User manager or renderKnownPlayers function not available on fetch complete.");
                    }
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
          addPlayerButton.addEventListener('click', /*#__PURE__*/popup_asyncToGenerator(/*#__PURE__*/popup_regeneratorRuntime().mark(function _callee4() {
            return popup_regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  if (window.userManager && typeof window.userManager.editPlayerDetails === 'function') {
                    window.userManager.editPlayerDetails(null, true, window.refreshAllViews);
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
          exportPlayersButton.addEventListener('click', /*#__PURE__*/popup_asyncToGenerator(/*#__PURE__*/popup_regeneratorRuntime().mark(function _callee5() {
            var _window$userManager2;
            var latestPlayerData;
            return popup_regeneratorRuntime().wrap(function _callee5$(_context5) {
              while (1) switch (_context5.prev = _context5.next) {
                case 0:
                  if (!(typeof ((_window$userManager2 = window.userManager) === null || _window$userManager2 === void 0 ? void 0 : _window$userManager2.loadPlayerData) === 'function' && typeof window.exportPlayerDataCSV === 'function')) {
                    _context5.next = 14;
                    break;
                  }
                  _context5.prev = 1;
                  _context5.next = 4;
                  return window.userManager.loadPlayerData();
                case 4:
                  latestPlayerData = _context5.sent;
                  if (latestPlayerData && Object.keys(latestPlayerData).length > 0) {
                    window.exportPlayerDataCSV(latestPlayerData);
                  } else {
                    console.warn('[Popup] Export button clicked, but no player data to export.');
                    ModalManager.showAlert('No Data', 'There is no player data to export.');
                  }
                  _context5.next = 12;
                  break;
                case 8:
                  _context5.prev = 8;
                  _context5.t0 = _context5["catch"](1);
                  console.error('[Popup] Failed to load player data for export:', _context5.t0);
                  ModalManager.showAlert('Error', 'Failed to load player data for export.');
                case 12:
                  _context5.next = 16;
                  break;
                case 14:
                  console.error('Export function (window.exportPlayerDataCSV) or userManager.loadPlayerData not found.');
                  ModalManager.showAlert('Error', 'Export functionality is currently unavailable.');
                case 16:
                case "end":
                  return _context5.stop();
              }
            }, _callee5, null, [[1, 8]]);
          })));
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
                var _ref7 = popup_asyncToGenerator(/*#__PURE__*/popup_regeneratorRuntime().mark(function _callee6(parsedData) {
                  return popup_regeneratorRuntime().wrap(function _callee6$(_context6) {
                    while (1) switch (_context6.prev = _context6.next) {
                      case 0:
                        _context6.prev = 0;
                        _context6.next = 3;
                        return window.userManager.replaceAllPlayerDataAndSave(parsedData);
                      case 3:
                        // Code that was previously in the inner callback now runs after await
                        importStatusDiv.textContent = 'Player data imported successfully! Reloading list...';
                        if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                          window.userManager.renderKnownPlayers(knownPlayersDiv, ''); // Re-render with empty search
                        } else {
                          console.error("User manager or renderKnownPlayers function not available for callback after clearing data.");
                        }
                        refreshDisplayedSessions(); // Refresh session display as well
                        _context6.next = 14;
                        break;
                      case 8:
                        _context6.prev = 8;
                        _context6.t0 = _context6["catch"](0);
                        console.error('Error processing imported data:', _context6.t0);
                        importStatusDiv.textContent = 'Error saving imported data. Check console.';
                        importStatusDiv.className = 'import-status-message error';
                        importStatusDiv.style.display = 'block';
                      case 14:
                      case "end":
                        return _context6.stop();
                    }
                  }, _callee6, null, [[0, 8]]);
                }));
                return function successCallback(_x3) {
                  return _ref7.apply(this, arguments);
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
                      console.error("User manager or renderKnownPlayers function not available for callback after clearing data.");
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
            var oldLiveGameInfoString = JSON.stringify(window.liveGameInfo);
            window.liveGameInfo = request.payload;
            var newLiveGameInfoString = JSON.stringify(window.liveGameInfo);
            if (newLiveGameInfoString !== oldLiveGameInfoString) {
              console.log('Live game info has changed. Refreshing session display.');
              refreshDisplayedSessions();
            } else {
              console.log('Live game info received, but no change detected. No refresh needed.');
            }
            // sendResponse({status: "Popup processed LIVE_GAME_INFO_UPDATED"}); // Optional: send response if needed
            return true; // Keep channel open for potential async response, good practice
          }
          return false; // For synchronous messages or if not handling this specific message type
        });
      case 63:
      case "end":
        return _context0.stop();
    }
  }, _callee0);
})));

// Helper function to parse JWT
window.parseMyCustomBotcJwt = function (token) {
  if (!token || typeof token !== 'string') {
    return null;
  }
  try {
    var parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    var base64Url = parts[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Pad base64 string if necessary
    switch (base64.length % 4) {
      case 2:
        base64 += '==';
        break;
      case 3:
        base64 += '=';
        break;
    }
    var decodedAtob = atob(base64); // Use atob for base64 decoding
    // Convert binary string to percent-encoded characters
    var jsonPayload = decodeURIComponent(decodedAtob.split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    var parsed = JSON.parse(jsonPayload);
    return parsed; // Ensure it returns the whole parsed object
  } catch (e) {
    console.error("[Popup] Failed to parse JWT. Token:", token, "Error:", e.message);
    return null;
  }
};
/******/ })()
;