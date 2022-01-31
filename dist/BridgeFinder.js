"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeFinder = void 0;
const debug_1 = require("debug");
const events_1 = require("events");
const ipaddress = require("ip-address");
const mdns = require("multicast-dns");
const dnspacket = require("dns-packet");
const tinkerhub_mdns_1 = require("tinkerhub-mdns");
const SmartBridge_1 = require("./SmartBridge");
const LeapClient_1 = require("./LeapClient");
const logDebug = (0, debug_1.default)('leap:protocol:discovery');
class BridgeFinder extends events_1.EventEmitter {
    constructor(secrets) {
        super();
        this.secrets = new Map();
        this.secrets = secrets;
        this.discovery = new tinkerhub_mdns_1.MDNSServiceDiscovery({
            type: 'lutron',
            protocol: tinkerhub_mdns_1.Protocol.TCP,
        });
        this.discovery.onAvailable((svc) => {
            this.handleDiscovery(svc)
                .then((bridge) => {
                this.emit('discovered', bridge);
            })
                .catch((e) => {
                logDebug('failed to handle discovery:', e);
                this.emit('failed', e);
            });
        });
    }
    destroy() {
        this.discovery.destroy();
    }
    extractIp(haps) {
        for (const hostandport of haps) {
            logDebug('checking', hostandport);
            // prefer the ipv6 address, but only if it's reachable
            //
            // FIXME: this code is untested in real life, as my home network is
            // ipv4 only.
            const _ip = hostandport.host;
            try {
                const addr = new ipaddress.Address6(_ip);
                if (!addr.isLinkLocal() && !addr.isLoopback()) {
                    // TODO is this sufficient?
                    return _ip;
                    break;
                }
            }
            catch (e) {
                // try again, but as ipv4
                logDebug('was not ipv6:', e);
                try {
                    const _ = new ipaddress.Address4(_ip);
                    return _ip;
                }
                catch (e) {
                    // okay, apparently it's some garbage. log it and move on
                    logDebug('could not parse HostAndPort', hostandport, 'because', e);
                }
            }
        }
        return undefined;
    }
    async extractBridgeFromIP(ipaddr) {
        if (this.secrets.size == 1) {
            // If there is only one hub then we can get the bridge value from the
            // secrets
            return this.secrets.entries().next().value[0];
        }
        else {
            // Otherwise query mdns for the hostname corresponding to the ip
            let hostname = await this.getHostnameFromIP(ipaddr);
            let bridgeID;
            try {
                bridgeID = hostname.match(/[Ll]utron-(?<id>\w+)\.local/).groups.id;
            }
            catch (_a) {
                if (hostname) {
                    bridgeID = ipaddr.replace('.', '_');
                }
                else {
                    throw new Error('could not extract bridge id from ip address');
                }
            }
            return bridgeID;
        }
    }
    getHostnameFromIP(ip) {
        // n.b. this must not end with a dot. see https://github.com/mafintosh/dns-packet/issues/62
        const reversed = ip.split('.').reverse().join('.').concat('.in-addr.arpa');
        const _id = Math.floor(Math.random() * (65535 - 1 + 1)) + 1;
        let lookupResolve = (info) => {
            // this gets replaced
        };
        let lookupReject = (err) => {
            // this gets replaced
        };
        const lookupPromise = new Promise((resolve, reject) => {
            lookupResolve = resolve;
            lookupReject = reject;
        });
        const resolver = mdns({
            multicast: true,
            ttl: 1,
            port: 0,
        });
        const timeout = setTimeout(lookupReject, 1000, `Did not get a hostname for ${ip} in time`);
        resolver.on('response', (packet) => {
            if (packet.id === _id) {
                clearTimeout(timeout);
                lookupResolve(packet.answers[0].data);
            }
        });
        // TODO this might not be the minimal argument possible
        // see https://github.com/mafintosh/multicast-dns/issues/13
        resolver.query({
            // tslint:disable:no-bitwise
            flags: dnspacket.RECURSION_DESIRED | dnspacket.AUTHENTIC_DATA,
            id: _id,
            questions: [
                {
                    name: reversed,
                    type: 'PTR',
                    class: 'IN',
                },
            ],
            additionals: [
                {
                    name: '.',
                    type: 'OPT',
                    udpPayloadSize: 0x1000,
                },
            ],
        }, {
            port: 5353,
            address: '224.0.0.251',
        });
        return lookupPromise;
    }
    async handleDiscovery(svc) {
        if (svc.data.get('systype') !== 'SmartBridge') {
            logDebug('invalid responder was', svc);
            throw new Error('invalid responder to discovery request');
        }
        const ipaddr = this.extractIp(svc.addresses);
        logDebug('got useful ipaddr', ipaddr);
        if (!ipaddr) {
            logDebug('thing without useful address:', svc);
            throw new Error('could not get a useful address');
        }
        let bridgeID = await this.extractBridgeFromIP(ipaddr);
        logDebug('extracted bridge ID:', bridgeID);
        if (this.secrets.has(bridgeID)) {
            const these = this.secrets.get(bridgeID);
            const client = new LeapClient_1.LeapClient(ipaddr, SmartBridge_1.LEAP_PORT, these.ca, these.key, these.cert);
            await client.connect();
            return new SmartBridge_1.SmartBridge(bridgeID, client);
        }
        else {
            throw new Error('no credentials for bridge ID ' + bridgeID);
        }
    }
}
exports.BridgeFinder = BridgeFinder;
//# sourceMappingURL=BridgeFinder.js.map