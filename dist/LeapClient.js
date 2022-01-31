"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeapClient = void 0;
const tls_1 = require("tls");
const debug_1 = require("debug");
const events_1 = require("events");
const ResponseParser_1 = require("./ResponseParser");
const uuid_1 = require("uuid");
const logDebug = (0, debug_1.default)('leap:protocol');
class LeapClient extends events_1.EventEmitter {
    constructor(host, port, ca, key, cert) {
        super();
        this.host = host;
        this.port = port;
        this.inFlightRequests = new Map();
        this.taggedSubscriptions = new Map();
        this.socketDataHandler = (data) => {
            const s = data.toString();
            logDebug('got data from socket:', s);
            this.responseParser.handleData(s);
        };
        logDebug('new LeapClient being constructed');
        this.connected = null;
        const context = (0, tls_1.createSecureContext)({
            ca,
            key,
            cert,
        });
        this.tlsOptions = {
            secureContext: context,
            secureProtocol: 'TLSv1_2_method',
            rejectUnauthorized: false,
        };
        this.responseParser = new ResponseParser_1.ResponseParser();
        this.responseParser.on('response', this._handleResponse.bind(this));
    }
    async request(communiqueType, url, body, tag) {
        var _a;
        await this.connect();
        if (tag === undefined) {
            tag = (0, uuid_1.v4)();
        }
        let requestResolve = () => {
            // this gets replaced
        };
        let requestReject = () => {
            // this gets replaced
        };
        const requestPromise = new Promise((resolve, reject) => {
            requestResolve = resolve;
            requestReject = reject;
        });
        const message = {
            CommuniqueType: communiqueType,
            Header: {
                ClientTag: tag,
                Url: url,
            },
        };
        if (body !== undefined) {
            message.Body = body;
        }
        const timeout = setTimeout(() => {
            this.inFlightRequests.delete(tag);
            requestReject(new Error('request with tag' + tag + 'timed out'));
        }, 3000);
        this.inFlightRequests.set(tag, {
            message,
            resolve: requestResolve,
            reject: requestReject,
            timeout,
        });
        logDebug('added promise to inFlightRequests with tag key', tag);
        const msg = JSON.stringify(message);
        logDebug('request handler about to write:', msg);
        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.write(msg + '\n', () => {
            logDebug('sent request tag', tag, ' successfully');
        });
        return requestPromise;
    }
    connect() {
        if (!this.connected) {
            logDebug('needs to connect');
            this.connected = new Promise((resolve, reject) => {
                logDebug('about to connect');
                this.socket = (0, tls_1.connect)(this.port, this.host, this.tlsOptions, () => {
                    logDebug('connected!');
                });
                this.socket.once('secureConnect', () => {
                    logDebug('securely connected');
                    this._onConnect(resolve);
                });
                this.socket.once('error', (e) => {
                    logDebug('connection failed: ', e);
                    this.connected = null;
                    reject(e);
                });
            });
        }
        return this.connected;
    }
    close() {
        this.connected = null;
        if (this.socket !== undefined) {
            this.socket.destroy();
        }
    }
    async subscribe(url, callback, communiqueType, body, tag) {
        const _tag = tag || (0, uuid_1.v4)();
        return await this.request(communiqueType, url, body, _tag).then((response) => {
            if (response.Header.StatusCode !== undefined && response.Header.StatusCode.isSuccessful()) {
                this.taggedSubscriptions.set(_tag, callback);
                logDebug('Subscribed to', url, ' as ', _tag);
            }
            return { response, tag: _tag };
        });
    }
    _empty() {
        this.inFlightRequests.clear();
        this.taggedSubscriptions.clear();
    }
    _onConnect(next) {
        logDebug('_onConnect called');
        // Clear out event listeners from _connect()
        if (this.socket) {
            this.socket.removeAllListeners('error');
            this.socket.removeAllListeners('connect');
            this.socket.removeAllListeners('secureConnect');
        }
        const socketError = (err) => {
            logDebug('socket error:', err);
            this._empty();
            if (this.socket) {
                this.socket.destroy();
            }
            this.removeAllListeners('unsolicited');
        };
        function socketEnd() {
            logDebug('client socket has ended');
            if (this) {
                // Acknowledge to other end of the connection that the connection is ended.
                this.end();
            }
        }
        function socketTimeout() {
            logDebug('client socket has timed out');
            if (this) {
                // Acknowledge to other end of the connection that the connection is ended.
                this.end();
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const clientInstance = this;
        function socketClose() {
            logDebug('client socket has closed.');
            if (this) {
                this.removeListener('error', socketError);
                this.removeListener('close', socketClose);
                this.removeListener('data', clientInstance.socketDataHandler);
                this.removeListener('end', socketEnd);
                this.removeListener('timeout', socketTimeout);
            }
            if (this === clientInstance.socket) {
                clientInstance.connected = null;
                delete clientInstance.socket;
            }
            clientInstance._empty();
            clientInstance.removeAllListeners('unsolicited');
            this.emit('disconnected');
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
    _handleResponse(response) {
        const tag = response.Header.ClientTag;
        if (tag !== undefined) {
            logDebug('got response to tag', tag);
            const arrow = this.inFlightRequests.get(tag);
            if (arrow !== undefined) {
                logDebug('tag', tag, ' recognized as in-flight');
                clearTimeout(arrow.timeout);
                this.inFlightRequests.delete(tag);
                arrow.resolve(response);
            }
            else {
                logDebug('tag', tag, ' not in flight');
                const sub = this.taggedSubscriptions.get(tag);
                if (sub !== undefined) {
                    logDebug('tag', tag, ' has a subscription');
                    sub(response);
                }
                else {
                    logDebug('ERROR was not expecting tag ', tag);
                }
            }
        }
        else {
            logDebug('got untagged, unsolicited response');
            this.emit('unsolicited', response);
        }
    }
}
exports.LeapClient = LeapClient;
//# sourceMappingURL=LeapClient.js.map