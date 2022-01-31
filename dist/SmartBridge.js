"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartBridge = exports.LEAP_PORT = void 0;
const debug_1 = require("debug");
const events_1 = require("events");
const logDebug = (0, debug_1.default)('leap:bridge');
exports.LEAP_PORT = 8081;
const PING_INTERVAL_MS = 60000;
const PING_TIMEOUT_MS = 1000;
class SmartBridge extends events_1.EventEmitter {
    constructor(bridgeID, client) {
        super();
        this.bridgeID = bridgeID;
        this.client = client;
        logDebug('new bridge', bridgeID, 'being constructed');
        client.on('unsolicited', this._handleUnsolicited.bind(this));
        client.on('disconnected', this._handleDisconnect.bind(this));
        this._setPingTimeout();
    }
    _setPingTimeout() {
        this.pingLooper = setTimeout(() => {
            clearTimeout(this.pingLooper);
            this.pingLoop();
        }, PING_INTERVAL_MS);
    }
    pingLoop() {
        const timeout = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject('Ping timeout');
            }, PING_TIMEOUT_MS);
        });
        Promise.race([this.ping(), timeout])
            .then(() => {
            clearTimeout(this.pingLooper);
            this._setPingTimeout();
        })
            .catch((e) => {
            logDebug(e);
            this.client.close();
        });
    }
    async ping() {
        return await this.client.request('ReadRequest', '/server/1/status/ping');
    }
    async getBridgeInfo() {
        logDebug('getting bridge information');
        const raw = await this.client.request('ReadRequest', '/device/1');
        if (raw.Body.Device) {
            const device = raw.Body.Device;
            return {
                firmwareRevision: device.FirmwareImage.Firmware.DisplayName,
                manufacturer: 'Lutron Electronics Co., Inc',
                model: device.ModelNumber,
                name: device.FullyQualifiedName.join(' '),
                serialNumber: device.SerialNumber,
            };
        }
        throw new Error('Got bad response to bridge info request');
    }
    async getDeviceInfo() {
        logDebug('getting info about all devices');
        const raw = await this.client.request('ReadRequest', '/device');
        if (raw.Body.Devices) {
            const devices = raw.Body.Devices;
            return devices;
        }
        throw new Error('got bad response to all device list request');
    }
    async setBlindsTilt(device, value) {
        const href = device.LocalZones[0].href + '/commandprocessor';
        logDebug('setting href', href, 'to value', value);
        this.client.request('CreateRequest', href, {
            Command: {
                CommandType: 'GoToTilt',
                TiltParameters: {
                    Tilt: Math.round(value),
                },
            },
        });
    }
    async readBlindsTilt(device) {
        const resp = await this.client.request('ReadRequest', device.LocalZones[0].href + '/status');
        const val = resp.Body.ZoneStatus.Tilt;
        logDebug('read tilt for device', device.FullyQualifiedName.join(' '), 'at', val);
        return val;
    }
    /* A device has a list of ButtonGroup Hrefs. This method maps them to
     * (promises for) the actual ButtonGroup objects themselves.
     */
    async getButtonGroupsFromDevice(device) {
        return Promise.all(device.ButtonGroups.map((bgHref) => this.client
            .request('ReadRequest', bgHref.href)
            .then((resp) => {
            switch (resp.CommuniqueType) {
                case 'ExceptionResponse':
                    return resp.Body;
                    break;
                case 'ReadResponse':
                    return resp.Body.ButtonGroup;
                default:
                    throw new Error("Unexpected communique type");
            }
        })));
    }
    /* Similar to getButtonGroupsFromDevice, a ButtonGroup contains a list of
     * Button Hrefs. This maps them to (promises for) the actual Button
     * objects themselves.
     */
    async getButtonsFromGroup(bgroup) {
        return Promise.all(bgroup.Buttons.map((button) => this.client
            .request('ReadRequest', button.href)
            .then((resp) => resp.Body.Button)));
    }
    _handleUnsolicited(response) {
        logDebug('bridge', this.bridgeID, 'got unsolicited message:');
        logDebug(response);
        this.emit('unsolicited', this.bridgeID, response);
    }
    _handleDisconnect() {
        logDebug('bridge id', this.bridgeID, 'disconnected.');
        this.close();
    }
    close() {
        logDebug('bridge id', this.bridgeID, 'closing');
        clearTimeout(this.pingLooper);
        this.client.close();
    }
}
exports.SmartBridge = SmartBridge;
//# sourceMappingURL=SmartBridge.js.map