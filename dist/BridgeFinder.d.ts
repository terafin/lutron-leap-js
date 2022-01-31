import TypedEmitter from 'typed-emitter';
import { SmartBridge } from './SmartBridge';
interface BridgeFinderEvents {
    discovered: (bridge: SmartBridge) => void;
    failed: (error: Error) => void;
}
export declare type SecretStorage = {
    ca: string;
    key: string;
    cert: string;
};
declare const BridgeFinder_base: new () => TypedEmitter<BridgeFinderEvents>;
export declare class BridgeFinder extends BridgeFinder_base {
    private discovery;
    private secrets;
    constructor(secrets: Map<string, SecretStorage>);
    destroy(): void;
    private extractIp;
    private extractBridgeFromIP;
    private getHostnameFromIP;
    private handleDiscovery;
}
export {};
//# sourceMappingURL=BridgeFinder.d.ts.map