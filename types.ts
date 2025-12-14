export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64 string
  previewUrl: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  attachment?: Attachment;
  isLoading?: boolean;
  timestamp: number;
}
