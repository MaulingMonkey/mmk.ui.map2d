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

namespace mmk.ui.map2d {
    export interface XY { x: number; y: number; }
    type LazyArray<T> = T[] | (() => T[]);
    function evalLazy<T> (lazy: LazyArray<T>): T[] {
        return (typeof lazy === 'function') ? lazy() : lazy;
    }

    export interface CirclesLayer {
        type: "circles";
        borderStyle?: string;
        fillStyle?: string;
        circles: LazyArray<{ x: number; y: number; r: number; }>;
    }
    export interface PathsLayer {
        type: "paths";
        strokeStyle: string;
        lineWidth?: number; // Default: 1
        paths: LazyArray<XY[]>;
    }
    export interface VelocitiesLayer {
        type: "velocities";
        strokeStyle: string;
        lineWidth?: number; // Default: 1
        featureSize?: number; // Default: 4
        intervals?: number; // Default: 5
        intervalScale?: number; // Default: 1
        velocities: LazyArray<{ x: number; y: number; dx: number; dy: number; }>;
    }
    export interface IconsLayer {
        type: "icons";
        icons: LazyArray<{ x: number; y: number; icon: string; }>;
    }
    export type Layer = CirclesLayer | PathsLayer | VelocitiesLayer | IconsLayer;

    export interface MapIconConfig {
        src: string | HTMLImageElement;
        size?: number;
    }

    interface MapIconRuntime {
        img: HTMLImageElement;
        width: number;
        height: number;
        snap: boolean;
    }

    export interface MapConfig {
        icons?: {[id: string]: MapIconConfig};
        layers: Layer[];
    }

    function onImgLoaded (img: HTMLImageElement, onload: () => void) {
        if (img.complete) onload();
        else img.addEventListener("load", onload);
    }

    export class Map {
        // TODO: Focus/scroll, zoom, ...
        private icons : {[id: string]: MapIconRuntime} = {};
        private scrollController : internal.MouseScrollController;
        private scrollSpeed : number = -1;
        private focus : XY = { x: 0, y: 0 };

        public constructor (private canvas: HTMLCanvasElement, private config: MapConfig) {
            this.scrollController = new internal.MouseScrollController(canvas, drag => {
                this.focus.x += this.scrollSpeed * drag.dx;
                this.focus.y += this.scrollSpeed * drag.dy;
            });

            // XXX: Consider hoisting this into a utility function?
            if (config.icons) {
                for (const key in config.icons) {
                    const {src, size} = config.icons[key];
                    let img : HTMLImageElement;
                    if (typeof src === 'string') {
                        img = document.createElement("img");
                        img.src = src;
                    }
                    else {
                        img = src;
                    }
                    const meta = this.icons[key] = {img, width: 1, height: 1, snap: !/\.svg/i.test(img.src)};
                    onImgLoaded(img, function(){
                        const {complete} = img;
                        meta.width  = complete ? img.width : 0;
                        meta.height = complete ? img.height : 0;
                        if (size === undefined) return;

                        const max = Math.max(meta.width, meta.height);
                        if (!max) return;
                        const scale = size/max;
                        meta.width  *= scale;
                        meta.height *= scale;
                        if (meta.snap) {
                            meta.width  = Math.round(meta.width);
                            meta.height = Math.round(meta.height);
                        }
                    });
                }
            }
        }

        public draw () {
            const {canvas, config} = this;
            const w = canvas.width = canvas.clientWidth;
            const h = canvas.height = canvas.clientHeight;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.clearRect(0, 0, w, h);

            for (const layer of config.layers) {
                switch (layer.type) {
                case "circles":     this.drawCircles(ctx, layer); break;
                case "paths":       this.drawPaths(ctx, layer); break;
                case "velocities":  this.drawVelocities(ctx, layer); break;
                case "icons":       this.drawIcons(ctx, layer); break;
                }
            }
        }

        public scrollFocusDXY (v: XY) {
            this.focus.x += v.x;
            this.focus.y += v.y;
        }

        public scrollFocusDXDY (dx: number, dy: number) {
            this.focus.x += dx;
            this.focus.y += dy;
        }

        private getFocusDXDY (): { dx: number; dy: number; } {
            const dx = this.canvas.width /2 - this.focus.x;
            const dy = this.canvas.height/2 - this.focus.y;
            return {dx, dy};
        }

