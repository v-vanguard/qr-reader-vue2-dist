import { PropType } from 'vue';
import { BinarizerStrategy, DecoderStats, ScannerError, ScannerStatus } from '../types';
declare const _default: import('vue').DefineComponent<{
    roiSize: {
        type: NumberConstructor;
        default: number;
    };
    debounceMs: {
        type: NumberConstructor;
        default: number;
    };
    autoStart: {
        type: BooleanConstructor;
        default: boolean;
    };
    videoConstraints: {
        type: PropType<MediaTrackConstraints>;
        default: () => {};
    };
    binarizerStrategy: {
        type: PropType<BinarizerStrategy>;
        default: string;
    };
    showStats: {
        type: BooleanConstructor;
        default: boolean;
    };
    preferZoom: {
        type: NumberConstructor;
        default: number;
    };
}, {
    videoRef: import('vue').Ref<HTMLVideoElement | null>;
    status: import('vue').ComputedRef<ScannerStatus>;
    stats: import('vue').ComputedRef<DecoderStats>;
    error: import('vue').Ref<{
        code: "camera_denied" | "camera_unavailable" | "wasm_init_failed" | "worker_crashed" | "unknown";
        message: string;
        cause?: unknown;
    } | null>;
    flashing: import('vue').Ref<boolean>;
    rootClass: import('vue').ComputedRef<{
        'qr-scanner--running': boolean;
        'qr-scanner--error': boolean;
    }>;
    hintText: import('vue').ComputedRef<string>;
    start: () => Promise<void>;
    stop: () => void;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    decoded: (_payload: string, _stats: DecoderStats) => true;
    error: (_err: ScannerError) => true;
    status: (_status: ScannerStatus) => true;
}, string, Readonly<import('vue').ExtractPropTypes<{
    roiSize: {
        type: NumberConstructor;
        default: number;
    };
    debounceMs: {
        type: NumberConstructor;
        default: number;
    };
    autoStart: {
        type: BooleanConstructor;
        default: boolean;
    };
    videoConstraints: {
        type: PropType<MediaTrackConstraints>;
        default: () => {};
    };
    binarizerStrategy: {
        type: PropType<BinarizerStrategy>;
        default: string;
    };
    showStats: {
        type: BooleanConstructor;
        default: boolean;
    };
    preferZoom: {
        type: NumberConstructor;
        default: number;
    };
}>>, {
    roiSize: number;
    debounceMs: number;
    autoStart: boolean;
    videoConstraints: MediaTrackConstraints;
    binarizerStrategy: BinarizerStrategy;
    showStats: boolean;
    preferZoom: number;
}>;
export default _default;
//# sourceMappingURL=QrScanner.vue.d.ts.map