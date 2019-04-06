console.log("")
console.log( "@".repeat(process.stdout.columns) )
console.log("routine", new Date() );
console.log( "@".repeat(process.stdout.columns) )
const Routine = require("./application/routine.js")
const r = new Routine()
r.routineScrape()
