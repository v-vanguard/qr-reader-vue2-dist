export interface RoiExtractor {
    extract(video: HTMLVideoElement, target: Uint8ClampedArray): boolean;
    resize(roiSize: number): void;
    size: number;
}
export declare function createRoiExtractor(roiSize: number): RoiExtractor;
//# sourceMappingURL=useRoi.d.ts.map