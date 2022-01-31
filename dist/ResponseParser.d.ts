import { Response } from './Messages';
import TypedEmitter from 'typed-emitter';
interface ResponseEvents {
    response: (response: Response) => void;
}
declare const ResponseParser_base: new () => TypedEmitter<ResponseEvents>;
export declare class ResponseParser extends ResponseParser_base {
    private buffer;
    handleData(data: string): void;
}
export {};
//# sourceMappingURL=ResponseParser.d.ts.map