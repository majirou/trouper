class Differ {

	constructor(){
        // console.log("differ constructed")
        this.mongo = require( "mongodb" ).MongoClient
        this.url   = 'mongodb://localhost:27017/scraper_db'
        this.param = {}
        this.errors = []

        this.fs = require('fs')
        this.colors = require('colors')
        this.path = require('path')
        
        process.on('unhandledRejection', console.dir);
    }

    async diffFull(beforePath, afterPath, outputPath){
        const _before = this.path.resolve( beforePath )
        const _after  = this.path.resolve( afterPath )
        const _output = this.path.resolve( outputPath )
        
        const execDiff = async (before, after, output) => {
            const oldStr = this.fs.readFileSync( before ).toString()
            const newStr = this.fs.readFileSync( after ).toString()
            const diff = require('diff')
            const unifiedDiff = await diff.createTwoFilesPatch( 
                beforePath,
                afterPath,
                oldStr,
                newStr,
                "OLD", 
                "NEW"
                );
            this.fs.writeFile( output, unifiedDiff , err => {
                if( err ) {
                    console.error(err)
                } else {
                    console.log( `DIFF FILE: ${output} is outputed`.bgGreen)
                }
            } )
        }

        if( ! await this.checkExist(_before) ){
            console.error( `BEFORE: ${_before} is not exist`)
            return 0
        }
        if( ! await this.checkExist(_after) ){
            console.error( `AFTER: ${_after} is not exist`)
            return 0
        }

        await execDiff(_before, _after,_output).then( res => {
            console.log("execDiff then" , res)
        })
    }
    // dffr.diffPart()
    async diffImage(beforePath, afterPath, outputPath){

        const _before = this.path.resolve( beforePath )
        const _after  = this.path.resolve( afterPath )
        const _output = this.path.resolve( outputPath )

        const execDiff = async (before, after, output) => {
            const gm = require('gm').subClass({imageMagick: true});
            const options = {
                file: output,
                tolerance: 0.02
            }
            gm().compare(before, after, options, (err, isEqual, equality, raw, path1, path2) => {
                if (err) {
                    console.error(err);
                    return 0;
                }
                // if the images were considered equal, `isEqual` will be true, otherwise, false.
                console.log('The images were equal: %s', isEqual);
                // to see the total equality returned by graphicsmagick we can inspect the `equality` argument.
                console.log('Actual equality: %d', equality);
                console.log('raw', raw)
                
                // inspect the raw output
              })
        }

        if( ! await this.checkExist(_before) ){
            console.error( `BEFORE: ${_before} is not exist`)
            return 0
        }
        if( ! await this.checkExist(_after) ){
            console.error( `AFTER: ${_after} is not exist`)
            return 0
        }
        await execDiff(_before, _after, _output)
    }

    async getDiffFile(id, before, after){
        const filepath = this.path.resolve(`./public_html/data/scenario/${id}/${after}/diff_${before}.txt`)
        const data = this.fs.readFileSync( filepath )
        return data.toString()
    }

    async checkExist (path){
        var result = null
        try {
            this.fs.accessSync(path, this.fs.constants.R_OK);
            result = true
        } catch (err) {
            result = false 
            console.error('no access!');
        }
        return result
    }
}

module.exports = Differ;
