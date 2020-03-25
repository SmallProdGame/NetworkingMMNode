"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const randomInt = (low, high) => {
    return Math.floor(Math.random() * (high - low) + low);
};
exports.default = {
    randomInt,
};
