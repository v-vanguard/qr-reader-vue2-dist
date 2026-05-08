export { default as QrScanner } from './components/QrScanner.vue';
export { default as GuideOverlay } from './components/GuideOverlay.vue';
export { useCamera } from './composables/useCamera';
export { useDecoder } from './composables/useDecoder';
export { createRoiExtractor } from './composables/useRoi';
export { createPayloadDebouncer } from './composables/useDebounce';
export { DecoderClient } from './decoder/client';
export type { ScannerStatus, ScannerError, ScannerProps, BinarizerStrategy, DecoderStats, } from './types';
export type { WorkerInbound, WorkerOutbound, } from './decoder/protocol';
//# sourceMappingURL=index.d.ts.map