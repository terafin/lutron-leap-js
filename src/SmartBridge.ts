import debug from 'debug';
import { EventEmitter } from 'events';

import { LeapClient } from './LeapClient';
import { Response } from './Messages';
import { OneZoneStatus, MultipleDeviceDefinition, OneDeviceDefinition, Device } from './MessageBodyTypes';

import TypedEmitter from 'typed-emitter';
const logDebug = debug('leap:bridge');

export const LEAP_PORT = 8081;
const PING_INTERVAL_MS = 60000;
const PING_TIMEOUT_MS = 1000;

export interface BridgeInfo {
    firmwareRevision: string;
    manufacturer: string;
    model: string;
    name: string;
    serialNumber: string;
}

interface SmartBridgeEvents {
    unsolicited: (bridgeID: string, response: Response) => void;
    disconnected: () => void;
}

export class SmartBridge extends (EventEmitter as new () => TypedEmitter<SmartBridgeEvents>) {
    private pingLooper!: ReturnType<typeof setTimeout>; // this is indeed definitely set in the constructor

    constructor(
        public readonly bridgeID: string,
        public client: LeapClient
    ) {
        super();
        logDebug("new bridge", bridgeID, "being constructed");
        client.on('unsolicited', this._handleUnsolicited.bind(this));
        client.on('disconnected', this._handleDisconnect.bind(this));

        this._setPingTimeout();
    }

    private _setPingTimeout(): void {
        this.pingLooper = setTimeout((): void => {
            clearTimeout(this.pingLooper);
            this.pingLoop();
        }, PING_INTERVAL_MS);
    }

    private pingLoop(): void {
        const timeout = new Promise((resolve, reject): void => {
            setTimeout((): void => {
                reject('Ping timeout');
            }, PING_TIMEOUT_MS);
        });

        Promise.race([this.ping(), timeout]).then(() => {
            clearTimeout(this.pingLooper);
            this._setPingTimeout();
        }).catch(e => {
            logDebug(e);
            this.client.close();
        });
    }

    public async ping(): Promise<Response> {
        return await this.client.request('ReadRequest', '/server/1/status/ping');
    }

    public async getBridgeInfo(): Promise<BridgeInfo> {
        logDebug('getting bridge information');
        const raw = await this.client.request('ReadRequest', '/device/1');
        if ((raw.Body! as OneDeviceDefinition).Device) {
            const device = (raw.Body! as OneDeviceDefinition).Device;
            return {
                firmwareRevision: device.FirmwareImage.Firmware.DisplayName,
                manufacturer: "Lutron Electronics Co., Inc",
                model: device.ModelNumber,
                name: device.FullyQualifiedName.join(' '),
                serialNumber: device.SerialNumber,
            };

        }
        throw new Error("Got bad response to bridge info request")
    }

    public async getDeviceInfo(): Promise<Device[]> {
        logDebug('getting info about all devices');
        const raw = await this.client.request('ReadRequest', '/device');
        if ((raw.Body! as MultipleDeviceDefinition).Devices) {
            const devices = (raw.Body! as MultipleDeviceDefinition).Devices;
            return devices;
        }
        throw new Error("got bad response to all device list request");
    }

    public async setBlindsTilt(
        device: Device,
        value: number,
    ): Promise<void> {

        const href = device.LocalZones[0].href + "/commandprocessor";
        logDebug("setting href", href, "to value", value);
        this.client.request(
            "CreateRequest",
            href,
            {
                Command: {
                    CommandType: "GoToTilt",
                    TiltParameters: {
                        Tilt: Math.round(value)
                    },
                }
            });
    }

    public async readBlindsTilt(
        device: Device,
    ): Promise<number> {
        const resp = await this.client.request(
            "ReadRequest",
            device.LocalZones[0].href + "/status",
        );
        const val = (resp.Body! as OneZoneStatus).ZoneStatus.Tilt;
        logDebug("read tilt for device", device.FullyQualifiedName.join(' '), "at", val);
        return val;
    }

    private _handleUnsolicited(response: Response) {
        logDebug('bridge', this.bridgeID, 'got unsolicited message:');
        logDebug(response);
        this.emit("unsolicited", this.bridgeID, response);
    }

    private _handleDisconnect(): void {
        this.client.close();
    }
}
