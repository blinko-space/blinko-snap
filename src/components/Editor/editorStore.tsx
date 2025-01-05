import { RootStore } from '@/store';
import { PromiseState } from '@/store/standard/PromiseState';
import { helper } from '@/lib/helper';
import { FileType, OnSendContentType } from './type';
import { BlinkoStore } from '@/store/blinkoStore';
import { _ } from '@/lib/lodash';
import { getEditorElements, type ViewMode } from './editorUtils';
import { makeAutoObservable } from 'mobx';
import Vditor from 'vditor';
import { Button } from '@nextui-org/react';
import axios from 'axios';
import { ToastPlugin } from '@/store/module/Toast/Toast';
import i18next from 'i18next';
import { api } from '@/lib/api';


export class EditorStore {
  files: FileType[] = []
  lastRange: Range | null = null
  lastStartOffset: number = 0
  lastEndOffset: number = 0
  lastRangeText: string = ''
  lastRect: DOMRect | null = null
  viewMode: ViewMode = "wysiwyg"
  lastSelection: Selection | null = null
  vditor: Vditor | null = null
  onChange: ((markdown: string) => void) | null = null
  mode: 'edit' | 'create' = 'edit'
  references: number[] = []
  isShowSearch: boolean = false
  onSend: (args: OnSendContentType) => Promise<any>

  get canSend() {
    return this.files?.every(i => !i?.uploadPromise?.loading?.value) && (this.files?.length != 0 || this.vditor?.getValue() != '')
  }

  get blinko() {
    return RootStore.Get(BlinkoStore)
  }

  handleIOSFocus() {
    try {
      if (helper.env.isIOS() && this.mode == 'edit') {
        this.focus()
      }
    } catch (error) { }
  }

  updateFileOrder = (newFiles: FileType[]) => {
    this.files = newFiles;
  }

  insertMarkdown = (text: string) => {
    this.vditor?.insertValue(text)
    this.focus()
  }

  replaceMarkdown = (text: string) => {
    this.vditor?.setValue(text)
    this.focus()
  }

  getEditorRange = (vditor: IVditor) => {
    let range: Range;
    const element = vditor[vditor.currentMode]!.element;
    if (getSelection()!.rangeCount > 0) {
      range = getSelection()!.getRangeAt(0);
      if (element.isEqualNode(range.startContainer) || element.contains(range.startContainer)) {
        return range;
      }
    }
    if (vditor[vditor.currentMode]!.range) {
      return vditor[vditor.currentMode]!.range;
    }
    element.focus();
    range = element.ownerDocument.createRange();
    range.setStart(element, 0);
    range.collapse(true);
    return range;
  };


  focus = () => {
    this.vditor?.focus();
    const editorElement = getEditorElements(this.viewMode, this.vditor!)
    try {
      const range = document.createRange()
      const selection = window.getSelection()
      const walker = document.createTreeWalker(
        editorElement!,
        NodeFilter.SHOW_TEXT,
        null
      )
      let lastNode: any = null
      while (walker.nextNode()) {
        lastNode = walker.currentNode
      }
      if (lastNode) {
        range.setStart(lastNode, lastNode?.length)
        range.setEnd(lastNode, lastNode?.length)
        selection?.removeAllRanges()
        selection?.addRange(range)
        editorElement!.focus()
      }
    } catch (error) {
    }
  }

  clearMarkdown = () => {
    this.vditor?.setValue('')
    this.onChange?.('')
    this.focus()
  }


  uploadFiles = async (acceptedFiles: any) => {
    const uploadFileType = {}

    const _acceptedFiles = acceptedFiles.map((file: any) => {
      const extension = helper.getFileExtension(file.name)
      const previewType = helper.getFileType(file.type, file.name)
      return {
        name: file.name,
        size: file.size,
        previewType,
        extension: extension ?? '',
        preview: URL.createObjectURL(file),
        uploadPromise: new PromiseState({
          function: async () => {
            const formData = new FormData();
            formData.append('file', file)
            const { onUploadProgress } = RootStore.Get(ToastPlugin)
              .setSizeThreshold(40)
              .uploadProgress(file);

            const response = await api('/file/upload', 'POST', formData, {
              onUploadProgress
            });
            const data = response.data;
            if (data.fileName) {
              const fileIndex = this.files.findIndex(f => f.name === file.name);
              if (fileIndex !== -1) {
                this.files[fileIndex]!.name = data.fileName;
              }
            }
            if (data.filePath) {
              //@ts-ignore
              uploadFileType[file.name] = data.type
              return data.filePath
            }
          }
        }),
        type: file.type
      }
    })
    this.files.push(..._acceptedFiles)
    await Promise.all(_acceptedFiles.map((i: any) => i.uploadPromise.call()))
    if (this.mode == 'create') {
      _acceptedFiles.map((i: any) => ({
        name: i.name,
        path: i.uploadPromise.value,
        //@ts-ignore
        type: uploadFileType?.[i.name],
        size: i.size
      })).map((t: any) => {
        RootStore.Get(BlinkoStore).createAttachmentsStorage.push(t)
      })
    }
  }

  handlePasteFile = async ({ fileName, filePath, type, size }: { fileName: string, filePath: string, type: string, size: number }) => {
    const extension = helper.getFileExtension(fileName)
    const previewType = helper.getFileType(type, fileName)
    const _file = {
      name: fileName,
      size,
      previewType: previewType,
      extension: extension ?? '',
      preview: filePath,
      uploadPromise: new PromiseState({
        function: async () => {
          return filePath
        }
      }),
      type: type
    }
    await _file.uploadPromise.call()
    this.files.push(_file)
  }
  handleSend = async () => {
    if (!this.canSend) return;
    console.log('handleSend', this.vditor?.getValue())
    try {
      await this.onSend?.({
        content: this.vditor?.getValue() ?? '',
        files: this.files.map(i => ({ ...i, uploadPath: i.uploadPromise.value })),
        references: this.references
      });
      this.clearEditor();
    } catch (error) {
      console.error('Failed to send content:', error);
    }
  }

  clearEditor = () => {
    this.vditor?.setValue('')
    this.files = [];
    this.references = []
  }

  constructor() {
    makeAutoObservable(this)
  }

  init = (args: Partial<EditorStore>) => {
    Object.assign(this, args)
    //remove listener on pc
    const wysiwyg = document.querySelector('.vditor-wysiwyg .vditor-reset')
    if (wysiwyg) {
      wysiwyg.addEventListener('ondragstart', (e) => {
        if (wysiwyg.contains(e.target as Node)) {
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      }, true);
    }
  }

  handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const vditorInput = document.querySelector(`#vditor-${this.mode} .vditor-reset`) as HTMLElement;
      if (vditorInput) {

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        range.deleteContents();

        const tabNode = document.createTextNode('\t');
        range.insertNode(tabNode);

        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        console.log('vditor not found');
      }
    }
  }
}