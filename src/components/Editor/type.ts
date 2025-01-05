import { PromiseState } from "@/store/standard/PromiseState";

export type OnSendContentType = {
  content: string;
  files: (FileType & { uploadPath: string })[]
  references: number[]
}

export type FileType = {
  name: string
  size: number
  previewType: 'image' | 'audio' | 'video' | 'other'
  extension: string
  preview: any
  uploadPromise: PromiseState<any>
  type: string // audio/webm
}

export type Attachment = {
  path: string;
  id: number;
  size: number;
  name: string;
  type: string;
  isShare: boolean;
  sharePassword: string;
  createdAt: Date;
  updatedAt: Date;
  noteId: number;
  sortOrder: number;
  depth?: any;
  perfixPath?: any;
}