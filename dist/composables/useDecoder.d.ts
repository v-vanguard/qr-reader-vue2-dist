import { BinarizerStrategy, DecoderStats, ScannerError, ScannerStatus } from '../types';
export interface UseDecoderOptions {
    roiSize: number;
    debounceMs: number;
    binarizerStrategy: BinarizerStrategy;
    onDecoded: (payload: string, stats: DecoderStats) => void;
    onStats?: (stats: DecoderStats) => void;
    onStatusChange?: (status: ScannerStatus) => void;
    onError?: (err: ScannerError) => void;
}
export interface DecoderInstance {
    readonly status: ScannerStatus;
    readonly stats: DecoderStats;
    start: (video: HTMLVideoElement) => Promise<void>;
    stop: () => void;
    setStrategy: (strategy: BinarizerStrategy) => void;
}
export declare function useDecoder(opts: UseDecoderOptions): DecoderInstance;
//# sourceMappingURL=useDecoder.d.ts.map