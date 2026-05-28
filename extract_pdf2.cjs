const { PdfReader } = require('pdfreader');
const fs = require('fs');

const rows = {};
let currentPage = 0;

new PdfReader().parseFileItems(
  'C:/Users/Thayane Fidelis/Downloads/ebook Vibe Coding.pdf',
  (err, item) => {
    if (err) { console.error('ERR', err.message); return; }
    if (!item) {
      // end of file — dump collected text
      Object.keys(rows).sort((a,b) => Number(a)-Number(b)).forEach(page => {
        const lines = rows[page];
        // group by y-position
        const yGroups = {};
        lines.forEach(({x, y, text}) => {
          const yKey = Math.round(y * 2) / 2;
          if (!yGroups[yKey]) yGroups[yKey] = [];
          yGroups[yKey].push({x, text});
        });
        console.log(`\n===PAGE_${page}===`);
        Object.keys(yGroups).sort((a,b)=>a-b).forEach(y => {
          const line = yGroups[y].sort((a,b)=>a.x-b.x).map(i=>i.text).join(' ');
          console.log(line);
        });
      });
      return;
    }
    if (item.page) {
      currentPage = item.page;
      rows[currentPage] = rows[currentPage] || [];
    }
    if (item.text) {
      rows[currentPage].push({ x: item.x, y: item.y, text: item.text });
    }
  }
);
