import { ImportedData } from '../components/semrush/types';

export interface HistoryEntry extends ImportedData {
  id: string;
  createdAt: string;
  expiresAt: string;
}

const HISTORY_KEY = 'semrush_import_history';
const EXPIRY_DAYS = 3;

export const historyService = {
  getHistory(): HistoryEntry[] {
    try {
      const history = localStorage.getItem(HISTORY_KEY);
      if (!history) return [];

      const entries: HistoryEntry[] = JSON.parse(history);
      const now = new Date().getTime();
      
      // Filter out expired entries
      const validEntries = entries.filter(entry => {
        const expiryDate = new Date(entry.expiresAt).getTime();
        return expiryDate > now;
      });

      // Update storage if entries were filtered out
      if (validEntries.length !== entries.length) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(validEntries));
      }

      return validEntries;
    } catch (error) {
      console.error('Error reading history:', error);
      return [];
    }
  },

  saveToHistory(data: ImportedData): HistoryEntry {
    try {
      const history = this.getHistory();
      const now = new Date();
      
      const entry: HistoryEntry = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + (EXPIRY_DAYS * 24 * 60 * 60 * 1000)).toISOString()
      };

      const updatedHistory = [entry, ...history];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

      return entry;
    } catch (error) {
      console.error('Error saving to history:', error);
      throw new Error('Failed to save import to history');
    }
  },

  deleteEntry(id: string): void {
    try {
      const history = this.getHistory();
      const updatedHistory = history.filter(entry => entry.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw new Error('Failed to delete history entry');
    }
  },

  clearHistory(): void {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
      throw new Error('Failed to clear history');
    }
  }
};