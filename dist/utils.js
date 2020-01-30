"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomInt = (low, high) => {
    return Math.floor(Math.random() * (high - low) + low);
};
