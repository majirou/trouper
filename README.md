# Majirou's Trouper

本プログラムは、puppeteerをベースにスクレイピング対象ページ、およびページ内の要素をユーザーフレンドリーに選択することを目的とするものです。

## 構成

```
/
├─application // サーバーアプリケーション
├─public_html // フロント
│ ├─cli
│ └─data
│   ├─tmp // 一時クロールの保管場所
│   └─common.js // iframe内クリックイベントなどの共通JS
└─vue-cli
```

### /application

* メインとなるサーバー処理系

### /public_html

* スクレイプ先登録画面などフロント周り
* data配下にはスクレイプ結果を保存

### /vue-cli

* vue-cliにて生成した

## ミドルウェア

### HTTPサーバー

express を使います。

```
node ./server.js
```

#### listen port



### データベース

mongodb を使います。

## インストール