# @v-vanguard/qr-reader-vue2

iPad の暗所環境で 2cm 角の極小 QR コード（V4–V6 / JSON 想定）を連続スキャンするための **Web Component**。フレームワーク非依存で、vanilla HTML / Vue 2 / Vue 3 / React / Svelte / Angular のどこからでも `<qr-scanner>` 1 タグで使えます。

- **解析エンジン**: Rust + WebAssembly（[`quircs`](https://crates.io/crates/quircs) = C 版 quirc の pure Rust port）
- **実行モデル**: Web Worker でデコード／前処理を実行、UI スレッドはフリーズしない
- **前処理パイプライン**: 3 フレーム平均ノイズ除去 → CLAHE → アンシャープマスク → 動的二値化（Otsu / Adaptive Mean / Sauvola をフレームごとにローテーション）
- **配信形態**: Worker と Wasm を 1 ファイルにインライン化済みの ESM/UMD バンドル
- **配布**: ソース private repo の `dist/` を public repo (`qr-reader-vue2-dist`) に同期。利用者は **registry / 認証なしで Git URL から `npm install`**

> パッケージ名に `-vue2` が残っていますが、Web Component 化に伴い **Vue 依存は撤廃**されました（peer dependency 0 個）。改名は将来予定。

## 前提

- `git` がインストールされていること

それだけです。配布 repo は public で、PAT / SSH 鍵 / `~/.npmrc` のセットアップは **一切不要**。Docker / CI など認証情報を持たない環境からもそのまま install できます。

## インストール

タグを `#vX.Y.Z` で必ず固定してください。

```bash
npm install git+https://github.com/v-vanguard/qr-reader-vue2-dist.git#v0.3.0
```

`package.json` には次のように記録されます:

```json
{
  "dependencies": {
    "@v-vanguard/qr-reader-vue2": "git+https://github.com/v-vanguard/qr-reader-vue2-dist.git#v0.3.0"
  }
}
```

## 基本の使い方

import するとブラウザに `<qr-scanner>` Custom Element が登録されます。

### vanilla HTML / TypeScript

```html
<qr-scanner roi-size="640" debounce-ms="2000"></qr-scanner>

<script type="module">
  import '@v-vanguard/qr-reader-vue2';

  const scanner = document.querySelector('qr-scanner');
  scanner.addEventListener('decoded', (e) => {
    console.log('decoded:', e.detail.payload);
  });
  scanner.addEventListener('error', (e) => {
    console.error(e.detail.error.code, e.detail.error.message);
  });
</script>
```

### Vue 2 / Nuxt 2

「未知のタグを警告しない」よう `Vue.config.ignoredElements` を設定します。

```js
// main.js / Nuxt の plugin
import Vue from 'vue';
import '@v-vanguard/qr-reader-vue2';

Vue.config.ignoredElements = [/^qr-/];
```

```vue
<template>
  <qr-scanner :roi-size="640" :debounce-ms="2000" @decoded="onDecoded" @error="onError"></qr-scanner>
</template>

<script>
export default {
  methods: {
    onDecoded(e) {
      console.log(e.detail.payload);
    },
    onError(e) {
      console.error(e.detail.error);
    },
  },
};
</script>
```

Vue 2 は CustomEvent をネイティブの `@decoded` / `@error` で拾えます。`event.detail` 経由で payload にアクセス。

### Vue 3

```vue
<script setup>
import '@v-vanguard/qr-reader-vue2';
</script>

<template>
  <qr-scanner roi-size="640" @decoded="(e) => console.log(e.detail.payload)"></qr-scanner>
</template>
```

`vue.config.js` などで `compilerOptions.isCustomElement: (tag) => tag.startsWith('qr-')` を指定すると Vue が誤って解釈しません。

### React

```jsx
import { useEffect, useRef } from 'react';
import '@v-vanguard/qr-reader-vue2';

export function Scanner() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const onDecoded = (e) => console.log(e.detail.payload);
    el.addEventListener('decoded', onDecoded);
    return () => el.removeEventListener('decoded', onDecoded);
  }, []);
  return <qr-scanner ref={ref} roi-size="640" />;
}
```

React は属性をケバブケースで指定（JSX の camelCase は予約 prop だけ）。TypeScript で使うなら `JSX.IntrinsicElements['qr-scanner']` の宣言が必要。

## API

### 属性

| 属性 | 既定値 | 説明 |
|---|---|---|
| `roi-size` | `400` | ROI 中央クロップの一辺サイズ（px） |
| `debounce-ms` | `2000` | 同一 payload を抑止する時間 |
| `auto-start` | `true` | 接続時にカメラを起動するか（`false` で無効化、`element.start()` を手動呼び出し） |
| `binarizer-strategy` | `auto` | `auto` / `otsu` / `adaptive_mean` / `sauvola` |
| `show-stats` | なし | 属性を付けるとデバッグ統計を表示 |
| `prefer-zoom` | `0` | best-effort のデジタルズーム |

### DOM プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `videoConstraints` | `MediaTrackConstraints` | `getUserMedia` への追加制約。属性で渡せないので JS から代入: `el.videoConstraints = { ... }` |

### イベント (CustomEvent)

| event | `event.detail` |
|---|---|
| `decoded` | `{ payload: string, stats: DecoderStats }` |
| `error` | `{ error: ScannerError }` |
| `status` | `{ status: ScannerStatus }` |

### メソッド

```ts
element.start(): Promise<void>;  // auto-start=false 時の手動起動
element.stop(): void;
```

### Slots

| slot | 説明 |
|---|---|
| `guide` | 既定のガイド枠を差し替え |
| `overlay` | 任意の情報表示を被せる |

## 低レベル API（フレームワーク非依存コア）

`<qr-scanner>` を使わずに自前 UI を組む場合:

```ts
import {
  DecoderClient,
  createRoiExtractor,
  createPayloadDebouncer,
} from '@v-vanguard/qr-reader-vue2';

const ROI = 640;
const video = document.querySelector('video');

video.srcObject = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'environment', width: { ideal: 1920 } },
  audio: false,
});
await video.play();

const extractor = createRoiExtractor(ROI);
const debouncer = createPayloadDebouncer(2000);

const client = new DecoderClient({
  width: ROI,
  height: ROI,
  onDecoded: (payload) => {
    if (debouncer.accept(payload)) console.log(payload);
  },
});
await client.init();

const tick = () => {
  if (client.pendingFrames() < 2) {
    const buf = client.acquireBuffer();
    if (buf && extractor.extract(video, buf)) client.sendFrame(buf);
  }
  video.requestVideoFrameCallback?.(tick) ?? requestAnimationFrame(tick);
};
tick();
```

`useCamera` / `useDecoder` を直接使う API も export しています（plain factory 関数、Vue 連想無し）。

## CSS のカスタマイズ

Shadow DOM 内のスタイルは **CSS 変数経由で外から theming** できます。

```css
qr-scanner {
  --qr-guide-color: #f97316;
  --qr-guide-flash-color: #84cc16;
  --qr-guide-frame-size: min(50vmin, 320px);
  --qr-guide-corner-thickness: 6px;
}
```

`::part()` を使えば Shadow DOM 内の特定要素にもアクセスできます (`qr-scanner::part(stats)` など)。

## よくあるハマり

- **iPad で起動しない** → HTTPS 必須。`getUserMedia` は `https://` か `localhost` でしか呼べません
- **本番ビルドで Worker chunk が見当たらない** → このライブラリは Worker と Wasm を 1 ファイルに inline 済みで `dist/qr-reader.mjs` だけで完結。consumer の bundler は何もしなくて良い
- **Vue 2 で `Unknown custom element` 警告** → `Vue.config.ignoredElements = [/^qr-/]` を main.js / plugin で設定
- **React で属性が反映されない** → ケバブケース（`roi-size`）で指定。`roiSize` のような camelCase は React の独自 prop 名規則と衝突する

## アーキテクチャ概要

```
┌──── browser main thread ────┐      ┌──── Worker thread ────┐
│ <qr-scanner> Custom Element │      │  Wasm                  │
│  - Shadow DOM (video+guide) │      │   ├─ pipeline          │
│  - useCamera (getUserMedia) │      │   │   - RGBA→Gray      │
│  - rVFC tick                │      │   │   - 3-frame NR     │
│  - useRoi (canvas crop)     │ ───► │   │   - CLAHE          │
│    drawImage / getImageData │      │   │   - Unsharp Mask   │
│  - postMessage(transfer)    │      │   ├─ binarizer (rotate)│
│                             │ ◄─── │   │   - Otsu / Adaptive│
│  - decoded → CustomEvent    │      │   │   - Sauvola        │
│  - debounce                 │      │   └─ quircs::Quirc     │
└─────────────────────────────┘      └────────────────────────┘
```

- **ゼロコピー寄り**: 入力 RGBA は Worker で `Uint8ClampedArray.set(...)` で Wasm メモリに 1 回コピー後、以降の前処理は in-place
- **メモリ拡張対策**: Wasm メモリは init 時に最大入力＋作業バッファを `Box::leak` で一括確保し、`memory.grow` を発生させない
- **バックプレッシャ**: Worker に未処理フレームが 2 件以上ある場合はメインスレッドが新フレームを送らずスキップ

## iPad 特有の注意点

- **2cm QR の物理限界**: iPad 内蔵カメラは固定焦点系で最短 ~10cm。これより近づけても合焦しません。`prefer-zoom` は iOS Safari の `MediaTrackCapabilities.zoom` が読み取れる端末でのみ効きます
- **暗所**: 高 ISO によるゴマ塩ノイズが乗るので、3 フレーム平均と CLAHE が効きます。読めない場合は `binarizer-strategy="sauvola"` 固定が有効なことがあります
- **HTTPS 必須**: `getUserMedia` は `https://` または `localhost` でしか呼べません
- **ガイド枠**: `--qr-guide-frame-size` で実機画面の物理 2cm に揃えると UX が安定します（iPad の論理 px ↔ 物理 mm の換算は端末依存）

## ライセンス

未設定。社内利用想定。
