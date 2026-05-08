export type ScannerStatus = 'idle' | 'initializing' | 'requesting_camera' | 'running' | 'paused' | 'error';
export type BinarizerStrategy = 'auto' | 'otsu' | 'adaptive_mean' | 'sauvola';
export interface ScannerError {
    code: 'camera_denied' | 'camera_unavailable' | 'wasm_init_failed' | 'worker_crashed' | 'unknown';
    message: string;
    cause?: unknown;
}
export interface DecoderStats {
    framesProcessed: number;
    framesDecoded: number;
    /**
     * 直近のフレームで実際にデコードに使われた戦略名。
     * - `'rqrr'`: rqrr デコーダ（perspective に強い）
     * - `'quirc:passthrough'`: quircs に前処理済みグレースケールをそのまま投入
     * - `'quirc:otsu' | 'quirc:adaptive_mean' | 'quirc:sauvola'`: quircs + 各 binarizer
     * - `''`: 直近フレームではデコード失敗
     */
    lastBinarizerUsed: string;
    lastDecodeMs: number;
}
export interface ScannerProps {
    roiSize?: number;
    debounceMs?: number;
    autoStart?: boolean;
    videoConstraints?: MediaTrackConstraints;
    binarizerStrategy?: BinarizerStrategy;
    showStats?: boolean;
}
//# sourceMappingURL=types.d.ts.map