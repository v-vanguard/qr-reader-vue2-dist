# @v-vanguard/qr-reader-vue2

iPad の暗所環境で 2cm 角の極小 QR コード（V4–V6 / JSON 想定）を連続スキャンするための Vue 2 コンポーネント。

- **解析エンジン**: Rust + WebAssembly（[`quircs`](https://crates.io/crates/quircs) = C 版 quirc の pure Rust port）
- **実行モデル**: Web Worker でデコード／前処理を実行、UI スレッドはフリーズしない
- **前処理パイプライン**: 3 フレーム平均ノイズ除去 → CLAHE → アンシャープマスク → 動的二値化（Otsu / Adaptive Mean / Sauvola をフレームごとにローテーション）
- **配信形態**: Worker と Wasm を 1 ファイルにインライン化済みの ESM/UMD バンドル
- **配布形態**: ソース private repo の `dist/` を **public repo (`qr-reader-vue2-dist`) に同期**し、利用者は **registry / 認証なしで Git URL から `npm install`** する方式

> ⚠️ Vue 2 は 2023-12 に EOL を迎えています。本パッケージは既存 Vue 2 プロジェクトへの組み込みを前提としています。Vue 3 へ移行する場合は composables の中身がほぼそのまま使えます。

---

# 利用者向け

このパッケージを依存に追加して使う人向けのセクション。

## 前提

- `git` がインストールされていること

それだけです。配布 repo は public なので、PAT / SSH 鍵 / `~/.npmrc` のセットアップは **一切不要**です。Docker / CI など認証情報を持たない環境からもそのまま install できます。

## インストール

タグを `#vX.Y.Z` で必ず固定してください（`#main` 直 install はバージョン破壊リスク）。

```bash
npm install git+https://github.com/v-vanguard/qr-reader-vue2-dist.git#v0.1.0
```

`package.json` には次のように記録されます:

```json
{
  "dependencies": {
    "@v-vanguard/qr-reader-vue2": "git+https://github.com/v-vanguard/qr-reader-vue2-dist.git#v0.1.0"
  }
}
```

semver 範囲で追従したい場合（タグが semver になっている前提）:

```bash
npm install "git+https://github.com/v-vanguard/qr-reader-vue2-dist.git#semver:^0.1.0"
```

### 更新

利用したいバージョンのタグへ書き換えて `npm install` を再実行するだけ。

```bash
npm install git+https://github.com/v-vanguard/qr-reader-vue2-dist.git#v0.2.0
```

## CI / Docker で install する場合

追加設定 **不要**。`git` が入っているイメージなら `npm install` がそのまま通ります。

```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm ci
```

## 動作確認

```bash
node -e "const m = require('@v-vanguard/qr-reader-vue2'); console.log(Object.keys(m))"
# → [ 'DecoderClient', 'GuideOverlay', 'QrScanner',
#     'createPayloadDebouncer', 'createRoiExtractor',
#     'useCamera', 'useDecoder' ]
```

7 つの export が出れば成功。型補完が効かない場合は `tsconfig.json` の `moduleResolution` を `Bundler` または `Node16`/`NodeNext` に設定してください。

## 使い方

```vue
<template>
  <div class="screen">
    <QrScanner
      :roi-size="400"
      :debounce-ms="2000"
      :show-stats="false"
      binarizer-strategy="auto"
      @decoded="onDecoded"
      @error="onError"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { QrScanner } from '@v-vanguard/qr-reader-vue2';
import '@v-vanguard/qr-reader-vue2/style.css';
import type { DecoderStats, ScannerError } from '@v-vanguard/qr-reader-vue2';

export default defineComponent({
  components: { QrScanner },
  setup() {
    return {
      onDecoded(payload: string, _stats: DecoderStats) {
        console.log('decoded:', JSON.parse(payload));
      },
      onError(err: ScannerError) {
        console.error(err.code, err.message);
      },
    };
  },
});
</script>
```

### Props

| 名前 | 型 | 既定値 | 説明 |
|---|---|---|---|
| `roiSize` | `number` | `400` | ROI 中央クロップの一辺サイズ（px） |
| `debounceMs` | `number` | `2000` | 同一 payload を抑止する時間 |
| `autoStart` | `boolean` | `true` | マウント時にカメラを起動するか |
| `videoConstraints` | `MediaTrackConstraints` | `{}` | `getUserMedia` への追加制約（マージ） |
| `binarizerStrategy` | `'auto' \| 'otsu' \| 'adaptive_mean' \| 'sauvola'` | `'auto'` | `auto` でフレームごとにローテーション |
| `showStats` | `boolean` | `false` | デバッグ用統計の表示 |
| `preferZoom` | `number` | `0` | best-effort のデジタルズーム要求（iOS Safari では効かない端末が多い） |

### Events

| 名前 | ペイロード | 説明 |
|---|---|---|
| `decoded` | `(payload: string, stats: DecoderStats)` | デコード成功（debounce 後） |
| `error` | `(err: ScannerError)` | カメラ拒否や Wasm 初期化失敗 |
| `status` | `(status: ScannerStatus)` | 状態変化（`idle` / `running` / `error` 等） |

### Slots

| 名前 | スコープ | 説明 |
|---|---|---|
| `guide` | `{ status, flashing }` | 既定のガイド枠を差し替え |
| `overlay` | `{ status, stats, error }` | 任意の情報表示を被せる |

## Nuxt 2 で使う

`getUserMedia` / `WebAssembly` / `Worker` / `Blob` は SSR で破綻するので **必ず `<client-only>` で囲み、import も dynamic にする** 必要があります。SSR 時に import 評価されるだけで Worker の Blob URL 生成が走り、Nuxt のビルドが落ちます。

### `pages/scanner.vue`

```vue
<template>
  <client-only>
    <qr-scanner
      :roi-size="640"
      :debounce-ms="2000"
      binarizer-strategy="auto"
      @decoded="onDecoded"
      @error="onError"
    />
  </client-only>
</template>

<script>
export default {
  components: {
    QrScanner: () =>
      import('@v-vanguard/qr-reader-vue2').then((m) => m.QrScanner),
  },
  mounted() {
    // CSS も client 側でロード（SSR では評価されない）
    import('@v-vanguard/qr-reader-vue2/style.css');
  },
  methods: {
    onDecoded(payload, stats) {
      try {
        const obj = JSON.parse(payload);
        // payload は JSON 想定
        this.$emit('result', obj);
      } catch {
        // 文字列のまま扱う
      }
    },
    onError(err) {
      this.$nuxt.$emit('toast', `${err.code}: ${err.message}`);
    },
  },
};
</script>
```

### `nuxt.config.js` に追加すること

```js
export default {
  // SSR を有効のまま使う場合、ライブラリは transpile 対象に入れる
  build: {
    transpile: ['@v-vanguard/qr-reader-vue2'],
  },
  // dev で iPad 実機から HTTPS 接続したい場合
  server: {
    https: {
      key: fs.readFileSync('./certs/dev.key'),
      cert: fs.readFileSync('./certs/dev.crt'),
    },
    host: '0.0.0.0',
  },
};
```

### よくあるハマり

- **`window is not defined` で SSR が落ちる** → 必ず `<client-only>` で囲み、コンポーネントを dynamic import するか `process.client` ガードする
- **`Worker is not defined` で SSR が落ちる** → 同上。グローバル import（`import { QrScanner } from '...'` を `<script>` 直下で）は使わない
- **iPad で起動しない** → HTTPS 必須。Nuxt dev の `--https` か mkcert で自己署名証明書を発行
- **本番ビルドで Worker chunk が見当たらない** → このライブラリは Worker と Wasm を 1 ファイルに inline 済みで `dist/qr-reader.mjs` だけで完結する。consumer の bundler は何もしなくて良い

> Nuxt 3 (Vue 3 系) では本パッケージの SFC コンポーネントは使えません。`DecoderClient` などの framework 非依存コアだけ拝借して Vue 3 用 SFC を自作する必要があります（README 末尾の「低レベル API」を参照）。

## 低レベル API（フレームワーク非依存コア）

`<QrScanner>` の中で動いているのは Vue 2 の薄いラッパだけで、解析エンジン本体（`DecoderClient` / Worker / Wasm / `createRoiExtractor` / `createPayloadDebouncer`）は **どのフレームワークからも使えます**。Vue 3 / Nuxt 3 / React / Svelte / vanilla JS で組み込むときはこちらを直接使ってください。

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

Vue 2 の `useCamera` / `useDecoder` composable は `vue` の `ref` に依存するため、Vue 2 プロジェクトからのみ使えます。

## CSS のカスタマイズ

`qr-scanner.css` を読み込んだ上で CSS 変数を上書きできます。

```css
.qr-scanner {
  --qr-guide-color: #f97316;
  --qr-guide-flash-color: #84cc16;
  --qr-guide-frame-size: min(50vmin, 320px);
  --qr-guide-corner-thickness: 6px;
}
```

---

# 開発者向け

このパッケージのコードを編集・配布する人向けのセクション。

## 必要環境

- Rust（stable）+ `wasm32-unknown-unknown` ターゲット
- Node.js 20+
- mkcert（iPad 実機検証用、HTTPS 自己署名）

```bash
rustup target add wasm32-unknown-unknown
brew install mkcert nss
mkcert -install
```

## セットアップ

```bash
git clone git@github.com:v-vanguard/demo-qr-reader.git
cd demo-qr-reader
npm install
```

スクリプト一覧:

```bash
npm run wasm:build       # wasm-pack で Rust → Wasm
npm run build            # Vite ライブラリビルド (ESM + UMD + d.ts)
npm run build:all        # wasm:build → build
npm run wasm:check       # cargo check
npm run wasm:test        # cargo test
```

## 開発フロー（playground で動作確認）

playground は本パッケージを `file:..` で参照する Vue 2 アプリです。

```bash
npm run build:all
npm install --prefix playground
npm --prefix playground run dev
# → http://localhost:5173/
```

ライブラリ側を書き換えたら必ず:

```bash
npm run build:all                # dist/ を更新
npm install --prefix playground  # node_modules 内の参照を貼り直し
```

## iPad 実機検証

`getUserMedia` は HTTPS でしか動きません。mkcert で自己署名証明書を発行して使います。

```bash
bash playground/scripts/setup-certs.sh
npm --prefix playground run dev
# → https://<LAN-IP>:5173/  (証明書信頼済みの iPad から)
```

iPad 側の信頼設定:
1. `mkcert -CAROOT` で出てきたディレクトリの `rootCA.pem` を AirDrop で iPad へ送る
2. 設定 > 一般 > VPN とデバイス管理 > プロファイルからインストール
3. 設定 > 一般 > 情報 > 証明書信頼設定 → 完全信頼を ON

Docker で本番風に配信する場合は `playground/docker/SETUP.md` を参照（一部設定ファイルは手動作成）。

## リリース

`npm publish` は使いません。**ビルド済み `dist/` を public 配布 repo (`qr-reader-vue2-dist`) に同期してタグを打つ** 流れです。

private repo 側の `npm version` 実行時に `version` lifecycle script で `npm run build:all && git add dist` を回す設定にしてあるので、開発者は次の 4 ステップで完了します。

```bash
# 1. ソース変更を通常通りコミット
git add src wasm
git commit -m "feat: ..."

# 2. バージョン bump（ここで build:all → dist add → 自動コミット → tag が走る）
npm version patch   # 0.1.0 → 0.1.1（バグ修正）
# npm version minor # 0.1.x → 0.2.0（互換性のある追加）
# npm version major # 0.x.x → 1.0.0（破壊的変更）

# 3. private repo を push
git push --follow-tags

# 4. public 配布 repo に同期（dist + package.json + README.md + tag を push）
npm run release:public
```

`scripts/release-public.sh` が `qr-reader-vue2-dist` repo を一時 clone → 中身を入れ替えて commit + tag → push します。配布 repo の URL を変えたい場合は `PUBLIC_REMOTE` 環境変数で上書きできます。

利用者は `npm install git+https://github.com/v-vanguard/qr-reader-vue2-dist.git#v0.1.1` でこのタグを取得できます。

### 公開 repo の初期セットアップ（初回のみ）

1. GitHub で **`v-vanguard/qr-reader-vue2-dist`** を **public** で新規作成（README なしの空リポでよい）
2. リリース担当者の git アカウントに push 権限を付与（同 org のメンバーなら通常自動で付く）
3. 1 度目の `npm run release:public` が初期コミットとして走る

## 注意事項

- **ビルド成果物 (`dist/`) は private repo にもコミットする** 運用です。`scripts/release-public.sh` が現バージョンの `dist/` を読むので必須。`.gitattributes` で `linguist-generated` を付けてあるので GitHub UI 上では diff が折り畳まれます
- **必ずタグを打つ**。`#main` 直 install は破壊的変更を被るため利用者には常にタグ pin を推奨
- **`.npmrc` をコミットしない**。`.gitignore` で除外済みですが、ローカルに `.npmrc` を作る必要も基本ありません
- 配布 repo (`qr-reader-vue2-dist`) は **public** にすること（private にすると認証不要のメリットが消える）

---

# アーキテクチャ概要

```
┌─────────── main thread ───────────┐      ┌────── Worker thread ──────┐
│ <video> + <QrScanner>             │      │  Wasm                      │
│  - useCamera (getUserMedia)       │      │   ├─ pipeline              │
│  - rVFC tick                      │      │   │   - RGBA→Gray          │
│  - useRoi (canvas 中央クロップ)    │ ───► │   │   - 3-frame temporal NR│
│    drawImage / getImageData       │      │   │   - CLAHE              │
│  - Uint8ClampedArray pool         │      │   │   - Unsharp Mask       │
│  - postMessage(transfer)          │      │   ├─ binarizer (rotate)    │
│                                   │ ◄─── │   │   - Otsu / Adaptive    │
│  - decoded → emit                 │      │   │   - Sauvola            │
│  - debounce                       │      │   └─ quircs::Quirc         │
└───────────────────────────────────┘      └────────────────────────────┘
```

- **ゼロコピー寄り**: 入力 RGBA は Worker で `Uint8ClampedArray.set(...)` で Wasm メモリに 1 回コピー後、以降の前処理は in-place
- **メモリ拡張対策**: Wasm メモリは init 時に最大入力＋作業バッファを `Box::leak` で一括確保し、`memory.grow` を発生させない
- **バックプレッシャ**: Worker に未処理フレームが 2 件以上ある場合はメインスレッドが新フレームを送らずスキップ

# iPad 特有の注意点

- **2cm QR の物理限界**: iPad 内蔵カメラは固定焦点系で最短 ~10cm。これより近づけても合焦しません。`preferZoom` は iOS Safari の `MediaTrackCapabilities.zoom` が読み取れる端末でのみ効きます。実用的には ROI 中央クロップ（高解像度ソース＋デジタル拡大）でカバー
- **暗所**: 高 ISO によるゴマ塩ノイズが乗るので、3 フレーム平均と CLAHE が効きます。読めない場合は `binarizerStrategy="sauvola"` 固定が有効なことがあります
- **HTTPS 必須**: `getUserMedia` は `https://` または `localhost` でしか呼べません
- **ガイド枠**: `--qr-guide-frame-size` で実機画面の物理 2cm に揃えると UX が安定します（iPad の論理 px ↔ 物理 mm の換算は端末依存）

# ライセンス

未設定。社内利用想定。
