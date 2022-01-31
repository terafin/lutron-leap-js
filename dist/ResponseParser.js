"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseParser = void 0;
const debug_1 = require("debug");
const Messages_1 = require("./Messages");
const events_1 = require("events");
const logDebug = (0, debug_1.default)('leap:responseparser');
class ResponseParser extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.buffer = '';
    }
    handleData(data) {
        logDebug('handling data', data);
        logDebug('buffer is', this.buffer);
        data = this.buffer + data;
        const lines = data.split(/\r?\n/);
        const len = lines.length - 1;
        if (!len) {
            // didn't get a full line.
            logDebug("buffer doesn't contain a full line");
            this.buffer = data;
            return;
        }
        this.buffer = lines[len] || '';
        for (const line of lines.slice(0, len)) {
            try {
                logDebug('parsing line', line);
                const response = Messages_1.Response.fromJSON(JSON.parse(line));
                this.emit('response', response);
            }
            catch (e) {
                logDebug('malformed response:', e, ' caused by', line);
            }
        }
    }
}
exports.ResponseParser = ResponseParser;
//# sourceMappingURL=ResponseParser.js.map