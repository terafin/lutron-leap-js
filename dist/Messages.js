"use strict";
/* tslint:disable:max-classes-per-file */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseStatus = exports.Response = exports.ResponseHeader = void 0;
const MessageBodyTypes_1 = require("./MessageBodyTypes");
class ResponseHeader {
    static fromJSON(json) {
        const status = (json === null || json === void 0 ? void 0 : json.StatusCode) === undefined ? undefined : ResponseStatus.fromString(json.StatusCode);
        return Object.assign({}, json, {
            StatusCode: status,
            MessageBodyType: json === null || json === void 0 ? void 0 : json.MessageBodyType,
        });
    }
}
exports.ResponseHeader = ResponseHeader;
class Response {
    constructor() {
        this.Header = new ResponseHeader();
    }
    static fromJSON(json) {
        const header = ResponseHeader.fromJSON(json.Header);
        return Object.assign(new Response(), json, {
            Header: header,
            Body: header.MessageBodyType ? (0, MessageBodyTypes_1.parseBody)(header.MessageBodyType, json.Body) : undefined,
        });
    }
}
exports.Response = Response;
class ResponseStatus {
    constructor(message, code) {
        this.message = message;
        this.code = code;
    }
    static fromString(s) {
        const parts = s.split(' ', 2);
        if (parts.length === 1) {
            return new ResponseStatus(s);
        }
        const code = parseInt(parts[0], 10);
        if (Number.isNaN(code)) {
            return new ResponseStatus(s);
        }
        return new ResponseStatus(parts[1], code);
    }
    isSuccessful() {
        return this.code !== undefined && this.code >= 200 && this.code < 300;
    }
}
exports.ResponseStatus = ResponseStatus;
//# sourceMappingURL=Messages.js.map