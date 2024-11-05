import axios from 'axios';

interface GoogleSuggestResponse {
  data: [string, string[]];
}

export async function getGoogleSuggestions(keyword: string, language: string): Promise<string[]> {
  try {
    const [lang, country] = language.split('-');
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=${lang}&gl=${country}&q=${encodeURIComponent(keyword)}`;
    
    const response = await axios.get<[string, string[]]>(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    return response.data[1] || [];
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
}

export async function batchGetSuggestions(
  keywords: Array<{ keyword: string }>, 
  language: string
): Promise<Record<string, string[]>> {
  const results: Record<string, string[]> = {};
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (const { keyword } of keywords) {
    try {
      const suggestions = await getGoogleSuggestions(keyword, language);
      results[keyword] = suggestions;
      
      // Add delay between requests to avoid rate limiting
      await delay(200);
    } catch (error) {
      console.error(`Error getting suggestions for "${keyword}":`, error);
      results[keyword] = [];
    }
  }

  return results;
}