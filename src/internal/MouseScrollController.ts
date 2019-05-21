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

namespace mmk.ui.map2d.internal {
    const LMB = 0;
    const MMB = 1; // Yes, MMB comes before RMB for `ev.button` (not for `ev.buttons` though!)
    const RMB = 2;
    const scrollThreshold = 10;

    export class MouseScrollController {
        private scrolled : number = 0;
        private buttons : number = 0;
        private prevX : number = 0;
        private prevY : number = 0;
        private legalMasks : number[] = [
            (1 << LMB),
            (1 << MMB), // MMB only
            (1 << LMB) | (1 << RMB), // LMB & RMB
        ];

        public constructor (target: HTMLElement, moveCallback : (delta: {dx: number; dy: number; dzoom: number; }) => void) {
            target.addEventListener("mousedown", ev=>{
                if (this.buttons === 0) this.scrolled = 0;
                const wasAlreadyDragging = this.legalMasks.indexOf(this.buttons) !== -1;
                this.buttons |= (1 << ev.button);
                const isDragging = this.legalMasks.indexOf(this.buttons) !== -1;
                if (!wasAlreadyDragging && isDragging) {
                    ev.preventDefault();
                    this.prevX = ev.x;
                    this.prevY = ev.y;
                }
                this.traceEv(ev);
            });

            target.addEventListener("wheel", ev=>{
                ev.preventDefault();
                moveCallback({dx: 0, dy: 0, dzoom: Math.sign(ev.deltaY)});
                this.traceEv(ev);
            });

            target.addEventListener("contextmenu", ev=>{
                if (this.scrolled > scrollThreshold) ev.preventDefault();
                else this.buttons = 0; // EDGE CASE: Might've missed mouseup, don't get stuck in scroll mode.
                this.traceEv(ev);
            });

            target.addEventListener("blur", ev=>{
                this.buttons = 0; // EDGE CASE: Might've missed mouseup, don't get stuck in scroll mode.
                this.traceEv(ev);
            });

            // EDGE CASE:  Don't constrain to `target.`, user may have scrolled outside of the element or window.
            addEventListener("mouseup", ev=>{
                this.buttons &= ~(1 << ev.button);
                if (this.scrolled > scrollThreshold) ev.preventDefault();
                this.traceEv(ev);
            }, true);

            // EDGE CASE:  Don't constrain to `target.`, user may have scrolled outside of the element or window.
            addEventListener("mousemove", ev=>{
                if (ev.buttons === 0) this.buttons = 0; // Don't get stuck in scroll mode if we missed an edge case
                // Note that `ev.buttons` might not be available on e.g. OS X/Safari
                if (this.legalMasks.indexOf(this.buttons) !== -1) {
                    const {x,y} = ev;
                    const {prevX, prevY} = this;
                    const dx = x - prevX;
                    const dy = y - prevY;
                    this.prevX = x;
                    this.prevY = y;
                    this.scrolled += Math.abs(dx);
                    this.scrolled += Math.abs(dy);
                    ev.preventDefault();
                    moveCallback({dx, dy, dzoom: 0});
                }
                this.traceEv(ev);
            }, true);
        }

        private traceEv (ev: Event) {
            //console.log(ev.type, ev.defaultPrevented, this.buttons.toString(2), ev);
        }
    }
}
