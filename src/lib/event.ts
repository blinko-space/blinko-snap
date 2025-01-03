import { emit, listen } from '@tauri-apps/api/event';

export const eventBus = {
  emit: (event: string, payload?: any) => emit(event, payload),
  on: (event: string, callback: (event: any) => void) => listen(event, callback),
};