
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
  metadata?: WebsiteMetadata[];
}

export interface WebsiteMetadata {
  url: string;
  title?: string;
  description?: string;
  lastScraped: Date;
}

export enum ProcessingStatus {
  Idle = 'idle',
  Processing = 'processing',
  Success = 'success',
  Error = 'error'
}

export interface ScrapedContent {
  url: string;
  title?: string;
  description?: string;
  content: string;
  error?: string;
}

export interface LlmResponse {
  answer: string;
  error?: string;
}
