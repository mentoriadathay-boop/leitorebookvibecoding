const PDFParser = require('pdf2json');
const fs = require('fs');

const pdfParser = new PDFParser(null, 1);

pdfParser.on('pdfParser_dataError', errData => {
  console.error('ERR:', errData.parserError);
  process.exit(1);
});

pdfParser.on('pdfParser_dataReady', pdfData => {
  const pages = pdfData.Pages || pdfData.formImage?.Pages || [];

  // Clean spaced text: "V i b e" -> "Vibe"
  function cleanText(str) {
    // Fix character spacing: single chars separated by spaces
    // Pattern: sequences like "V i b e   C o d i n g" -> "Vibe Coding"
    let cleaned = str;
    // Replace spaced-out words: letter space letter (repeatedly)
    cleaned = cleaned.replace(/([A-Za-zÀ-ÿ]) ([A-Za-zÀ-ÿ]) ([A-Za-zÀ-ÿ])/g, '$1$2$3');
    cleaned = cleaned.replace(/([A-Za-zÀ-ÿ]) ([A-Za-zÀ-ÿ]) ([A-Za-zÀ-ÿ])/g, '$1$2$3');
    cleaned = cleaned.replace(/([A-Za-zÀ-ÿ]) ([A-Za-zÀ-ÿ])/g, '$1$2');
    // Fix double spaces
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
    return cleaned;
  }

  const result = [];

  pages.forEach((page, pi) => {
    const texts = page.Texts || [];
    const lines = {};

    texts.forEach(t => {
      const y = Math.round(t.y * 3) / 3;
      if (!lines[y]) lines[y] = [];
      const str = t.R.map(r => { try { return decodeURIComponent(r.T); } catch(e) { return r.T; } }).join('');
      lines[y].push({ x: t.x, str });
    });

    const pageLines = [];
    Object.keys(lines)
      .sort((a, b) => parseFloat(a) - parseFloat(b))
      .forEach(y => {
        const raw = lines[y]
          .sort((a, b) => a.x - b.x)
          .map(i => i.str)
          .join(' ')
          .trim();
        if (raw) {
          pageLines.push(cleanText(raw));
        }
      });

    result.push({ page: pi + 1, lines: pageLines });
  });

  // Output as JSON
  fs.writeFileSync('extracted_pages.json', JSON.stringify(result, null, 2), 'utf8');
  console.log(`Extracted ${result.length} pages to extracted_pages.json`);

  // Also write a readable text version
  let txt = '';
  result.forEach(p => {
    txt += `\n===PAGE_${p.page}===\n`;
    txt += p.lines.join('\n') + '\n';
  });
  fs.writeFileSync('extracted_pages.txt', txt, 'utf8');
  console.log('Text version saved to extracted_pages.txt');
});

pdfParser.loadPDF('C:/Users/Thayane Fidelis/Downloads/ebook Vibe Coding.pdf');
