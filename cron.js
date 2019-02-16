let cron = require('node-cron');

// 定期的に本日のスクレイピングを行う
cron.schedule('*/5 * * * * *', () => {
//  console.log("routine");
//  const Routine = require("./application/routine.js")
//  const r = new Routine()
//  r.routineScrape()
});

// 定期的にクロール結果の通知をする
cron.schedule('*/10 * * * * *', async () => {
  // doneがはいってて、notifiedがない場合
  const Routine = require("./application/routine.js")
  const r = new Routine()
  const result = await r.routineNotify()
});