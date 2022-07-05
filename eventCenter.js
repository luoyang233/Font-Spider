const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const { ipcMain, dialog, Notification } = require('electron');

let source = '';

async function gen(event, value) {
  const htmlPath = path.join(__dirname, 'index.html');
  const prev = fs.readFileSync(htmlPath, 'utf-8');
  const next = prev.replace('[value]', value).replace('[source]', source);
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    if (!canceled) {
      fs.writeFileSync(htmlPath, next);
      child_process.execSync('npm run gen', { stdio: 'inherit' });
      const sourceFolder = path.dirname(source);
      const sourceFileName = path.basename(source);
      // gen默认在source目录下生成文件
      const genFolder = path.join(sourceFolder, '.font-spider');
      const genFile = path.join(sourceFolder, '.font-spider', sourceFileName);
      const outputFolder = filePaths[0];
      const outputFileName =
        path.basename(source, path.extname(source)) + '_dist.ttf';
      fs.renameSync(genFile, path.join(outputFolder, outputFileName));
      // !!!!!!!!
      child_process.execSync(`rm -rf ${genFolder}`);
      showNotification('文件已生成');
    }
  } catch (error) {
    console.error(error);
  } finally {
    fs.writeFileSync(htmlPath, prev);
  }
}
async function selectFile() {
  const { canceled, filePaths } = await dialog.showOpenDialog();
  if (!canceled) {
    source = filePaths[0];
    return filePaths[0];
  }
}

function showNotification(title, body) {
  new Notification({ title, body }).show();
}

function eventCenter() {
  ipcMain.handle('select', selectFile);
  ipcMain.handle('gen', gen);
}

module.exports = eventCenter;
