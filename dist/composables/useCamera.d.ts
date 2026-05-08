import { ScannerError } from '../types';
export interface UseCameraOptions {
    videoConstraints?: MediaTrackConstraints;
    preferZoom?: number;
    onError?: (err: ScannerError) => void;
    onActiveChange?: (active: boolean) => void;
}
export interface CameraInstance {
    readonly active: boolean;
    readonly videoWidth: number;
    readonly videoHeight: number;
    readonly stream: MediaStream | null;
    start: (video: HTMLVideoElement) => Promise<void>;
    stop: () => void;
}
export declare function useCamera(opts?: UseCameraOptions): CameraInstance;
//# sourceMappingURL=useCamera.d.ts.map