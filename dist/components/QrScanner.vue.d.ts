import { DecoderStats, ScannerError, ScannerStatus } from '../types';
declare const _default: import('vue').ComponentOptions<import('vue').default<Record<string, any>, Record<string, any>, never, never, (event: string, ...args: any[]) => import('vue').default>, import('@vue/composition-api').ShallowUnwrapRef<unknown> & import('@vue/composition-api').Data, {}, {}, {}, import('@vue/composition-api').ExtractPropTypes<{}>, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin> & Omit<import('vue').VueConstructor<import('vue').default<Record<string, any>, Record<string, any>, never, never, (event: string, ...args: any[]) => import('vue').default>>, never> & (new (...args: any[]) => import('@vue/composition-api').ComponentRenderProxy<{} & {} & {
    onError?: ((_err: ScannerError) => any) | undefined;
    onDecoded?: ((_payload: string, _stats: DecoderStats) => any) | undefined;
    onStatus?: ((_status: ScannerStatus) => any) | undefined;
}, import('@vue/composition-api').ShallowUnwrapRef<unknown>, import('@vue/composition-api').Data, {}, {}, {}, {}, {
    decoded: (_payload: string, _stats: DecoderStats) => true;
    error: (_err: ScannerError) => true;
    status: (_status: ScannerStatus) => true;
}, {} & {} & {
    onError?: ((_err: ScannerError) => any) | undefined;
    onDecoded?: ((_payload: string, _stats: DecoderStats) => any) | undefined;
    onStatus?: ((_status: ScannerStatus) => any) | undefined;
}, {}, true>);
export default _default;
//# sourceMappingURL=QrScanner.vue.d.ts.map