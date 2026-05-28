const { PDFParse } = require('pdf-parse');
const fs = require('fs');

const buf = fs.readFileSync('C:/Users/Thayane Fidelis/Downloads/ebook Vibe Coding.pdf');
const parser = new PDFParse();

parser.parse(buf).then(data => {
  const pages = data.pages;
  console.log('TOTAL_PAGES:' + pages.length);
  pages.forEach((page, idx) => {
    const text = page.Texts
      .map(t => t.R.map(r => decodeURIComponent(r.T)).join(''))
      .join(' ');
    console.log(`\n===PAGE_${idx + 1}===`);
    console.log(text);
  });
}).catch(e => console.error('ERROR:', e.message));
