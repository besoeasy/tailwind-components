const fs = require('fs');
const { exec } = require('child_process');

const extraname = "metis-others-"

function generateRandomFileName() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomName = '';
  for (let i = 0; i < 8; i++) {
    randomName += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `components/unsorted/${extraname}${randomName}.html`; // Updated path
}

function createHTMLFile() {
  const fileName = generateRandomFileName();
  const htmlContent = '<div> </div>';

  fs.writeFile(fileName, htmlContent, (err) => {
    if (err) {
      console.error('Error creating HTML file:', err);
    } else {
      console.log(`Created HTML file: ${fileName}`);
      openInVSCode(fileName);
    }
  });
}

function openInVSCode(fileName) {
  exec(`code ${fileName}`, (err, stdout, stderr) => {
    if (err) {
      console.error('Error opening file in VS Code:', err);
    } else {
      console.log(`Opened ${fileName} in VS Code`);
    }
  });
}

createHTMLFile();
