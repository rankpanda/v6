import { KeywordData } from './types';

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
    } else if ((char === ',' || char === '\t') && !insideQuotes) { // Added tab support
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
    normalizedNames.some(name => header === name)
  );
}

export function validateAndParseKeywords(rows: string[][]): KeywordData[] {
  if (rows.length < 2) {
    throw new Error('O ficheiro CSV deve conter cabeçalhos e dados');
  }

  const headers = rows[0];
  console.log('Headers encontrados:', headers);

  // Match exact column names from the file
  const keywordIdx = findColumnIndex(headers, ['Keyword']);
  const volumeIdx = findColumnIndex(headers, ['Volume']);
  const difficultyIdx = findColumnIndex(headers, ['Keyword Difficulty']);
  const intentIdx = findColumnIndex(headers, ['Intent']);
  const cpcIdx = findColumnIndex(headers, ['CPC (USD)']);
  const trendIdx = findColumnIndex(headers, ['Trend']);

  console.log('Índices das colunas:', {
    keyword: keywordIdx,
    volume: volumeIdx,
    difficulty: difficultyIdx,
    intent: intentIdx,
    cpc: cpcIdx,
    trend: trendIdx
  });

  if (keywordIdx === -1) {
    throw new Error('Coluna "Keyword" não encontrada');
  }
  if (volumeIdx === -1) {
    throw new Error('Coluna "Volume" não encontrada');
  }
  if (difficultyIdx === -1) {
    throw new Error('Coluna "Keyword Difficulty" não encontrada');
  }

  const keywords: KeywordData[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[keywordIdx]?.trim()) continue;

    try {
      // Parse keyword data
      const keyword: KeywordData = {
        keyword: row[keywordIdx].trim(),
        volume: parseInt(row[volumeIdx].replace(/[,.\s]/g, '')) || 0,
        difficulty: parseFloat(row[difficultyIdx].replace(/[%,\s]/g, '')) || 0
      };

      // Add optional fields if they exist
      if (intentIdx !== -1 && row[intentIdx]) {
        keyword.intent = row[intentIdx].trim();
      }

      if (cpcIdx !== -1 && row[cpcIdx]) {
        // Remove currency symbols and convert to number
        keyword.cpc = parseFloat(row[cpcIdx].replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
      }

      if (trendIdx !== -1 && row[trendIdx]) {
        keyword.trend = row[trendIdx].trim();
      }

      // Log each keyword for debugging
      console.log('Parsed keyword:', keyword);

      // Validate the keyword data
      if (keyword.keyword && !isNaN(keyword.volume) && !isNaN(keyword.difficulty)) {
        keywords.push(keyword);
      } else {
        console.warn(`Linha ${i + 1} ignorada devido a dados inválidos:`, row);
      }
    } catch (error) {
      console.error(`Erro ao processar linha ${i + 1}:`, error);
      continue;
    }
  }

  if (keywords.length === 0) {
    throw new Error('Nenhuma palavra-chave válida encontrada no ficheiro');
  }

  console.log('Total keywords parsed:', keywords.length);
  return keywords;
}