
class ProgramController {
  constructor () {
    const MongoDbModel = require('../models/MongoDbModel.js')
    this.db = new MongoDbModel()
  }

  // register to mongodb
  async register (params) {
    let result ;
    try {
      this.db.setRegisterParameters(params)

      if (!this.db.validRegisterParameters()) {
        throw new Error('Validation is failed.')
      }

      const registeredId = await this.db.addProgram()
      console.log("registeredId:" + registeredId)
      result = true
    } catch(e) {
      result = false
    }
    return result
  }

  async search (params) {
    let result ;
    try {
      this.db.setSearchParameters(params)

      if (!this.db.validSearchParameters()) {
        throw new Error('Search Parameter Validation is failed.')
      }

      result = await this.db.search()
    } catch(e) {
      result = false
    }
    return result
  }
}
module.exports = ProgramController
