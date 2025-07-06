import { useEffect } from 'react';
import { eventBus } from '@/lib/event';
import { EditorStore } from '../editorStore';
import { HandleFileType } from '../editorUtils';
import { OnSendContentType } from '../type';
import Vditor from 'vditor';
import { ToolbarPC } from '../EditorToolbar';
import { RootStore } from '@/store';
import { i18nEditor } from '../EditorToolbar/i18n';
import { useTranslation } from 'react-i18next';
import { Extend } from '../EditorToolbar/extends';
import { BlinkoStore } from '@/store/blinkoStore';
import { getEndpointAndToken } from '@/lib/api';

export const useEditorInit = (
  store: EditorStore,
  onChange: ((content: string) => void) | undefined,
  onSend: (args: OnSendContentType) => Promise<any>,
  mode: 'create' | 'edit',
  content: string
) => {
  const { t } = useTranslation()
  const blinko = RootStore.Get(BlinkoStore)
  useEffect(() => {

    if (store.vditor) {
      store.vditor?.destroy();
      store.vditor = null
    }
    const { endpoint, token } = getEndpointAndToken()
    // const theme = RootStore.Get(UserStore).theme
    const vditor = new Vditor("vditor" + "-" + mode, {
      width: '100%',
      "toolbar": ToolbarPC,
      mode: store.viewMode == 'wysiwyg' ? 'ir' : store.viewMode,
      // theme,
      theme: 'classic',
      counter: {
        enable: true,
        type: 'markdown',
      },
      height: 'auto',
      hint: {
        extend: Extend
      },
      async ctrlEnter(md) {
        await store.handleSend()
      },
      placeholder: t('i-have-a-new-idea'),
      i18n: {
        ...i18nEditor(t)
      },
      input: (value) => {
        onChange?.(value)
      },
      upload: {
        url: endpoint + 'api/file/upload',
        success: (editor, res) => {
          console.log(res)
          const { fileName, filePath, type, size } = JSON.parse(res)
          store.handlePasteFile({
            fileName,
            filePath: endpoint + filePath,
            type,
            size
          })
        },
        setHeaders() {
          return {
            Authorization: `Bearer ${token}`
          }
        },
        max: 1024 * 1024 * 1000,
        fieldName: 'file',
        multiple: false,
        linkToImgUrl: endpoint + 'api/file/upload-by-url',
        linkToImgFormat(res) {
          const data = JSON.parse(res)
          const result = {
            msg: '',
            code: 0,
            data: {
              originalURL: data.originalURL,
              url: data.filePath,
            }
          }
          console.log(result)
          return JSON.stringify(result)
        }
      },
      undoDelay: 20,
      value: content,
      preview: {
        hljs: {
          // style: theme === 'dark' ? 'github-dark' : 'github',
          style: 'github',
          lineNumber: true,
        },
        delay: 20
      },
      after: () => {
        vditor.setValue(content);
        store.init({
          onChange,
          onSend,
          mode,
          vditor
        });
        store.focus()
      },
    });
    // Clear the effect
    return () => {
      store.vditor?.destroy();
      store.vditor = null;
    };

  }, [mode, store.viewMode]);
};


export const useEditorEvents = (store: EditorStore) => {
  useEffect(() => {
    eventBus.on('editor:clear', store.clearMarkdown);
    eventBus.on('editor:insert', store.insertMarkdown);
    eventBus.on('editor:replace', store.replaceMarkdown);
    eventBus.on('editor:focus', store.focus);
    eventBus.on('editor:setViewMode', (mode) => {
      store.viewMode = mode
    });

    // handleEditorKeyEvents();
    store.handleIOSFocus();
  }, []);
};



export const useEditorFiles = (
  store: EditorStore,
  blinko: BlinkoStore,
  originFiles?: any[],
) => {
  useEffect(() => {
    if (originFiles?.length) {
      store.files = HandleFileType(originFiles);
    }
  }, [originFiles]);
};

export const useEditorHeight = (
  onHeightChange: (() => void) | undefined,
  blinko: BlinkoStore,
  content: string,
  store: EditorStore
) => {
  useEffect(() => {
    onHeightChange?.();
  }, [blinko.noteTypeDefault, content, store.files?.length, store.viewMode]);
}; 