        private drawCircles (ctx: CanvasRenderingContext2D, layer: CirclesLayer) {
            const lineW = 1;
            const lineW_2 = lineW/2;
            const pi2 = 2*Math.PI;

            const w = this.canvas.width;
            const h = this.canvas.height;
            const {dx, dy} = this.getFocusDXDY();
            const territory = evalLazy(layer.circles).map(c => ({...c, x: c.x + dx, y: c.y + dy})).filter(c => {
                const {x,y,r} = c;
                if (!r) return false;
                if (x+r < 0) return false;
                if (x-r > w) return false;
                if (y+r < 0) return false;
                if (y-r > h) return false;
                return true;
            });
            if (layer.fillStyle) {
                // To get nicely merging circles, we first draw all borders, then draw all fills.
                // To avoid any unsightly gaps between the borders and the fills, we double draw and use fills for both.
                if (layer.borderStyle) {
                    ctx.fillStyle = layer.borderStyle;
                    for (const t of territory) {
                        ctx.beginPath();
                        ctx.ellipse(t.x, t.y, t.r+lineW_2, t.r+lineW_2, 0, 0, pi2);
                        ctx.fill();
                    }
                }
                ctx.fillStyle = layer.fillStyle;
                for (const t of territory) {
                    ctx.beginPath();
                    ctx.ellipse(t.x, t.y, t.r-lineW_2, t.r-lineW_2, 0, 0, pi2);
                    ctx.fill();
                }
            }
            else if (layer.borderStyle) {
                ctx.strokeStyle = layer.borderStyle;
                ctx.lineWidth = lineW;
                for (const t of territory) {
                    ctx.beginPath();
                    ctx.ellipse(t.x, t.y, t.r, t.r, 0, 0, pi2);
                    ctx.stroke();
                }
            }
        }

        private drawPaths (ctx: CanvasRenderingContext2D, layer: PathsLayer) {
            const {dx, dy} = this.getFocusDXDY();
            const paths = evalLazy(layer.paths);
            ctx.strokeStyle = layer.strokeStyle;
            ctx.lineWidth = layer.lineWidth || 1;
            for (const path of paths) {
                ctx.beginPath();
                for (const point of path) {
                    ctx.lineTo(point.x + dx, point.y + dy);
                }
                ctx.stroke();
            }
        }

        private drawVelocities (ctx: CanvasRenderingContext2D, layer: VelocitiesLayer) {
            const focus = this.getFocusDXDY();
            const velocities = evalLazy(layer.velocities);
            const featureSize   = layer.featureSize || 4;
            const intervals     = layer.intervals || 5;
            const intervalScale = layer.intervalScale || 1;
            ctx.strokeStyle = layer.strokeStyle;
            ctx.lineWidth = layer.lineWidth || 1;
            for (const vel of velocities) {
                const {x, y, dx, dy} = vel;
                if (dx === 0 && dy === 0) continue;
                const m = Math.sqrt(dx*dx + dy*dy);
                const udx = dx/m;
                const udy = dy/m;
                const fback  = { x: -udx, y: -udy };
                const fright = { x: -udy, y: +udx };
                const fleft  = { x: +udy, y: -udx };

                ctx.beginPath();
                // Draw main velocity vector
                ctx.moveTo(focus.dx + x - dx*intervals*intervalScale, focus.dy + y - dy*intervals*intervalScale);
                ctx.lineTo(focus.dx + x + dx*intervals*intervalScale, focus.dy + y + dy*intervals*intervalScale);

                for (let i = -intervals; i <= +intervals; ++i) {
                    const baseX = focus.dx + x + i*dx*intervalScale;
                    const baseY = focus.dy + y + i*dy*intervalScale;

                    if (i === +intervals) {
                        // Arrowhead
                        ctx.moveTo(baseX + featureSize * (fleft.x + fback.x),  baseY + featureSize * (fleft.y + fback.y));
                        ctx.lineTo(baseX, baseY);
                        ctx.lineTo(baseX + featureSize * (fright.x + fback.x), baseY + featureSize * (fright.y + fback.y));
                    }
                    else if (i === 0) {
                        // Draw nothing, icon will go here
                    }
                    else {
                        // Tickmark
                        ctx.moveTo(baseX + featureSize * fleft.x,  baseY + featureSize * fleft.y);
                        ctx.lineTo(baseX + featureSize * fright.x, baseY + featureSize * fright.y);
                    }
                }

                ctx.stroke();
            }
        }

        private drawIcons (ctx: CanvasRenderingContext2D, layer: IconsLayer) {
            const {dx, dy} = this.getFocusDXDY();
            const icons = evalLazy(layer.icons);
            for (const poi of icons) {
                const {img, width, height, snap} = this.icons[poi.icon];
                if (!img) continue;
                if (!img.complete) continue;
                let x = poi.x - width/2 + dx;
                let y = poi.y - height/2 + dy;
                if (snap) {
                    x = Math.round(x);
                    y = Math.round(y);
                }
                if (x > this.canvas.width) continue;
                if (y > this.canvas.height) continue;
                if (x + width  < 0) continue;
                if (y + height < 0) continue;
                ctx.drawImage(img, x, y, width, height);
            }
        }
    }
}
