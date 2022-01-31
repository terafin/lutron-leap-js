import { Response } from './Messages';
import TypedEmitter from 'typed-emitter';
export declare type ResponseWithTag = {
    response: Response;
    tag: string;
};
interface LeapClientEvents {
    unsolicited: (response: Response) => void;
    disconnected: () => void;
}
declare const LeapClient_base: new () => TypedEmitter<LeapClientEvents>;
export declare class LeapClient extends LeapClient_base {
    private readonly host;
    private readonly port;
    private connected;
    private socket?;
    private readonly tlsOptions;
    private inFlightRequests;
    private taggedSubscriptions;
    private responseParser;
    constructor(host: string, port: number, ca: string, key: string, cert: string);
    request(communiqueType: string, url: string, body?: Record<string, unknown>, tag?: string): Promise<Response>;
    connect(): Promise<void>;
    close(): void;
    subscribe(url: string, callback: (resp: Response) => void, communiqueType: string, body?: Record<string, unknown>, tag?: string): Promise<ResponseWithTag>;
    private _empty;
    private _onConnect;
    private readonly socketDataHandler;
    private _handleResponse;
}
export {};
//# sourceMappingURL=LeapClient.d.ts.map