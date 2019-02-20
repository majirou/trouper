let cron = require('node-cron');

// 定期的に本日のスクレイピングを行う
//cron.schedule('0 0 17 * * *', () => {
cron.schedule('40 36 3 * * *', () => {
  console.log("")
  console.log( "@".repeat(process.stdout.columns) )
  console.log("routine", new Date() );
  console.log( "@".repeat(process.stdout.columns) )
  const Routine = require("./application/routine.js")
  const r = new Routine()
  r.routineScrape()
});

// 定期的にクロール結果の通知をする
//cron.schedule('*/5 0 10 * * *', async () => {
cron.schedule('*/5 * * * * *', async () => {
    // doneがはいってて、notifiedがない場合
  const Routine = require("./application/routine.js")
  const r = new Routine()
  const result = await r.routineNotify()
});