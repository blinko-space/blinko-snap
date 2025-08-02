import "vditor/dist/index.css";
import './vditor.css';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { Attachment, FileType, OnSendContentType } from './type';
import { _ } from '@/lib/lodash';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '@nextui-org/react';
import { AttachmentsRender, } from '../AttachmentRender';

import {
  useEditorInit,
  useEditorEvents,
  useEditorFiles,
  useEditorHeight
} from './hooks/useEditor';
import { EditorStore } from "./editorStore";
import { RootStore } from "@/store";
import { BlinkoStore } from "@/store/blinkoStore";
import { NoteTypeButton } from "./Toolbar/NoteTypeButton";
import { HashtagButton } from "./Toolbar/HashtagButton";
import { UploadButtons } from "./Toolbar/UploadButtons";
import { ViewModeButton } from "./Toolbar/ViewModeButton";
import { SendButton } from "./Toolbar/SendButton";
import { IconButton } from "./Toolbar/IconButton";
import { open as openShell } from '@tauri-apps/plugin-shell';
import { BlinkoSnapStore } from "@/store/blinkoSnapStore";

//https://ld246.com/guide/markdown
type IProps = {
  mode: 'create' | 'edit',
  content: string,
  onChange?: (content: string) => void,
  onHeightChange?: () => void,
  onSend: (args: OnSendContentType) => Promise<any>,
  isSendLoading?: boolean,
  bottomSlot?: ReactElement<any, any>,
  originFiles?: Attachment[],
  originReference?: number[],
}

const Editor = observer(({ content, onChange, onSend, isSendLoading, originFiles, originReference = [], mode, onHeightChange }: IProps) => {
  const cardRef = React.useRef(null)
  const store = useLocalObservable(() => new EditorStore())
  const { t } = useTranslation()
  const blinkoSnap = RootStore.Get(BlinkoSnapStore)
  const blinko = RootStore.Get(BlinkoStore)
  useEditorInit(store, onChange, onSend, mode, content);
  useEditorEvents(store);
  useEditorFiles(store, blinko, originFiles);
  useEditorHeight(onHeightChange, blinko, content, store);

  const {
    getRootProps,
    isDragAccept,
    getInputProps,
    open
  } = useDropzone({
    multiple: true,
    noClick: true,
    onDrop: acceptedFiles => {
      store.uploadFiles(acceptedFiles)
    },
    onDragOver: (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onDragEnter: (e) => {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  const handleFileReorder = (newFiles: FileType[]) => {
    store.updateFileOrder(newFiles);
  };

  return <Card
    shadow='none' {...getRootProps()}
    className={`w-full h-full p-2 relative transition-all overflow-visible rounded-[0] bg-transparent flex flex-col
    ${isDragAccept ? 'border-2 border-green-500 border-dashed' : ''} `}>

    <div ref={cardRef}
      className="overflow-y-auto overflow-x-hidden relative flex-1 min-h-0"
      onKeyDown={e => {
        store.handleKeyDown(e)
      }}>

      <div id={`vditor-${mode}`} className="vditor" />

    </div>

    {/******************** AttchMent Render *****************/}
    {store.files.length > 0 && (
      <div className='w-full my-2 flex-shrink-0'>
        <AttachmentsRender files={store.files} onReorder={handleFileReorder} />
      </div>
    )}

    {/******************** Toolbar Render *****************/}
    <div className={`flex w-full items-center gap-1 flex-shrink-0 ${store.files.length > 0 ? 'mt-2' : 'mt-2'}`}>
      <NoteTypeButton />
      <HashtagButton store={store} content={content} />
      <UploadButtons
        getInputProps={getInputProps}
        open={open}
        onFileUpload={store.uploadFiles}
      />
      <div className='flex items-center gap-1 ml-auto'>
        <IconButton tooltip="Home" icon="lineicons:home-2" onClick={() => {
          openShell(blinkoSnap.settings.value?.blinkoEndpoint)
        }} />
        <SendButton store={store} isSendLoading={isSendLoading} />
      </div>
    </div>
  </Card >
})

export default Editor

