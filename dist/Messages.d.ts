import { MessageBodyType, BodyType } from './MessageBodyTypes';
declare type CommuniqueType = string;
export interface ResponseHeaderJSON {
    MessageBodyType?: string;
    StatusCode?: string;
    Url?: string;
    ClientTag?: string;
}
export declare class ResponseHeader {
    StatusCode?: ResponseStatus;
    Url?: string;
    MessageBodyType?: MessageBodyType;
    ClientTag?: string;
    static fromJSON(json?: ResponseHeaderJSON): ResponseHeader;
}
export interface ResponseJSON {
    CommuniqueType: CommuniqueType;
    Header: ResponseHeaderJSON;
    Body: object;
}
export declare class Response {
    CommuniqueType?: CommuniqueType;
    Body?: BodyType;
    Header: ResponseHeader;
    constructor();
    static fromJSON(json: ResponseJSON): Response;
}
export declare class ResponseStatus {
    message: string;
    code?: number | undefined;
    constructor(message: string, code?: number | undefined);
    static fromString(s: string): ResponseStatus;
    isSuccessful(): boolean;
}
export {};
//# sourceMappingURL=Messages.d.ts.map