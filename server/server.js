const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const cors = require('cors');
const path = require('path');
const sanitize = require("sanitize-filename");
const getSize = require('get-folder-size');
const disk = require('diskusage');

const express = require('express');
const app = express();
const port = 8080;
const NodeCache = require("node-cache");
const fileCache = new NodeCache({stdTTL: 10});

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

function getSizePromise(dir) {
  return new Promise((resolve, reject) => {
    getSize(dir, (err, size) => {
      if (err) {
        reject(err);
      } else {
        resolve(size);
      }
    });
  })
}

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

async function getAllFiles(forceUpdate) {
  let fileData = fileCache.get("allFiles");

  if (fileData === undefined || forceUpdate) {
    fileData = await getFileData();
    fileCache.set('allFiles', fileData);
  }
  return fileData;
}

setInterval(getAllFiles.bind(this, true), 9000);

app.post('/data', async (req, res) => {
  let fileData = await getAllFiles();

  let dirSize = fileCache.get('dirSize');
  let availableSpace = fileCache.get('availableSpace');

  if (dirSize === undefined) {
    dirSize = await getSizePromise(wavDir);
    const result = await disk.check(wavDir);
    availableSpace = result.available;

    fileCache.set('dirSize', dirSize, 60 * 60);
    fileCache.set('availableSpace', availableSpace, 60 * 60);
  }

  const {fromTime} = req.body;

  if (fromTime) {
    fileData = fileData.filter(file => file.time >= fromTime);
  }

  res.json({
    files: fileData,
    dirSize,
    freeSpace: availableSpace
  });
});

function deleteFiles(files) {
  for (let file of files) {
    try {
      fs.unlinkSync(wavDir + "/" + sanitize(file));
      console.log("Deleted " + file);
    } catch (e) {
      console.log("Error deleting file " + file, e);
    }
  }
}

app.post('/deleteBefore', async (req, res) => {
  const {deleteBeforeTime} = req.body;

  const allFiles = await getFileData();
  const filesToDelete = allFiles
    .filter(file => file.time < deleteBeforeTime)
    .map(file => file.file);

  deleteFiles(filesToDelete);

  fileCache.del('dirSize');
  fileCache.del('availableSpace');

  res.json({});
});

app.post('/delete', async (req, res) => {
  const {files} = req.body;

  deleteFiles(files);

  res.json({});
});

app.use('/static', express.static(wavDir));
app.use('/', express.static(path.join(__dirname, '../build')));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

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

  console.log(fileData.length);

  return fileData.filter(
    file => {
      return file.size > 60000
    }
  );
}

