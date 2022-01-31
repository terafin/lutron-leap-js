"use strict";
/* tslint:disable:max-classes-per-file */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBody = exports.ExceptionDetail = exports.OneButtonStatusEvent = exports.OneButtonDefinition = exports.OneButtonGroupDefinition = exports.OnePingResponse = exports.MultipleZoneStatus = exports.OneZoneStatus = exports.OneControlStationDefinition = exports.OneAreaDefinition = exports.MultipleAreaStatus = exports.OneAreaStatus = exports.OneProjectDefinition = exports.OneZoneDefinition = exports.MultipleAreaDefinition = exports.MultipleDeviceDefinition = exports.OneDeviceDefinition = exports.MultipleLinkDefinition = exports.MultipleLinkNodeDefinition = exports.OneLinkNodeDefinition = exports.OneLinkDefinition = exports.OnePresetDefinition = exports.OneAreaSceneDefinition = exports.OneDeviceStatus = exports.UnimplementedMessageBodyType = void 0;
const debug = require("debug");
const util = require("util");
const logDebug = debug('leap:message:bodytype');
class UnimplementedMessageBodyType {
    constructor(type) {
        this.type = type;
    }
}
exports.UnimplementedMessageBodyType = UnimplementedMessageBodyType;
class OneDeviceStatus {
}
exports.OneDeviceStatus = OneDeviceStatus;
class OneAreaSceneDefinition {
}
exports.OneAreaSceneDefinition = OneAreaSceneDefinition;
class OnePresetDefinition {
}
exports.OnePresetDefinition = OnePresetDefinition;
class OneLinkDefinition {
}
exports.OneLinkDefinition = OneLinkDefinition;
class OneLinkNodeDefinition {
}
exports.OneLinkNodeDefinition = OneLinkNodeDefinition;
class MultipleLinkNodeDefinition {
}
exports.MultipleLinkNodeDefinition = MultipleLinkNodeDefinition;
class MultipleLinkDefinition {
}
exports.MultipleLinkDefinition = MultipleLinkDefinition;
class OneDeviceDefinition {
}
exports.OneDeviceDefinition = OneDeviceDefinition;
class MultipleDeviceDefinition {
    constructor() {
        this.Devices = [];
    }
}
exports.MultipleDeviceDefinition = MultipleDeviceDefinition;
class MultipleAreaDefinition {
    constructor() {
        this.Areas = [];
    }
}
exports.MultipleAreaDefinition = MultipleAreaDefinition;
class OneZoneDefinition {
}
exports.OneZoneDefinition = OneZoneDefinition;
class OneProjectDefinition {
}
exports.OneProjectDefinition = OneProjectDefinition;
class OneAreaStatus {
}
exports.OneAreaStatus = OneAreaStatus;
class MultipleAreaStatus {
}
exports.MultipleAreaStatus = MultipleAreaStatus;
class OneAreaDefinition {
}
exports.OneAreaDefinition = OneAreaDefinition;
class OneControlStationDefinition {
}
exports.OneControlStationDefinition = OneControlStationDefinition;
class OneZoneStatus {
}
exports.OneZoneStatus = OneZoneStatus;
class MultipleZoneStatus {
}
exports.MultipleZoneStatus = MultipleZoneStatus;
class OnePingResponse {
}
exports.OnePingResponse = OnePingResponse;
class OneButtonGroupDefinition {
}
exports.OneButtonGroupDefinition = OneButtonGroupDefinition;
class OneButtonDefinition {
}
exports.OneButtonDefinition = OneButtonDefinition;
class OneButtonStatusEvent {
}
exports.OneButtonStatusEvent = OneButtonStatusEvent;
class ExceptionDetail {
    constructor() {
        this.Message = '';
    }
}
exports.ExceptionDetail = ExceptionDetail;
function parseBody(type, data) {
    logDebug('parsing body type', type, 'with data:', util.inspect(data, { depth: null }));
    let theType;
    switch (type) {
        case 'OneDeviceDefinition':
            theType = OneDeviceDefinition;
            break;
        case 'OnePresetDefinition':
            theType = OnePresetDefinition;
            break;
        case 'OneAreaSceneDefinition':
            theType = OneAreaSceneDefinition;
            break;
        case 'MultipleAreaDefinition':
            theType = MultipleAreaDefinition;
            break;
        case 'MultipleDeviceDefinition':
            theType = MultipleDeviceDefinition;
            break;
        case 'ExceptionDetail':
            theType = ExceptionDetail;
            break;
        case 'OneZoneStatus':
            theType = OneZoneStatus;
            break;
        case 'MultipleZoneStatus':
            theType = MultipleZoneStatus;
            break;
        case 'OnePingResponse':
            theType = OnePingResponse;
            break;
        case 'OneButtonGroupDefinition':
            theType = OneButtonGroupDefinition;
            break;
        case 'OneButtonDefinition':
            theType = OneButtonDefinition;
            break;
        case 'OneButtonStatusEvent':
            theType = OneButtonStatusEvent;
            break;
        case 'OneDeviceStatus':
            theType = OneDeviceStatus;
            break;
        case 'OneZoneDefinition':
            theType = OneZoneDefinition;
            break;
        case 'OneAreaDefinition':
            theType = OneAreaDefinition;
            break;
        case 'OneAreaStatus':
            theType = OneAreaStatus;
            break;
        case 'MultipleAreaStatus':
            theType = MultipleAreaStatus;
            break;
        case 'OneControlStationDefinition':
            theType = OneControlStationDefinition;
            break;
        case 'OneProjectDefinition':
            theType = OneProjectDefinition;
            break;
        case 'OneLinkDefinition':
            theType = OneLinkDefinition;
            break;
        case 'OneLinkNodeDefinition':
            theType = OneLinkNodeDefinition;
            break;
        case 'MultipleLinkNodeDefinition':
            theType = MultipleLinkNodeDefinition;
            break;
        case 'MultipleLinkDefinition':
            theType = MultipleLinkDefinition;
            break;
        default:
            throw new UnimplementedMessageBodyType(type);
    }
    return Object.assign(new theType(), data);
}
exports.parseBody = parseBody;
//# sourceMappingURL=MessageBodyTypes.js.map