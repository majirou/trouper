<template lang="pug">
  div.container-fluid.px-4
    h1 Majirou's Trouper
    p 定期的なクローリングと部分的なスクレイピングをユーザーフレンドリーに選択・抽出を目的とした非エンジニア向け情報収集ツールです。
    p 本アプリケーションは、Vue.js をベースにしたSPAサイトです。

    h2 構成
    div
      pre.command
        | /
        | ├─application // サーバーアプリケーション
        | ├─public_html // フロント
        | │ ├─cli
        | │ └─data
        | │   ├─tmp // 一時クロールの保管場所
        | │   └─common.js // iframe内クリックイベントなどの共通JS
        | └─vue-cli
    h3 /application
    div
      p メインとなるサーバーサイド処理系JS
    h3 /public_html
    div
      p スクレイプ先登録画面などフロント周り
      p data配下にはスクレイプ結果を保存
    h3 /vue-cli
    div
      p vue-cliにて生成したVueコンポーネント

    h2 ミドルウェア
    h3 HTTPサーバー
    div
      p express を使用します。
      pre.command
        | node ./server.js
    h3 データベース
    div
      p mongodb を使用します。
      p データベース名は scraper_db となります。
    h4 scenario テーブルスキーマ
    div
      table.table
        tr
          th column
          th name
          th description
          th example
        tr
          td _id
          td ID
          td MongoDBが自動採番するキー
          td ObjectId("5c45e19420499d142fb5c687")
        tr
          td url
          td URL
          td スクレイピングする対象URL
          td https://jp.vuejs.org/index.html
        tr
          td name
          td シナリオ名称
          td 任意のシナリオの名前
          td テストスクレイピングサイト
    h4 schedule テーブルスキーマ
    div
      table.table
        tr
          th column
          th name
          th description
          th example
    h3 スクレイピング
    div
      p Puppeteer を使用します。
      p なお、Pappeteerで取得したページHTMLに対してevaluate関数などで、img.srcなどをローカル保存用パスに修正すると
      | 読み込んでいるページ上での改変になるため、不要なリクエストが発生するため Cheerio で保存したHTMLに対して行います。
    h3 HTML部分抽出
    div
      p Cheerio を使用します。
    h3 画像差分
    div
      p Image Magick を使用します。

    h2 フロントエンド
    h3 vue.js
    div
      p SPAを実現しています。
    h3 axios
    div
      p 各種APIでのデータ取得や処理に使用します。
    h3 diff2html
    div
      p スクレイピングしたHTMLの差分を表示するため使用します。
    h3 tabulator
    div
      p シナリオ一覧の表示に使用します。
    h3 bootstrap
    div
      p サイトデザインのCSSに使用します。
    h3 fontawesome
    div
      p 各種アイコンフォントに使用します。
    h2 インストール
    div
      ul
        li mongodb

    h3 clone repository
    div
      pre.command
        | # git clone &lt;majirou's git url&gt;
      pre.command
        | # npm install
    h3 setup mongodb
</template>

<style lang="scss" scoped>
.container-fluid {
  overflow-y: auto !important;
  height: 90vh;
}

$base-color: #4fb87d;
h1,h2,h3,h4,h5,h6{
  color: $base-color;
}

$base-margin: 1rem;
h1{
  $marginLeft: 0;
  border-bottom: 6px double $base-color;
  & + div{
    margin-left: $base-margin * 0;
  }
}
h2{
  border-bottom: 3px solid $base-color;
  margin-top: $base-margin;
  margin-left: $base-margin * 1;
  & + div{
    margin-left: $base-margin * 1;
  }
}
h3{
  border-bottom: 1px solid $base-color;
  margin-top: $base-margin;
  margin-left: $base-margin * 2;
  & + div{
    margin-left: $base-margin * 2;
  }
}
h4{
  margin-left: $base-margin * 3;
  margin-top: $base-margin;
  & + div{
    margin-left: $base-margin * 3;
  }
}

.command{
  background-color: #000;
  color: #FFF;
  padding:.5em .75em;
  border-radius: 3px;
}
</style>
