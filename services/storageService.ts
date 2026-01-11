
import { AppState } from '../types';
import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'toazul_secure_data_v3';

export const storageService = {
  save: (data: AppState, masterKey?: string) => {
    const rawData = JSON.stringify(data);
    if (masterKey) {
      const encrypted = CryptoJS.AES.encrypt(rawData, masterKey).toString();
      localStorage.setItem(STORAGE_KEY, encrypted);
      localStorage.setItem('toazul_is_encrypted', 'true');
    } else {
      localStorage.setItem(STORAGE_KEY, rawData);
      localStorage.setItem('toazul_is_encrypted', 'false');
    }
  },

  load: (masterKey?: string): AppState | 'locked' => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const isEncrypted = localStorage.getItem('toazul_is_encrypted') === 'true';

    // Fix: Added missing savingsGoals property to ensure the default state matches the AppState interface.
    if (!stored) return { 
      incomes: [], 
      expenses: [], 
      savings: [], 
      savingsGoals: [],
      initialBalance: 0,
      initialSavings: 0 
    };

    if (isEncrypted && !masterKey) return 'locked';

    try {
      if (isEncrypted && masterKey) {
        const bytes = CryptoJS.AES.decrypt(stored, masterKey);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedData) throw new Error("Chave Inválida");
        return JSON.parse(decryptedData);
      }
      return JSON.parse(stored);
    } catch (e) {
      return 'locked';
    }
  },

  isEncrypted: () => localStorage.getItem('toazul_is_encrypted') === 'true',

  exportData: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    const encrypted = localStorage.getItem('toazul_is_encrypted');
    if (!data) return null;
    
    const blob = new Blob([JSON.stringify({ data, encrypted })], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_toazul_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  },

  importData: (jsonString: string) => {
    try {
      const { data, encrypted } = JSON.parse(jsonString);
      localStorage.setItem(STORAGE_KEY, data);
      localStorage.setItem('toazul_is_encrypted', encrypted);
      return true;
    } catch (e) {
      return false;
    }
  }
};
