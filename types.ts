export interface PfeData {
  university: string;
  school: string;
  year: string;
  title: string;
  studentName: string;
  supervisors: string[];
  juryMembers: string[];
  filiere: string;
  description: string;
  keywords: string;
  customInstructions: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}