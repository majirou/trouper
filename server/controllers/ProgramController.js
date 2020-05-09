
class ProgramController {
  constructor () {
    const MongoDbModel = require('../models/MongoDbModel.js')
    this.db = new MongoDbModel()
  }

  // register to mongodb
  async register (url, schedule, actions) {
    let result ;
    try {
      if (!this._validateUrl(url)) {
        throw new Error(`Validation Error Url: ${url}`)
      }
      if (!this._validateSchedule(schedule)) {
        throw new Error('Validation Error Schedule')
      }
      if (!this._validateActions(actions)) {
        throw new Error(`Validation Error Actions: ${actions}`)
      }

      const registeredId = await this.db.addProgram({url,schedule,actions})
      result = true
    } catch(e) {
      console.error(e)
      result = false
    }
    return result
  }

  _validateUrl (url) {
  }

  _validateSchedule (schedule) {
  }

  _validateActions (actions) {
  }
}
module.exports = ProgramController
