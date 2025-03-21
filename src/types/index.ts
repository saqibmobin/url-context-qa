
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ContextData {
  urls: string[];
  content: string;
  isProcessing: boolean;
  error?: string;
}

export enum ProcessingStatus {
  Idle = 'idle',
  Processing = 'processing',
  Success = 'success',
  Error = 'error'
}
