import { BinarizerStrategy, DecoderStats } from '../types';
export interface InitMessage {
    type: 'init';
    width: number;
    height: number;
}
export interface FrameMessage {
    type: 'frame';
    rgba: Uint8ClampedArray;
    width: number;
    height: number;
    frameId: number;
}
export interface SetStrategyMessage {
    type: 'set_strategy';
    strategy: BinarizerStrategy;
}
export interface DisposeMessage {
    type: 'dispose';
}
export type WorkerInbound = InitMessage | FrameMessage | SetStrategyMessage | DisposeMessage;
export interface ReadyOutbound {
    type: 'ready';
    width: number;
    height: number;
}
export interface DecodedOutbound {
    type: 'decoded';
    payload: string;
    frameId: number;
    stats: DecoderStats;
    rgba: Uint8ClampedArray;
}
export interface FrameDoneOutbound {
    type: 'frame_done';
    frameId: number;
    stats: DecoderStats;
    rgba: Uint8ClampedArray;
}
export interface ErrorOutbound {
    type: 'error';
    code: string;
    message: string;
}
export type WorkerOutbound = ReadyOutbound | DecodedOutbound | FrameDoneOutbound | ErrorOutbound;
//# sourceMappingURL=protocol.d.ts.map