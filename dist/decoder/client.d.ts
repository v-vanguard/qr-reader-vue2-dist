import { BinarizerStrategy, DecoderStats, ScannerError } from '../types';
export interface DecoderClientOptions {
    width: number;
    height: number;
    poolSize?: number;
    onDecoded?: (payload: string, stats: DecoderStats) => void;
    onFrameDone?: (stats: DecoderStats) => void;
    onError?: (err: ScannerError) => void;
}
export declare class DecoderClient {
    private worker;
    private pool;
    private bufferLength;
    private pending;
    private nextFrameId;
    private opts;
    private inFlight;
    constructor(opts: DecoderClientOptions);
    init(): Promise<void>;
    setStrategy(strategy: BinarizerStrategy): void;
    /**
     * @returns 利用可能なバッファ。フレーム取得側はここに RGBA を書き込んで sendFrame に渡す
     */
    acquireBuffer(): Uint8ClampedArray | null;
    /**
     * Worker が解析中のフレーム数（バックプレッシャ判定に利用）
     */
    pendingFrames(): number;
    sendFrame(rgba: Uint8ClampedArray): boolean;
    dispose(): void;
    private onMessage;
}
//# sourceMappingURL=client.d.ts.map