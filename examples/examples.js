"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
/* Copyright 2019 MaulingMonkey

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var mmk;
(function (mmk) {
    var ui;
    (function (ui) {
        var map2d;
        (function (map2d) {
            function evalLazy(lazy) {
                return (typeof lazy === 'function') ? lazy() : lazy;
            }
            function onImgLoaded(img, onload) {
                if (img.complete)
                    onload();
                else
                    img.addEventListener("load", onload);
            }
            var Map = /** @class */ (function () {
                function Map(canvas, config) {
                    var _this = this;
                    this.canvas = canvas;
                    this.config = config;
                    // TODO: Focus/scroll, zoom, ...
                    this.icons = {};
                    this.scrollSpeed = -1;
                    this.focus = { x: 0, y: 0 };
                    this.zoom = 1;
                    this.scrollController = new map2d.internal.MouseScrollController(canvas, function (drag) {
                        _this.focus.x += _this.scrollSpeed / _this.zoom * drag.dx;
                        _this.focus.y += _this.scrollSpeed / _this.zoom * drag.dy;
                        _this.zoom *= Math.pow(2, drag.dzoom);
                    });
                    // XXX: Consider hoisting this into a utility function?
                    if (config.icons) {
                        var _loop_1 = function (key) {
                            var _a = config.icons[key], src = _a.src, size = _a.size;
                            var img;
                            if (typeof src === 'string') {
                                img = document.createElement("img");
                                img.src = src;
                            }
                            else {
                                img = src;
                            }
                            var meta = this_1.icons[key] = { img: img, width: 1, height: 1, snap: !/\.svg/i.test(img.src) };
                            onImgLoaded(img, function () {
                                var complete = img.complete;
                                meta.width = complete ? img.width : 0;
                                meta.height = complete ? img.height : 0;
                                if (size === undefined)
                                    return;
                                var max = Math.max(meta.width, meta.height);
                                if (!max)
                                    return;
                                var scale = size / max;
                                meta.width *= scale;
                                meta.height *= scale;
                                if (meta.snap) {
                                    meta.width = Math.round(meta.width);
                                    meta.height = Math.round(meta.height);
                                }
                            });
                        };
                        var this_1 = this;
                        for (var key in config.icons) {
                            _loop_1(key);
                        }
                    }
                }
                Map.prototype.draw = function () {
                    var e_1, _a;
                    var _b = this, canvas = _b.canvas, config = _b.config;
                    var w = canvas.width = canvas.clientWidth;
                    var h = canvas.height = canvas.clientHeight;
                    var ctx = canvas.getContext("2d");
                    if (!ctx)
                        return;
                    ctx.clearRect(0, 0, w, h);
                    ctx.translate(Math.floor(w / 2) - this.focus.x * this.zoom, Math.floor(h / 2) - this.focus.y * this.zoom); // Make `focus * zoom` the center of the canvas.
                    try {
                        for (var _c = __values(config.layers), _d = _c.next(); !_d.done; _d = _c.next()) {
                            var layer = _d.value;
                            switch (layer.type) {
                                case "circles":
                                    this.drawCircles(ctx, layer);
                                    break;
                                case "paths":
                                    this.drawPaths(ctx, layer);
                                    break;
                                case "velocities":
                                    this.drawVelocities(ctx, layer);
                                    break;
                                case "icons":
                                    this.drawIcons(ctx, layer);
                                    break;
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                };
                Map.prototype.scrollFocusDXY = function (v) {
                    this.focus.x += v.x;
                    this.focus.y += v.y;
                };
                Map.prototype.scrollFocusDXDY = function (dx, dy) {
                    this.focus.x += dx;
                    this.focus.y += dy;
                };
                Map.prototype.drawCircles = function (ctx, layer) {
                    var e_2, _a, e_3, _b, e_4, _c;
                    var lineW = 1;
                    var lineW_2 = lineW / 2;
                    var pi2 = 2 * Math.PI;
                    var zoom = this.zoom;
                    var _d = this.canvas, width = _d.width, height = _d.height;
                    var areaW_2 = Math.ceil(width / zoom / 2);
                    var areaH_2 = Math.ceil(height / zoom / 2);
                    var scaleR = layer.scaleWithZoom !== false ? zoom : 1;
                    var territory = evalLazy(layer.circles).map(function (c) { return (__assign({}, c, { x: c.x * zoom, y: c.y * zoom, r: c.r * scaleR })); }).filter(function (c) {
                        var x = c.x, y = c.y, r = c.r;
                        if (!r)
                            return false;
                        //if (x+r < -areaW_2) return false;
                        //if (x-r > +areaW_2) return false;
                        //if (y+r < -areaH_2) return false;
                        //if (y-r > +areaH_2) return false;
                        return true;
                    });
                    if (layer.fillStyle) {
                        // To get nicely merging circles, we first draw all borders, then draw all fills.
                        // To avoid any unsightly gaps between the borders and the fills, we double draw and use fills for both.
                        if (layer.borderStyle) {
                            ctx.fillStyle = layer.borderStyle;
                            try {
                                for (var territory_1 = __values(territory), territory_1_1 = territory_1.next(); !territory_1_1.done; territory_1_1 = territory_1.next()) {
                                    var t = territory_1_1.value;
                                    ctx.beginPath();
                                    ctx.ellipse(t.x, t.y, t.r + lineW_2, t.r + lineW_2, 0, 0, pi2);
                                    ctx.fill();
                                }
                            }
                            catch (e_2_1) { e_2 = { error: e_2_1 }; }
                            finally {
                                try {
                                    if (territory_1_1 && !territory_1_1.done && (_a = territory_1.return)) _a.call(territory_1);
                                }
                                finally { if (e_2) throw e_2.error; }
                            }
                        }
                        ctx.fillStyle = layer.fillStyle;
                        try {
                            for (var territory_2 = __values(territory), territory_2_1 = territory_2.next(); !territory_2_1.done; territory_2_1 = territory_2.next()) {
                                var t = territory_2_1.value;
                                if (t.r > lineW_2 + 0.1) {
                                    ctx.beginPath();
                                    ctx.ellipse(t.x, t.y, t.r - lineW_2, t.r - lineW_2, 0, 0, pi2);
                                    ctx.fill();
                                }
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (territory_2_1 && !territory_2_1.done && (_b = territory_2.return)) _b.call(territory_2);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                    }
                    else if (layer.borderStyle) {
                        ctx.strokeStyle = layer.borderStyle;
                        ctx.lineWidth = lineW;
                        try {
                            for (var territory_3 = __values(territory), territory_3_1 = territory_3.next(); !territory_3_1.done; territory_3_1 = territory_3.next()) {
                                var t = territory_3_1.value;
                                ctx.beginPath();
                                ctx.ellipse(t.x, t.y, t.r, t.r, 0, 0, pi2);
                                ctx.stroke();
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (territory_3_1 && !territory_3_1.done && (_c = territory_3.return)) _c.call(territory_3);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                    }
                };
                Map.prototype.drawPaths = function (ctx, layer) {
                    var e_5, _a, e_6, _b;
                    var zoom = this.zoom;
                    var paths = evalLazy(layer.paths);
                    ctx.strokeStyle = layer.strokeStyle;
                    ctx.lineWidth = layer.lineWidth || 1;
                    try {
                        for (var paths_1 = __values(paths), paths_1_1 = paths_1.next(); !paths_1_1.done; paths_1_1 = paths_1.next()) {
                            var path = paths_1_1.value;
                            ctx.beginPath();
                            try {
                                for (var path_1 = __values(path), path_1_1 = path_1.next(); !path_1_1.done; path_1_1 = path_1.next()) {
                                    var point = path_1_1.value;
                                    ctx.lineTo(point.x * zoom, point.y * zoom);
                                }
                            }
                            catch (e_6_1) { e_6 = { error: e_6_1 }; }
                            finally {
                                try {
                                    if (path_1_1 && !path_1_1.done && (_b = path_1.return)) _b.call(path_1);
                                }
                                finally { if (e_6) throw e_6.error; }
                            }
                            ctx.stroke();
                        }
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (paths_1_1 && !paths_1_1.done && (_a = paths_1.return)) _a.call(paths_1);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                };
                Map.prototype.drawVelocities = function (ctx, layer) {
                    var e_7, _a;
                    var zoom = this.zoom;
                    var velocities = evalLazy(layer.velocities);
                    var featureSize = layer.featureSize || 4;
                    var intervals = layer.intervals || 5;
                    var intervalScale = layer.intervalScale || 1;
                    ctx.strokeStyle = layer.strokeStyle;
                    ctx.lineWidth = layer.lineWidth || 1;
                    try {
                        for (var velocities_1 = __values(velocities), velocities_1_1 = velocities_1.next(); !velocities_1_1.done; velocities_1_1 = velocities_1.next()) {
                            var vel = velocities_1_1.value;
                            var x = vel.x, y = vel.y, dx = vel.dx, dy = vel.dy;
                            var m = Math.sqrt(dx * dx + dy * dy);
                            if (m < 0.01)
                                continue;
                            var udx = dx / m;
                            var udy = dy / m;
                            var fback = { x: -udx, y: -udy };
                            var fright = { x: -udy, y: +udx };
                            var fleft = { x: +udy, y: -udx };
                            ctx.beginPath();
                            // Draw main velocity vector
                            ctx.moveTo(zoom * (x - dx * intervals * intervalScale), zoom * (y - dy * intervals * intervalScale));
                            ctx.lineTo(zoom * (x + dx * intervals * intervalScale), zoom * (y + dy * intervals * intervalScale));
                            for (var i = -intervals; i <= +intervals; ++i) {
                                var baseX = zoom * (x + i * dx * intervalScale);
                                var baseY = zoom * (y + i * dy * intervalScale);
                                if (i === +intervals) {
                                    // Arrowhead
                                    ctx.moveTo(baseX + featureSize * (fleft.x + fback.x), baseY + featureSize * (fleft.y + fback.y));
                                    ctx.lineTo(baseX, baseY);
                                    ctx.lineTo(baseX + featureSize * (fright.x + fback.x), baseY + featureSize * (fright.y + fback.y));
                                }
                                else if (i === 0) {
                                    // Draw nothing, icon will go here
                                }
                                else {
                                    // Tickmark
                                    ctx.moveTo(baseX + featureSize * fleft.x, baseY + featureSize * fleft.y);
                                    ctx.lineTo(baseX + featureSize * fright.x, baseY + featureSize * fright.y);
                                }
                            }
                            ctx.stroke();
                        }
                    }
                    catch (e_7_1) { e_7 = { error: e_7_1 }; }
                    finally {
                        try {
                            if (velocities_1_1 && !velocities_1_1.done && (_a = velocities_1.return)) _a.call(velocities_1);
                        }
                        finally { if (e_7) throw e_7.error; }
                    }
                };
                Map.prototype.drawIcons = function (ctx, layer) {
                    var e_8, _a;
                    var zoom = this.zoom;
                    var icons = evalLazy(layer.icons);
                    try {
                        for (var icons_1 = __values(icons), icons_1_1 = icons_1.next(); !icons_1_1.done; icons_1_1 = icons_1.next()) {
                            var poi = icons_1_1.value;
                            var _b = this.icons[poi.icon], img = _b.img, width = _b.width, height = _b.height, snap = _b.snap;
                            if (!img)
                                continue;
                            if (!img.complete)
                                continue;
                            var x = poi.x * zoom - width / 2;
                            var y = poi.y * zoom - height / 2;
                            if (snap) {
                                x = Math.round(x);
                                y = Math.round(y);
                            }
                            //if (x > this.canvas.width) continue;
                            //if (y > this.canvas.height) continue;
                            //if (x + width  < 0) continue;
                            //if (y + height < 0) continue;
                            ctx.drawImage(img, x, y, width, height);
                        }
                    }
                    catch (e_8_1) { e_8 = { error: e_8_1 }; }
                    finally {
                        try {
                            if (icons_1_1 && !icons_1_1.done && (_a = icons_1.return)) _a.call(icons_1);
                        }
                        finally { if (e_8) throw e_8.error; }
                    }
                };
                return Map;
            }());
            map2d.Map = Map;
        })(map2d = ui.map2d || (ui.map2d = {}));
    })(ui = mmk.ui || (mmk.ui = {}));
})(mmk || (mmk = {}));
/* Copyright 2019 MaulingMonkey

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var mmk;
(function (mmk) {
    var ui;
    (function (ui) {
        var map2d;
        (function (map2d) {
            var internal;
            (function (internal) {
                var LMB = 0;
                var MMB = 1; // Yes, MMB comes before RMB for `ev.button` (not for `ev.buttons` though!)
                var RMB = 2;
                var scrollThreshold = 10;
                var MouseScrollController = /** @class */ (function () {
                    function MouseScrollController(target, moveCallback) {
                        var _this = this;
                        this.scrolled = 0;
                        this.buttons = 0;
                        this.prevX = 0;
                        this.prevY = 0;
                        this.legalMasks = [
                            (1 << LMB),
                            (1 << MMB),
                            (1 << LMB) | (1 << RMB),
                        ];
                        target.addEventListener("mousedown", function (ev) {
                            if (_this.buttons === 0)
                                _this.scrolled = 0;
                            var wasAlreadyDragging = _this.legalMasks.indexOf(_this.buttons) !== -1;
                            _this.buttons |= (1 << ev.button);
                            var isDragging = _this.legalMasks.indexOf(_this.buttons) !== -1;
                            if (!wasAlreadyDragging && isDragging) {
                                ev.preventDefault();
                                _this.prevX = ev.x;
                                _this.prevY = ev.y;
                            }
                            _this.traceEv(ev);
                        });
                        target.addEventListener("wheel", function (ev) {
                            ev.preventDefault();
                            moveCallback({ dx: 0, dy: 0, dzoom: Math.sign(ev.deltaY) });
                            _this.traceEv(ev);
                        });
                        target.addEventListener("contextmenu", function (ev) {
                            if (_this.scrolled > scrollThreshold)
                                ev.preventDefault();
                            else
                                _this.buttons = 0; // EDGE CASE: Might've missed mouseup, don't get stuck in scroll mode.
                            _this.traceEv(ev);
                        });
                        target.addEventListener("blur", function (ev) {
                            _this.buttons = 0; // EDGE CASE: Might've missed mouseup, don't get stuck in scroll mode.
                            _this.traceEv(ev);
                        });
                        // EDGE CASE:  Don't constrain to `target.`, user may have scrolled outside of the element or window.
                        addEventListener("mouseup", function (ev) {
                            _this.buttons &= ~(1 << ev.button);
                            if (_this.scrolled > scrollThreshold)
                                ev.preventDefault();
                            _this.traceEv(ev);
                        }, true);
                        // EDGE CASE:  Don't constrain to `target.`, user may have scrolled outside of the element or window.
                        addEventListener("mousemove", function (ev) {
                            if (ev.buttons === 0)
                                _this.buttons = 0; // Don't get stuck in scroll mode if we missed an edge case
                            // Note that `ev.buttons` might not be available on e.g. OS X/Safari
                            if (_this.legalMasks.indexOf(_this.buttons) !== -1) {
                                var x = ev.x, y = ev.y;
                                var _a = _this, prevX = _a.prevX, prevY = _a.prevY;
                                var dx = x - prevX;
                                var dy = y - prevY;
                                _this.prevX = x;
                                _this.prevY = y;
                                _this.scrolled += Math.abs(dx);
                                _this.scrolled += Math.abs(dy);
                                ev.preventDefault();
                                moveCallback({ dx: dx, dy: dy, dzoom: 0 });
                            }
                            _this.traceEv(ev);
                        }, true);
                    }
                    MouseScrollController.prototype.traceEv = function (ev) {
                        //console.log(ev.type, ev.defaultPrevented, this.buttons.toString(2), ev);
                    };
                    return MouseScrollController;
                }());
                internal.MouseScrollController = MouseScrollController;
            })(internal = map2d.internal || (map2d.internal = {}));
        })(map2d = ui.map2d || (ui.map2d = {}));
    })(ui = mmk.ui || (mmk.ui = {}));
})(mmk || (mmk = {}));
//# sourceMappingURL=global.js.map
/* Copyright 2019 MaulingMonkey

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var examples;
(function (examples) {
    var e_1, _a;
    var starRadius = 2.5;
    var stars = 1000;
    var fleets = 100;
    var wormholePairs = 10;
    var universe = {
        left: -1000, top: -1000,
        width: 2000, height: 2000,
        stars: [],
        fleets: [],
        wormholePairs: [],
    };
    function randomPoiXY(params) {
        return __assign({}, params, { x: Math.random() * universe.width + universe.left, y: Math.random() * universe.height + universe.top });
    }
    for (var i = 0; i < stars; ++i)
        universe.stars.push(randomPoiXY({ type: "star", sensorRange: Math.random() < 0.1 ? 100 : 0, hasOrbiters: Math.random() < 0.1 }));
    for (var i = 0; i < fleets; ++i)
        universe.fleets.push(randomPoiXY({ type: "fleet", team: Math.floor(Math.random() * 2), queuedWaypoints: [] }));
    for (var i = 0; i < wormholePairs; ++i)
        universe.wormholePairs.push({ type: "wormhole-pair", a: randomPoiXY({ type: "wormhole" }), b: randomPoiXY({ type: "wormhole" }) });
    try {
        for (var _b = __values(universe.fleets), _c = _b.next(); !_c.done; _c = _b.next()) {
            var fleet = _c.value;
            var type = "waypoint";
            var x = fleet.x, y = fleet.y;
            var wps = fleet.queuedWaypoints = fleet.queuedWaypoints || [];
            var nwps = 5 + Math.random() * 5;
            for (var wp = 0; wp < nwps; ++wp) {
                x += Math.random() * 100 - 50;
                y += Math.random() * 100 - 50;
                wps.push({ type: type, x: x, y: y });
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    function fleetPosVel(fleet) {
        var x = fleet.x, y = fleet.y, queuedWaypoints = fleet.queuedWaypoints;
        var dx = 0;
        var dy = 0;
        if (queuedWaypoints) {
            var i = 0;
            while (dx === 0 && dy === 0 && i < queuedWaypoints.length) {
                dx = queuedWaypoints[i].x - x;
                dy = queuedWaypoints[i].y - y;
                i += 1;
            }
            var m = Math.sqrt(dx * dx + dy * dy);
            if (m) {
                var v = 20;
                var scale = v / m;
                dx *= scale;
                dy *= scale;
            }
        }
        return { x: x, y: y, dx: dx, dy: dy };
    }
    addEventListener("load", function () {
        var e = document.getElementById("starmap");
        if (!e)
            return;
        var map = new mmk.ui.map2d.Map(e, {
            icons: {
                "friendly-fleet": { size: 12, src: "icons/friendly-fleet.svg" },
                "enemy-fleet": { size: 12, src: "icons/enemy-fleet.svg" },
            },
            layers: [
                // Territory
                { type: "circles", borderStyle: "#F00", fillStyle: "#400", circles: function () { return universe.stars.map(function (s) { return (__assign({}, s, { r: s.sensorRange })); }); } },
                // Paths
                { type: "paths", strokeStyle: "#A0A", paths: function () { return universe.wormholePairs.map(function (wp) { return [wp.a, wp.b]; }); } },
                { type: "paths", strokeStyle: "#48F", paths: function () { return universe.fleets.filter(function (f) { return f.team === 0; }).map(function (f) { return __spread([f], f.queuedWaypoints || []); }); } },
                { type: "velocities", strokeStyle: "#F00", velocities: function () { return universe.fleets.filter(function (f) { return f.team !== 0; }).map(function (f) { return fleetPosVel(f); }); } },
                // POIs
                { type: "circles", fillStyle: "#FFF", scaleWithZoom: false, circles: function () { return universe.stars.map(function (s) { return (__assign({}, s, { r: starRadius })); }); } },
                { type: "circles", borderStyle: "#FFF", scaleWithZoom: false, circles: function () { return universe.stars.map(function (s) { return (__assign({}, s, { r: s.hasOrbiters ? (starRadius + 2) : 0 })); }); } },
                { type: "circles", borderStyle: "#F0F", fillStyle: "#202", circles: function () { return universe.wormholePairs.map(function (wp) { return (__assign({}, wp.a, { r: 4 })); }); } },
                { type: "circles", borderStyle: "#F0F", fillStyle: "#202", circles: function () { return universe.wormholePairs.map(function (wp) { return (__assign({}, wp.b, { r: 4 })); }); } },
                { type: "icons", icons: function () { return universe.fleets.map(function (f) { return (__assign({}, f, { icon: ["friendly-fleet", "enemy-fleet"][f.team] })); }); } },
            ],
        });
        map.draw();
        setInterval(function () { return map.draw(); }, 10);
    });
})(examples || (examples = {}));
//# sourceMappingURL=examples.js.map