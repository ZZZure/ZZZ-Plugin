import fs from 'fs';
export function checkFolderExistAndCreate(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}
