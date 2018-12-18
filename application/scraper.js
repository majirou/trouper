class Scraper {

	constructor(){
        console.log("constructed");
        this.fs = require('fs');
        this.mkdirp = require( 'mkdirp' ) ;
        this.browser = null ;
    }

    createTemporaryDir(){
        // 実行した日時をディレクトリ名にして作成
        const dt = new Date();
        this.save_dir_name = dt.getFullYear()
                           + ("00" + (dt.getMonth()+1)).slice(-2)
                           + ("00" + dt.getDate() ).slice(-2)
                           + ("00" + dt.getHours() ).slice(-2)
                           + ("00" + dt.getMinutes() ).slice(-2)
                           + ("00" + dt.getSeconds() ).slice(-2)
                           ;
        console.log( this.save_dir_name ) ;
        this.save_path = "./public_html/data/tmp/" + this.save_dir_name ;

        this.fs.mkdir( this.save_path , function (err) {
            if( err ) { console.log( err ) } ;
        });
    }
    async closeBrowser(){

        console.log("---------------");
     /*    console.log("closeBrowser...");
        console.log( this.browser.process() ); */
        
        await this.browser.close();
        console.log("終了");
    }
    
	async scrape( url ){
        process.on('unhandledRejection', console.dir);
        // ref) https://qiita.com/syuilo/items/0800d7e44e93203c7285

        const pptr = require( 'puppeteer' ) ;

        this.createTemporaryDir();

        console.log( process.cwd() , "mkdir " + this.save_path ) ;

        this.browser = await pptr.launch( {
            args: [ '--lang=ja,en-US,en' 
                  , '--no-sandbox'
                  , '--disable-setuid-sandbox'
                  ] ,
           // headless: false
        } ) ;

        try{
            console.log("START");
            const page = await this.browser.newPage();

            // reponse イベントに〜〜〜〜〜あとでかく
            page.on( 'response' , async (res) => {
                const url = res.url(); // res.urlはどうやらフルパスらしい。
                let contentType = res.headers()[ "content-type" ]
                if( contentType && contentType.indexOf( ";" > 0 ) ){
                    // text/css; charset=utf8 のような書き方への対応
                    contentType = contentType.split(";")[0] ;
                }

                switch( contentType ){
                    case "image/png":
                    case "image/jpeg":
                    case "image/gif":
                    case "image/webp":
                    case "image/bmp":
                    case "image/svg+xml":
                    case "text/css":
                    case "font/woff2":
                    case "font/woff":
                    case "font/ttf":
                    case "font/opentype":
                    case "video/mp4":
                    case "application/font-woff2":
                        const dirs = url.split("/");
                        dirs.shift() ; // httpなどのプロトコル部分を外す
                        let filename = dirs.pop() ;
                        if( filename.indexOf("?") > 0 ){
                            filename = filename.split("?")[0] ;
                        }

                        const outputPath = dirs.join("/")
                                               // .replace( /\/\/+/g , "/" )
                                               .replace( /\:/g    , "_" ) // ポート部分をアンダースコアに
                                               .replace( /\./g    , "_" ) // ドット文字もアンダースコアに
                                               ;
                        const targetPath = ( this.save_path + "/" + outputPath + "/" ).replace( /\/\/+/g ,"/") ; 

                        const buffer = await res.buffer();

                        this.mkdirp( targetPath , (err) => {
                            if(err){
                                if ( err.code === "ENAMETOOLONG"){
                                }else{
                                    console.log("mkdirp: "+err) ;
                                }
                            }else{
                                let output = targetPath + filename ;
                                this.fs.writeFile( output , buffer , (err) => {
                                    // 書き出しに失敗した場合
                                    if(err){
                                        if( err.code === "EISDIR"){
                                            // すでにディレクトリをファイルとして書き込もうとしている？
                                            this.fs.writeFile( output + "/noname", buffer , (err) => {
                                                if(err){
                                                    console.log("エラーが発生しました。" , err) ; 
                                                }else{

                                                }
                                            } ) ;
                                        }else if ( err.code === "ENAMETOOLONG"){
                                            
                                        }else{
                                            console.log("エラーが発生しました。" , err) ; 
                                        }
                                    }
                                });
                            }
                        } ) ;
                        break;
                    case "application/json":
                    case "application/javascript":
                    case "application/x-javascript":
                    case "application/xml":
                    case "application/rss+xml":
                    case "text/html":
                    case "text/plain":
                    case "text/javascript":
                    case "undefined":
                        break;
                    default:
                        console.log( "> " , contentType , url ) ;
                        break;
                }
            } ) ;

            // 画面サイズ
            await page.setViewport( { width: 1024, height: 800 } ) ;
            // ページ移動
            await page.goto( url , {waitUntil: "networkidle0",timeout: 60000 } ) ;
            // ページタイトル取得
            console.log(await page.title());

            // スクリーンショット
            await page.screenshot({ path: this.save_path + '/screenshot.png', fullPage: true } ) ;

            
            var html = await page.evaluate( rebase =>{
                const html = document.getElementsByTagName('html')[0] ;

                // script タグを削除（理由：動的な部分は本スクレイピングでは無視する）
                const script = html.getElementsByTagName("script") ;
                // 削除なので逆から行う
                for( let i=(script.length-1) ; i >= 0 ; i-- ) {
                    script[i].parentNode.removeChild( script[i] ) ;
                }
                // base タグを削除（理由：ローカル保存先をベースにするため）
                const base = html.getElementsByTagName("base") ;
                // 削除なので逆から行う
                for( let i=(base.length-1) ; i >= 0 ; i-- ) {
                    base[i].parentNode.removeChild( base[i] ) ;
                }

                // img タグのsrcを絶対URIに変更して、ローカルに合わせる
                const img = html.getElementsByTagName("img") ;
                for( let i in img ) {
                    if( img[i].src ){
                        if( img[i].src.match( /^data\:/ ) ) {
                            // 何もしない
                        }else{
                            const dirs = img[i].src.split("/");
                            dirs.shift() ; // httpなどのプロトコル部分を外す
                            const filename = dirs.pop() ;
                            const outputPath = dirs.join("/")
                                                   .replace( /\:/g , "_" ) // ポート部分をアンダースコアに
                                                   .replace( /\./g , "_" ) // ドット文字もアンダースコアに
                                                   ;
                            img[i].src = ( "./" + outputPath + "/" + filename ).replace( /\/\/+/g , "/" ) ;
                        }
                        // srcset がある場合 -> 後で考える
                    }
                }

                // link タグの href を絶対URIに変更して、ローカルに合わせる
                const linkTag = html.getElementsByTagName("link") ;
                for( let i in linkTag ) {
                    if( linkTag[i].href ){
                        const dirs = linkTag[i].href.split("/");
                        dirs.shift() ; // httpなどのプロトコル部分を外す
                        const filename = dirs.pop() ;
                        const outputPath = dirs.join("/")
                                               .replace( /\:/g    , "_" ) // ポート部分をアンダースコアに
                                               .replace( /\./g    , "_" ) // ドット文字もアンダースコアに
                                               ;
                        linkTag[i].href = ( "./" + outputPath + "/" + filename).replace( /\/\/+/g , "/" ) ;
                    }
                }


                // a タグの href を絶対URIに変更して、ローカルに合わせる
                const aTag = html.getElementsByTagName("a") ;
                for( let i in aTag ) {
                    if( aTag[i].href ){
                        aTag[i].value = aTag[i].href ;
                        aTag[i].removeAttribute("href") ;
                        /* const dirs = aTag[i].href.split("/");
                        dirs.shift() ; // httpなどのプロトコル部分を外す
                        const filename = dirs.pop() ;
                        const outputPath = dirs.join("/")
                                               .replace( /\:/g    , "_" ) // ポート部分をアンダースコアに
                                               .replace( /\./g    , "_" ) // ドット文字もアンダースコアに
                                               ;
                        aTag[i].href = ( "./" + outputPath + "/" + filename).replace( /\/\/+/g , "/" ) ; */
                    }
                }

                // iframe タグのsrcを無効化
                const iframe = html.getElementsByTagName("iframe") ;
                for( let i=0;i<iframe.length;i++){
                    iframe[i].src = "" ; 
                }


                return html.innerHTML  ;
            } , this.save_path ) ; 

            await this.fs.writeFileSync( this.save_path+'/index.html', html); 
        }catch( err ) { 
            console.log( "error" , err);
        }finally{
            // 終了
            console.log("スクレイピング終了");
            // await browser.close();
        }
	}
}

module.exports = new Scraper();
