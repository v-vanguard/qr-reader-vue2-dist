import { Ref } from '@vue/composition-api';
import { ScannerError } from '../types';
export interface UseCameraOptions {
    videoConstraints?: MediaTrackConstraints;
    preferZoom?: number;
    onError?: (err: ScannerError) => void;
}
export interface UseCameraReturn {
    stream: Ref<MediaStream | null>;
    active: Ref<boolean>;
    videoWidth: Ref<number>;
    videoHeight: Ref<number>;
    start: (video: HTMLVideoElement) => Promise<void>;
    stop: () => void;
}
export declare function useCamera(opts?: UseCameraOptions): UseCameraReturn;
//# sourceMappingURL=useCamera.d.ts.map