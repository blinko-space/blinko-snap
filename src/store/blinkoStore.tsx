import { _ } from '@/lib/lodash';
import { PromiseState } from './standard/PromiseState';
import { Store } from './standard/base';
import { ToastPlugin } from './module/Toast/Toast';
import { RootStore } from './root';
import { eventBus } from '@/lib/event';
import { StorageListState } from './standard/StorageListState';
import { makeAutoObservable } from 'mobx';
import { StorageState } from './standard/StorageState';
import { Attachment } from '@/components/Editor/type';
import { helper } from '@/lib/helper';
import i18next from 'i18next';
import { api } from '@/lib/api';

type filterType = {
  label: string;
  sortBy: string;
  direction: string;
}

export enum NoteType {
  'BLINKO',
  'NOTE'
}


// Interface for note upsert parameters
interface UpsertNoteParams {
  /** Note content */
  content?: string | null;
  /** Whether the note is archived */
  isArchived?: boolean;
  /** Whether the note is in recycle bin */
  isRecycle?: boolean;
  /** Note type */
  type?: NoteType;
  /** Note ID */
  id?: number;
  /** List of attachments */
  attachments?: Attachment[];
  /** Whether to refresh the list after operation */
  refresh?: boolean;
  /** Whether the note is pinned to top */
  isTop?: boolean;
  /** Whether the note is publicly shared */
  isShare?: boolean;
  /** Whether to show toast notification */
  showToast?: boolean;
  /** List of referenced note IDs */
  references?: number[];
  /** Creation time */
  createdAt?: Date;
  /** Last update time */
  updatedAt?: Date;
}


export class BlinkoStore implements Store {
  sid = 'BlinkoStore';
  noteContent = '';
  createContentStorage = new StorageState<{ content: string }>({
    key: 'createModeNote',
    default: { content: '' }
  });
  createAttachmentsStorage = new StorageListState<{ name: string, path: string, type: string, size: number }>({
    key: 'createModeAttachments',
  });
  noteTypeDefault: NoteType = NoteType.BLINKO
  updateTicker = 0

  upsertNote = new PromiseState({
    function: async (params: UpsertNoteParams) => {
      const {
        content = null,
        isRecycle,
        type = this.noteTypeDefault,
        id,
        attachments = [],
        refresh = true,
        isTop,
        isShare,
        showToast = true,
      } = params;


      const res = await api('/v1/note/upsert', 'POST', {
        content,
        type,
        isRecycle,
        id,
        attachments,
        isTop,
        isShare,
      });
      eventBus.emit('editor:clear')
      showToast && i18next.t("create-successfully")
      refresh && this.updateTicker++
      return res
    }
  })

  // shareNote = new PromiseState({
  //   function: async (params: { id: number, isCancel: boolean, password?: string, expireAt?: Date }) => {
  //     const res = await api.notes.shareNote.mutate(params)
  //     RootStore.Get(ToastPlugin).success(i18n.t("operation-success"))
  //     this.updateTicker++
  //     return res
  //   }
  // })

  tagList = new PromiseState({
    function: async () => {
      const res = await api('/v1/tags/list', 'GET')
      const falttenTags = res.data
      console.log(falttenTags, 'falttenTags');
      const listTags = helper.buildHashTagTreeFromDb(falttenTags)
      let pathTags: string[] = [];
      listTags.forEach(node => {
        pathTags = pathTags.concat(helper.generateTagPaths(node));
      });
      console.log(pathTags, 'pathTags');
      return { falttenTags, listTags, pathTags }
    }
  })

  config = new PromiseState({
    function: async () => {
      return await api('/v1/config/list', 'GET')
    }
  })

  loadAllData() {
    this.tagList.call()
    this.config.call()
  }

  constructor() {
    makeAutoObservable(this)
  }
}
