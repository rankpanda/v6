export class KeywordSimilarity {
  private normalize(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  }

  private getWords(str: string): string[] {
    return this.normalize(str).split(/\s+/);
  }

  private intersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
    return new Set([...setA].filter(x => setB.has(x)));
  }

  private union<T>(setA: Set<T>, setB: Set<T>): Set<T> {
    return new Set([...setA, ...setB]);
  }

  private jaccard(setA: Set<string>, setB: Set<string>): number {
    const intersection = this.intersection(setA, setB);
    const union = this.union(setA, setB);
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  calculate(str1: string, str2: string): number {
    const words1 = new Set(this.getWords(str1));
    const words2 = new Set(this.getWords(str2));
    
    // Calculate Jaccard similarity
    const jaccardSim = this.jaccard(words1, words2);
    
    // Check for exact word matches
    const exactMatches = [...words1].filter(word => 
      [...words2].some(w => w === word)
    ).length;
    
    // Weight exact matches more heavily
    const exactMatchWeight = exactMatches > 0 ? 0.3 : 0;
    
    return Math.min(jaccardSim + exactMatchWeight, 1);
  }
}