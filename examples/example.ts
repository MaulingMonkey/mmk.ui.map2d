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

namespace examples {
    const starRadius = 2.5;

    const stars   = 1000;
    const fleets   = 100;
    const wormholePairs = 10;

    // "Point of Interest"
    interface Poi { type: string; x: number; y: number; }
    interface Star     extends Poi { type: "star"; sensorRange: number; hasOrbiters: boolean; }
    interface Fleet    extends Poi { type: "fleet"; team: number; queuedWaypoints?: Poi[]; }
    interface Wormhole extends Poi { type: "wormhole"; }
    interface Waypoint extends Poi { type: "waypoint"; }

    interface WormholePair {
        type: "wormhole-pair";
        a: Wormhole;
        b: Wormhole;
    }

    interface Universe {
        left: number;
        top: number;
        width: number;
        height: number;

        stars: Star[];
        fleets: Fleet[];
        wormholePairs: WormholePair[];
    }

    const universe : Universe = {
        left: -1000, top:   -1000,
        width: 2000, height: 2000,

        stars: [],
        fleets: [],
        wormholePairs: [],
    };

    function randomPoiXY<T extends Poi> (params: {[K in "type" | Exclude<keyof T, keyof Poi>]: T[K]}): T {
        return {
            ...params,
            x: Math.random() * universe.width + universe.left,
            y: Math.random() * universe.height + universe.top,
        } as T;
    }
    for (let i=0; i<stars;         ++i) universe.stars        .push(randomPoiXY<Star >({ type: "star", sensorRange: Math.random() < 0.1 ? 100 : 0, hasOrbiters: Math.random() < 0.1 }));
    for (let i=0; i<fleets;        ++i) universe.fleets       .push(randomPoiXY<Fleet>({ type: "fleet", team: Math.floor(Math.random() * 2), queuedWaypoints: [] }));
    for (let i=0; i<wormholePairs; ++i) universe.wormholePairs.push({type: "wormhole-pair", a: randomPoiXY<Wormhole>({ type: "wormhole" }), b: randomPoiXY<Wormhole>({ type: "wormhole" })});
    for (const fleet of universe.fleets) {
        const type = "waypoint";
        let {x,y} = fleet;
        const wps = fleet.queuedWaypoints = fleet.queuedWaypoints || [];
        const nwps = 5 + Math.random() * 5;
        for (let wp=0; wp<nwps; ++wp) {
            x += Math.random() * 100 - 50;
            y += Math.random() * 100 - 50;
            wps.push({type,x,y});
        }
    }

    function fleetPosVel (fleet: Fleet): { x: number; y: number; dx: number; dy: number; } {
        const {x,y,queuedWaypoints} = fleet;
        let dx = 0;
        let dy = 0;
        if (queuedWaypoints) {
            let i = 0;
            while (dx === 0 && dy === 0 && i < queuedWaypoints.length) {
                dx = queuedWaypoints[i].x - x;
                dy = queuedWaypoints[i].y - y;
                i += 1;
            }
            const m = Math.sqrt(dx*dx + dy*dy);
            if (m) {
                const v = 20;
                const scale = v/m;
                dx *= scale;
                dy *= scale;
            }
        }
        return {x, y, dx, dy};
    }

    addEventListener("load", function() {
        const e = document.getElementById("starmap") as HTMLCanvasElement | undefined;
        if (!e) return;
        const map = new mmk.ui.map2d.Map(e, {
            icons : {
                "friendly-fleet": { size: 12, src: "icons/friendly-fleet.svg" },
                "enemy-fleet":    { size: 12, src: "icons/enemy-fleet.svg" },
            },
            layers: [
                // Territory
                { type: "circles", borderStyle: "#F00", fillStyle: "#400", circles: () => universe.stars.map(s => ({ ...s, r: s.sensorRange })) },
                // Paths
                { type: "paths", strokeStyle: "#A0A", paths: () => universe.wormholePairs.map(wp => [wp.a, wp.b]) },
                { type: "paths", strokeStyle: "#48F", paths: () => universe.fleets.filter(f => f.team === 0).map(f => [f, ...f.queuedWaypoints || []]) },
                { type: "velocities", strokeStyle: "#F00", velocities: () => universe.fleets.filter(f => f.team !== 0).map(f => fleetPosVel(f)) },
                // POIs
                { type: "circles",                      fillStyle: "#FFF", circles: () => universe.stars.map(s => ({ ...s, r: starRadius })) },
                { type: "circles", borderStyle: "#FFF",                    circles: () => universe.stars.map(s => ({ ...s, r: s.hasOrbiters ? (starRadius + 2) : 0 })) },
                { type: "circles", borderStyle: "#F0F", fillStyle: "#202", circles: () => universe.wormholePairs.map(wp => ({ ...wp.a, r: 4 })) },
                { type: "circles", borderStyle: "#F0F", fillStyle: "#202", circles: () => universe.wormholePairs.map(wp => ({ ...wp.b, r: 4 })) },
                { type: "icons", icons: () => universe.fleets.map(f => ({ ...f, icon: ["friendly-fleet", "enemy-fleet"][f.team] }))},
            ],
        });
        map.draw();
        setInterval(() => map.draw(), 10);
    });
}
