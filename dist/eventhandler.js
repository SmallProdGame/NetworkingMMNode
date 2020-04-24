"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventHandler {
    constructor() {
        this.events = [];
        this.on = (type, func) => {
            const event = this.events.find((e) => e.type === type);
            if (event) {
                event.func = func;
            }
            else {
                this.events.push({ type, func });
            }
        };
        this.emit = (type, data) => {
            const ev = this.events.find((e) => e.type === type);
            if (ev) {
                ev.func(data);
            }
        };
        this.clearEvents = () => {
            this.events = [];
        };
    }
}
exports.default = EventHandler;
