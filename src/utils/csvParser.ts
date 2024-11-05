export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  // First, normalize line endings and remove any BOM
  const normalizedText = text.replace(/^\ufeff/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText[i];
    const nextChar = normalizedText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if ((char === ',' || char === '\t' || char === ';') && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell) {
    currentRow.push(currentCell.trim());
  }
  if (currentRow.some(cell => cell)) {
    rows.push(currentRow);
  }

  return rows;
}

export function findColumnIndex(headers: string[], possibleNames: string[]): number {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  const normalizedNames = possibleNames.map(n => n.toLowerCase().trim());
  
  return normalizedHeaders.findIndex(header => 
    normalizedNames.some(name => header.includes(name))
  );
}

export function validateAndParseKeywords(rows: string[][]): Array<{
  keyword: string;
  volume: number;
  difficulty: number;
  intent?: string;
  cpc?: number;
}> {
  if (rows.length < 2) {
    throw new Error('CSV file must contain headers and data');
  }

  const headers = rows[0];
  
  // Find column indices with flexible matching
  const keywordIdx = findColumnIndex(headers, ['keyword', 'keywords', 'term']);
  const volumeIdx = findColumnIndex(headers, ['volume', 'search volume', 'monthly volume']);
  const difficultyIdx = findColumnIndex(headers, ['difficulty', 'keyword difficulty', 'kd', 'difficulty %']);
  const intentIdx = findColumnIndex(headers, ['intent', 'search intent']);
  const cpcIdx = findColumnIndex(headers, ['cpc', 'cost per click', 'cpc (usd)']);

  if (keywordIdx === -1) throw new Error('Keyword column not found');
  if (volumeIdx === -1) throw new Error('Volume column not found');
  if (difficultyIdx === -1) throw new Error('Difficulty column not found');

  const keywords = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[keywordIdx]?.trim()) continue;

    try {
      const keyword = {
        keyword: row[keywordIdx].trim(),
        volume: parseInt(row[volumeIdx].replace(/[,.\s]/g, '')) || 0,
        difficulty: parseInt(row[difficultyIdx].replace(/[%,\s]/g, '')) || 0
      };

      // Add optional fields if they exist
      if (intentIdx !== -1 && row[intentIdx]) {
        keyword['intent'] = row[intentIdx].trim();
      }

      if (cpcIdx !== -1 && row[cpcIdx]) {
        keyword['cpc'] = parseFloat(row[cpcIdx].replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
      }

      // Validate the keyword data
      if (keyword.keyword && !isNaN(keyword.volume) && !isNaN(keyword.difficulty)) {
        keywords.push(keyword);
      }
    } catch (error) {
      console.error(`Error parsing row ${i + 1}:`, error);
      continue;
    }
  }

  if (keywords.length === 0) {
    throw new Error('No valid keywords found in the file');
  }

  return keywords;
}