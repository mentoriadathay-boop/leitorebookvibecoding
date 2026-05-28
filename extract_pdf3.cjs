const PDFParser = require('pdf2json');
const fs = require('fs');

const pdfParser = new PDFParser(null, 1);

pdfParser.on('pdfParser_dataError', errData => console.error('ERR:', errData.parserError));

pdfParser.on('pdfParser_dataReady', pdfData => {
  const pages = pdfData.Pages || pdfData.formImage?.Pages || [];
  console.log('TOTAL PAGES:', pages.length);

  pages.forEach((page, pi) => {
    const texts = page.Texts || [];
    const lines = {};

    texts.forEach(t => {
      const y = Math.round(t.y * 4) / 4;
      if (!lines[y]) lines[y] = [];
      const str = t.R.map(r => decodeURIComponent(r.T)).join('');
      lines[y].push({ x: t.x, str });
    });

    console.log(`\n===PAGE_${pi + 1}===`);
    Object.keys(lines)
      .sort((a, b) => parseFloat(a) - parseFloat(b))
      .forEach(y => {
        const lineText = lines[y]
          .sort((a, b) => a.x - b.x)
          .map(i => i.str)
          .join(' ')
          .trim();
        if (lineText) console.log(lineText);
      });
  });
});

pdfParser.loadPDF('C:/Users/Thayane Fidelis/Downloads/ebook Vibe Coding.pdf');
