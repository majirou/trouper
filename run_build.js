console.log('Starting directory: ' + process.cwd())
try {
  process.chdir('./vue-cli')

  const exec = require('child_process').exec
  exec('npm run build', (err, stdout, stderr) => {
    if (err) {
        console.error(err)
    } else {
        console.log(stdout)

        process.chdir('../public_html')
        const fs = require('fs')
        fs.unlink('./cli', (err) => {
            if (err) console.error(err);
            fs.symlink('../vue-cli/dist', './cli', err => {
                if (err) console.error(err)
                console.log(process.cwd(), 'symbolic linked')
            })
        })
    }
  })
} catch (err) {
  console.error(err)
}