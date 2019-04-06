# Majirou's Trouper

* 本プログラムは、puppeteerをベースにスクレイピング対象ページ、およびページ内の要素をユーザーフレンドリーに選択することを目的とするものです。
* trouperのネーミングは、「人形（puppeteer）を操る劇団員」程度のイメージです。

## 実行

### サーバー起動

```
npm run serve
```

### 定期スクレイピング実行

```
npm run scrape
```

### 通知メール

```
npm run notify
```

### 不要シナリオ削除

```
npm run sweep
```

## 構成

```
/
├─application // サーバーアプリケーション
├─public_html // フロント
│ ├─cli
│ └─data
│   ├─tmp // 一時クロールの保管場所
│   ├─common.js // iframe内アクティブ要素などの共通CSS
│   └─common.js // iframe内クリックイベントなどの共通JS
└─vue-cli
```

### /application

* メインとなるサーバー処理系

### /public_html

* スクレイプ先登録画面などフロント周り
* data配下にはスクレイプ結果を保存

### /vue-cli

* vue-cliにて生成したVueコンポーネント

## ミドルウェア

### Node.js

* 主なプログラムは、`Node.js` 上でのJavaScriptで記述しています。

### HTTPサーバー

* express を使います。

```
node ./server.js
```

### データベース

* mongodb を使います。
* データベース名は trouper_db となります。

#### scenario テーブルスキーマ

|column|name|description|example|
|---|---|---|---|
|_id|ID|MongoDBが自動採番するキー|ObjectId("5c45e19420499d142fb5c687")|
|url|URL|スクレイピングする対象URL|https://jp.vuejs.org/index.html|
|name|シナリオ名称|任意のシナリオの名前|テストスクレイピングサイト|
|date|予定日|次回定期的なスクレイピングをする日付|ISODate("2019-02-27T15:00:00Z")|
|notify|通知フラグ|どの差分を検知した際に通知するかのフラグ<br><ul><li>1: 全HTML差分</li><li>2: 部分HTML差分</li><li>4: 画像差分</li></ul>|[1,2,4]|
|mail|メール宛先|通知連絡をするメールアドレス|test@example.com|
|interval|実行間隔|定期実行する間隔を週次（= 1）か月次（= 2）で管理するフラグ|1|
|actions|アクション|部分一致の対象を配列で管理する|[{"tag" : "p","id" : "","name" : "","className" : "","index" : "0"}]|
|execute|実行中フラグ|実行中か否か（true or false)|false|

#### schedule テーブルスキーマ

|column|name|description|example|
|---|---|---|---|
|_id|ID|MongoDBが自動採番するキー|ObjectId("5c6c37784df8b2359c82bba8")|
|created|---|作成日時|ISODate("2019-02-19T17:06:08.228Z")|
|scheduled|---|スクレイピング予定日時|ISODate("2019-02-19T17:06:00.962Z")|
|executed|---|スクレイピング実施日時|ISODate("2019-02-19T17:06:00.970Z")|
|done|---|スクレイピング完了日時|ISODate("2019-02-19T17:06:08.228Z")|
|notified|---|スクレイピング結果通知日時|ISODate("2019-02-19T17:06:08.228Z")|
|scenarioId|---|シナリオID|ObjectId("5c6c37496c313e350d73178a")|
|saveDir|---|保存先ディレクトリ名|20190220020602|

### 定期処理

#### cron.js

#### pm2

## バックエンド

主にスクレイピングとその結果の差分生成を行います。

### スクレイピング

`Puppeteer` を使用します。
なお、Pappeteerで取得したページHTMLに対してevaluate関数などで、img.srcなどをローカル保存用パスに修正すると
読み込んでいるページ上での改変になるため、不要なリクエストが発生するため Cheerio で保存したHTMLに対して行います。

### HTML部分抽出

Cheerio を使用します。

### 画像差分

Image Magick を使用します。

## フロントエンド

vue.js にて開発

### axios

各種APIでのデータ取得や処理に使用します。

### diff2html

スクレイピングしたHTMLの差分を表示するため使用します。

### tabulator

シナリオ一覧の表示に使用します。

### bootstrap

サイトデザインのCSSに使用します。

### fontawesome

各種アイコンフォントに使用します。


## インストール

### ImageMagick

```
# yum install ImageMagick
```

* ver.7系を入れないと、画像のサイズが異なる場合にエラーとなります(要remiレポジトリ有効化)

### MongoDB

```
yum -y install mongodb-org
```
