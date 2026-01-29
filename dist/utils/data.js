import _ from 'lodash';
export const randomString = (length) => {
    let randomStr = '';
    for (let i = 0; i < length; i++) {
        randomStr += _.sample('abcdefghijklmnopqrstuvwxyz0123456789');
    }
    return randomStr;
};
export const generateSeed = (length = 16) => {
    const characters = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters[Math.floor(Math.random() * characters.length)];
    }
    return result;
};
export const mdLogLineToHTML = function (line) {
    line = line.replace(/(^\s*\*|\r)/g, '');
    line = line.replace(/\s*`([^`]+`)/g, '<span class="cmd">$1');
    line = line.replace(/`\s*/g, '</span>');
    line = line.replace(/\s*\*\*([^\*]+\*\*)/g, '<span class="strong">$1');
    line = line.replace(/\*\*\s*/g, '</span>');
    line = line.replace(/ⁿᵉʷ/g, '<span class="new"></span>');
    return line.trim();
};
//# sourceMappingURL=data.js.map