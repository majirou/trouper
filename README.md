# Majirou's Trouper

本プログラムは、puppeteerをベースにスクレイピング対象ページ、およびページ内の要素をユーザーフレンドリーに選択することを目的とするものです。

## 構成

### /application 

* メインとなる処理系

### /public_html 

* スクレイプ先登録画面などフロント周り
* data配下にはスクレイプ結果を保存

### HTTPサーバー

express を使います。

### データベース

mongodb を使います。
