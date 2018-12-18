'use strict';
const express = require('express');
const app = express();

app.use(express.static('./public_html/'));
app.listen( 8001 , () => {
  console.log('Express Server listened 8001');
} ) ;

app.get( '/scrape' , function( req, res ) {
  // URLパラメタが空でなければ画面に表示
  let url = null ;
  if ( req.query.url ) {
    url = req.query.url ;
    var s = require( './application/scraper' );
    ( async () => {
        await s.scrape( req.query.url );
        await s.closeBrowser();
        res.send( { url: url , result: s.save_dir_name } ) ;
    } )();
  }
} )

app.post( '/scenario' , function( req, res ) {
    console.log( req.query ) ;

    var s = require( './application/scenario' ) ;
    s.setParameter( req.query ) ;

    if( s.validateParameter() ){
        res.send( "end" ) ;
    }else{
        res.send( "failed end" ) ;
    }
} ) ;