
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
    return /^(https?)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/.test(url)
  }

  _validateSchedule (schedule) {
    return (
      schedule != null &&
      schedule.name != null &&
      schedule.date != null &&
      this._validateDate(schedule.date) &&
      schedule.interval > 0 &&
      schedule.interval < 3 &&
      schedule.notification != null &&
      Array.isArray(schedule.notification) &&
      schedule.mail != null
    )
  }

  _validateDate(date){
    const arr = date.split("-")
    return (
      (arr.length === 3) &&
      (arr[0] >= 2020 && arr[0] <= 2099) &&
      (arr[1] >= 1 && arr[1] <= 12) &&
      (arr[2] >= 1 && arr[2] <= 31)
    )
  }

  _validateActions (actions) {
  }
}
module.exports = ProgramController
