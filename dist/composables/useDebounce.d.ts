export interface PayloadDebouncer {
    accept(payload: string): boolean;
    reset(): void;
}
export declare function createPayloadDebouncer(windowMs: number): PayloadDebouncer;
//# sourceMappingURL=useDebounce.d.ts.map