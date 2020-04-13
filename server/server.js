const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const cors = require('cors')
const path = require('path')
const sanitize = require("sanitize-filename");

const express = require('express');
const app = express();
const port = 8080;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/data', async (req, res) => {
  const fileData = await getFileData();

  res.json({
    files: fileData
  });
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

app.post('/delete', async (req, res) => {
  const {files} = req.body;

  for (let file of files) {
    try {
      fs.unlinkSync(wavDir + "/" + sanitize(file));
      console.log("Deleted " + file);
    } catch (e) {
      console.log("Error deleting file " + file, e);
    }
  }

  res.json({});
});

app.use('/static', express.static(wavDir));
app.use('/', express.static(path.join(__dirname, '../build')));

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

