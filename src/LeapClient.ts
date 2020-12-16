import { ConnectionOptions, TLSSocket, connect, createSecureContext } from 'tls';
import debug from 'debug';

import { Response } from './Messages';
import { ResponseParser } from './ResponseParser';

import { v4 as uuidv4 } from 'uuid';

const log_debug = debug('leap:protocol');

interface Message {
    CommuniqueType: string;
    Header: {
        ClientTag: string;
        Url: string;
    };
    body?: any;
}

interface MessageDetails {
    message: Message;
    resolve: (message?: Response) => void;
    reject: (err: Error) => void;
}

export class LeapClient {
    private connected = false;

    private socket?: TLSSocket;
    private readonly tlsOptions: ConnectionOptions;

    private inFlightRequests: Map<string, MessageDetails> = new Map();
    private taggedSubscriptions: Map<string, (r: Response) => void> = new Map();
    private unsolicitedSubs: Array<(r: Response) => void> = [];

    private responseParser: ResponseParser;

    constructor(private readonly host: string, private readonly port: number, ca: string, key: string, cert: string) {
        log_debug('new LeapClient being constructed');
        const context = createSecureContext({
            ca: ca,
            key: key,
            cert: cert,
        });

        this.tlsOptions = {
            secureContext: context,
        };

        this.responseParser = new ResponseParser();
        this.responseParser.on('response', this._handleResponse.bind(this));
    }

    public async request(communique_type: string, url: string, body?: any, tag?: string): Promise<Response> {
        log_debug('new request incoming with tag ', tag);
        if (!this.connected) {
            log_debug('was not connected');
            await this.connect();
        }
        log_debug('connected! continuing...');

        if (tag === undefined) {
            tag = uuidv4();
        }

        let requestResolve: (response?: Response) => void = () => {
            // this gets replaced
        };

        let requestReject: (err: Error) => void = () => {
            // this gets replaced
        };

        const requestPromise = new Promise<Response>((resolve, reject) => {
            requestResolve = resolve;
            requestReject = reject;
        });

        const message: Message = {
            CommuniqueType: communique_type,
            Header: {
                ClientTag: tag,
                Url: url,
            },
        };

        if (body !== undefined) {
            message.body = body;
        }

        this.inFlightRequests[tag] = {
            message: message,
            resolve: requestResolve,
            reject: requestReject,
        };
        log_debug('added promise to inFlightRequests with tag key ', tag);

        const msg = JSON.stringify(message);
        log_debug('request handler about to write: ', msg);
        this.socket.write(msg, () => {
            log_debug('sent request tag ', tag, ' successfully');
        });

        return requestPromise;
    }

    public connect(): Promise<void> {
        if (this.connected) {
            log_debug('oops already connected');
            return Promise.resolve();
        }
        log_debug('needs to connect');

        return new Promise((resolve, reject) => {
            log_debug('about to connect');
            this.socket = connect(this.port, this.host, this.tlsOptions);
            this.socket.once('secureConnect', () => {
                log_debug('securely connected');
                this._onConnect(resolve);
            });

            this.socket.once('error', reject);
        });
    }

    private _empty() {
        for (const arrow in this.inFlightRequests) {
            this.inFlightRequests.delete(arrow);
        }

        for (const sub in this.taggedSubscriptions) {
            this.taggedSubscriptions.delete(sub);
        }

        this.unsolicitedSubs = [];
    }

    private _onConnect(next: () => void): void {
        log_debug('_onConnect called');
        // Clear out event listeners from _connect()
        if (this.socket) {
            this.socket.removeAllListeners('error');
            this.socket.removeAllListeners('connect');
            this.socket.removeAllListeners('secureConnect');
        }

        this.connected = true;

        const socketError = (err: Error): void => {
            log_debug('socket error: ', err);
            this._empty();

            if (this.socket) {
                this.socket.destroy();
            }
        };

        function socketEnd(this: TLSSocket): void {
            if (this) {
                // Acknowledge to other end of the connection that the connection is ended.
                this.end();
            }
        }

        function socketTimeout(this: TLSSocket): void {
            if (this) {
                // Acknowledge to other end of the connection that the connection is ended.
                this.end();
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const clientInstance = this;

        function socketClose(this: TLSSocket): void {
            if (this) {
                this.removeListener('error', socketError);
                this.removeListener('close', socketClose);
                this.removeListener('data', clientInstance.socketDataHandler);
                this.removeListener('end', socketEnd);
                this.removeListener('timeout', socketTimeout);
            }

            if (this === clientInstance.socket) {
                clientInstance.connected = false;
                delete clientInstance.socket;
            }

            clientInstance._empty();
        }

        if (this.socket) {
            this.socket.on('error', socketError);
            this.socket.on('close', socketClose);
            this.socket.on('data', this.socketDataHandler);
            this.socket.on('end', socketEnd);
            this.socket.on('timeout', socketTimeout);
        }

        return next();
    }

    private readonly socketDataHandler = (data: Buffer): void => {
        const s = data.toString();
        log_debug('got data from socket: ', s);
        this.responseParser.handleData(s);
    };

    private _handleResponse(response: Response): void {
        const tag = response.Header.ClientTag;
        if (tag !== undefined) {
            log_debug('got response to tag ', tag);
            const arrow: MessageDetails = this.inFlightRequests[tag];
            if (arrow !== undefined) {
                log_debug('tag ', tag, ' recognized as in-flight');
                this.inFlightRequests.delete(tag);
                arrow.resolve(response);
            } else {
                const sub = this.taggedSubscriptions[tag];
                if (sub !== undefined) {
                    sub(response);
                } else {
                    log_debug('ERROR was not expecting tag ', tag);
                }
            }
        } else {
            log_debug('got untagged response');
            // maybe emit 'unsolicited'?
            for (const h of this.unsolicitedSubs) {
                try {
                    h(response);
                } catch (e) {
                    log_debug('got error from handler: ', e);
                }
            }
        }
    }
}