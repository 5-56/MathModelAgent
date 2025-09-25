export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: Date;
  type: 'text' | 'code' | 'image' | 'file' | 'error';
  metadata?: {
    codeLanguage?: string;
    fileName?: string;
    fileSize?: number;
    imageUrl?: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  result?: {
    type: 'text' | 'file' | 'url';
    content: string;
    fileName?: string;
  };
}

export interface AgentStatus {
  coordinator: 'idle' | 'working' | 'error';
  modeler: 'idle' | 'working' | 'error';
  coder: 'idle' | 'working' | 'error';
  writer: 'idle' | 'working' | 'error';
}

export interface SystemInfo {
  termuxVersion: string;
  pythonVersion: string;
  nodeVersion: string;
  availableMemory: number;
  storageSpace: number;
  networkStatus: 'connected' | 'disconnected';
}