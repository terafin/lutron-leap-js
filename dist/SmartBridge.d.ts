import { LeapClient } from './LeapClient';
import { Response } from './Messages';
import { Button, ButtonGroup, Device, ExceptionDetail } from './MessageBodyTypes';
import TypedEmitter from 'typed-emitter';
export declare const LEAP_PORT = 8081;
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
declare const SmartBridge_base: new () => TypedEmitter<SmartBridgeEvents>;
export declare class SmartBridge extends SmartBridge_base {
    readonly bridgeID: string;
    client: LeapClient;
    private pingLooper;
    constructor(bridgeID: string, client: LeapClient);
    private _setPingTimeout;
    private pingLoop;
    ping(): Promise<Response>;
    getBridgeInfo(): Promise<BridgeInfo>;
    getDeviceInfo(): Promise<Device[]>;
    setBlindsTilt(device: Device, value: number): Promise<void>;
    readBlindsTilt(device: Device): Promise<number>;
    getButtonGroupsFromDevice(device: Device): Promise<Array<ButtonGroup | ExceptionDetail>>;
    getButtonsFromGroup(bgroup: ButtonGroup): Promise<Button[]>;
    private _handleUnsolicited;
    private _handleDisconnect;
    close(): void;
}
export {};
//# sourceMappingURL=SmartBridge.d.ts.map