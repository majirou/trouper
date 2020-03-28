
class ProgramController {
  constructor () {
    const MongoDbModel = require('../models/MongoDbModel.js')
    this.db = new MongoDbModel()
  }

  // register to mongodb
  async register (url, schedule, actions) {
    try {
      if (!this._validateUrl(url)) {
        throw new Error(`Validation Error Url: ${url}`)
      }
      if (!this._validateSchedule(schedule)) {
        throw new Error(`Validation Error Schedule: ${schedule}`)
      }
      if (!this._validateActions(actions)) {
        throw new Error(`Validation Error Actions: ${actions}`)
      }

      this.db.addProgram()
    } catch(e) {
      console.error(e);
    }
  }

  _validateUrl (url) {
  }

  _validateSchedule (schedule) {
  }

  _validateActions (actions) {
  }
}
module.exports = ProgramController
