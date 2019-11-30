# Majirou's Trouper Ver.2.0
　
* 本プログラムは、puppeteerをベースにスクレイピング対象ページ、およびページ内の要素をユーザーフレンドリーに選択することを目的とするものです。
* trouperのネーミングは、「人形（puppeteer）を操る劇団員」程度のイメージです。
* ver.2よりNuxt.jsを採用します。

# インストール

```
npm install
npm run build
```

## ImageMagick

```
# yum install ImageMagick
```

* ver.7系を入れないと、画像のサイズが異なる場合にエラーとなります(要remiレポジトリ有効化)

## MongoDB

```
yum -y install mongodb-org
```