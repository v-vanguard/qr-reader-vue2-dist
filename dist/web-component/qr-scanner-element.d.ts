declare const ElementBase: typeof HTMLElement;
export declare class QrScannerElement extends ElementBase {
    static get observedAttributes(): readonly string[];
    private _videoConstraints;
    private _camera;
    private _decoder;
    private _flashTimer;
    private _started;
    private _hintEl;
    private _errorEl;
    private _statsEls;
    private _videoEl;
    private _currentStatus;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, _old: string | null, _next: string | null): void;
    get videoConstraints(): MediaTrackConstraints;
    set videoConstraints(v: MediaTrackConstraints);
    start(): Promise<void>;
    stop(): void;
    private getRoiSize;
    private getDebounceMs;
    private getAutoStart;
    private getPreferZoom;
    private getBinarizerStrategy;
    private flash;
    private updateStats;
    private updateHint;
    private emitError;
}
export declare function defineQrScannerElement(tagName?: string): void;
export {};
//# sourceMappingURL=qr-scanner-element.d.ts.map