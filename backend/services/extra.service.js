const Tesseract = require('tesseract.js');
const pdfParseModule = require('pdf-parse');
const pdfParse = pdfParseModule.default || pdfParseModule;

async function extractTextFromFile(file) {
  const { mimetype, buffer } = file;
  let text = '';

  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    text = data.text;
  } else if (mimetype.startsWith('image/')) {
    const result = await Tesseract.recognize(buffer, 'eng', {
      logger: () => {},
    });
    text = result.data.text;
  }

  return text.trim().replace(/\s+/g, ' ');
}

module.exports = { extractTextFromFile };