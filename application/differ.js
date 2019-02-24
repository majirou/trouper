class Differ {
    constructor () {
      // console.log("differ constructed")
      this.mongo = require('mongodb').MongoClient
      this.param = {}
      this.errors = []

      this.fs = require('fs')
      this.colors = require('colors')
      this.path = require('path')

      process.on('unhandledRejection', console.dir)
    }

    async diffFull (beforePath, afterPath, outputPath) {
      const _before = this.path.resolve(beforePath)
      const _after = this.path.resolve(afterPath)
      const _output = this.path.resolve(outputPath)

      const execDiff = async (before, after, output) => {
        const oldStr = await this.fs.readFileSync(before).toString()
        const newStr = await this.fs.readFileSync(after).toString()
        const diff = require('diff')
        const unifiedDiff = await diff.createTwoFilesPatch(
          beforePath,
          afterPath,
          oldStr,
          newStr,
          'OLD',
          'NEW'
        )
        await this.fs.writeFile(output, unifiedDiff, async err => {
          if (err) {
            console.error(err)
          } else {
            console.log(`DIFF FILE: ${output} is outputed`.bgGreen)
          }
        })
      }

      if (!await this.checkExist(_before)) {
        console.error(`BEFORE: ${_before} is not exist`)
        return 0
      }
      if (!await this.checkExist(_after)) {
        console.error(`AFTER: ${_after} is not exist`)
        return 0
      }

      await execDiff(_before, _after, _output)
    }
    // dffr.diffPart()
    async diffImage (beforePath, afterPath, outputPath) {
      const _before = this.path.resolve(beforePath)
      const _after = this.path.resolve(afterPath)
      const _output = this.path.resolve(outputPath)

      const execDiff = async (before, after, output) => {
        const gm = require('gm').subClass({ imageMagick: true })
        const options = {
          file: output,
          tolerance: 0.02
        }
        await gm().compare(before, after, options, async (err, isEqual, equality, raw, path1, path2) => {
          if (err) {
            console.error(err)
            return 0
          }

          const diffText = isEqual + '\n' + // isEqual
                           equality + '\n' + // Actual equality:
                           raw // raw

          // output equal info to txt
          this.fs.writeFile(`${output}.txt`, diffText, async err => {
            if (err) {
              console.error(err)
            } else {
              console.log(`DIFF INFO FILE: ${output}.txt is outputed`.bgGreen)
            }
          })

          return 1
        })
      }

      if (!await this.checkExist(_before)) {
        console.error(`BEFORE: ${_before} is not exist`)
        return 0
      }
      if (!await this.checkExist(_after)) {
        console.error(`AFTER: ${_after} is not exist`)
        return 0
      }
      await execDiff(_before, _after, _output)
      return 1
    }

    async getDiffFile (id, before, after, type) {
      // console.log("getDiffFile", type, typeof type , ( type === 1 ) )
      const filename = ( parseInt(type) === 1 ) ? `diff_${before}.txt` : `diff_parts_${before}.txt`
      const filepath = this.path.resolve(`./public_html/data/scenario/${id}/${after}/${filename}`)
      const data = this.fs.readFileSync(filepath)
      return data.toString()
    }

    async checkExist (path) {
      var result = null
      try {
        this.fs.accessSync(path, this.fs.constants.R_OK)
        result = true
      } catch (err) {
        result = false
        console.error('no access!')
      }
      return result
    }
  }

  module.exports = Differ
