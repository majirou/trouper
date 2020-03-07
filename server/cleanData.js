const fs = require('fs');
const path = require('path');

const filePath = __dirname + "/data/temporary";
console.log(filePath);
fs.readdir(filePath , (err, files) => {
  try {
    if (err) throw err;
    files.forEach(f => {
      const p = `${filePath}/${f}`;
      console.log(f, p);
      fs.rmdirSync(p, {recursive: true} , e => {
        if (e) {
          console.error(e);
        } else{
          console.log("deleted");
        }
      });
    })
  } catch(e) {
    if (e.code === 'ENOENT') {
      const p = path.parse([filePath,e.path].join("/"));
      console.log("No such file or directory", p);
    } else {
      console.error(e);
    }
  }
})

// fs.rmdirSync(path, {recursive: true} , err => {
//   if (err != null) {
//     // ENOENT
//     // ENOTDIR
//     console.log(err);
//     return 0;
//   }
// })