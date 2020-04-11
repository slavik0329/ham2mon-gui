const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const cors = require('cors')

const express = require('express');
const app = express();
const port = 3124;

app.use(cors());

app.get('/', async (req, res) => {
  const fileData = await getFileData();

  res.json(fileData);
});

let wavDir;

try {
  wavDir = require('./config').wavDir;

  if (!wavDir) {
    console.log("Error: You must have a wavDir set in config file!");
    process.exit();
  }
} catch (e) {
  console.log("Error: You must have a configuration file in server path! [config.json]");
  process.exit();
}

app.use('/static', express.static(wavDir));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

async function getFileData() {

  const files = await readdir(wavDir);

  const fileData = files.map(file => {
    // Strip ext
    const fileName = file.slice(0, -4);
    const [freq, time] = fileName.split('_');
    const stats = fs.statSync(wavDir + "/" + file);

    return {
      freq,
      time,
      file,
      size: stats.size
    };
  });

  console.log(fileData.length)

  const filtered = fileData.filter(
    file => {
      const beforeTime = parseInt((Date.now() / 1000) - (60 * 60 * 3));
      return file.size > 60000
      // && parseInt(file.time) > beforeTime)
    }
  );

  return filtered;
}

