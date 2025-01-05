import { useEffect, useState } from 'react';
import { FileIcons } from './FileIcon';
import { observer } from 'mobx-react-lite';
import { Attachment, FileType } from '../Editor/type';
import { DeleteIcon } from './icons';
import { ImageRender } from './imageRender';
import { HandleFileType } from '../Editor/editorUtils';

//https://www.npmjs.com/package/browser-thumbnail-generator

type IProps = {
  files: FileType[]
  preview?: boolean
  columns?: number
  onReorder?: (newFiles: FileType[]) => void
}

const AttachmentsRender = observer((props: IProps) => {
  const { files, preview = false } = props

  return (
    <div>
      {/* image render */}
      <ImageRender {...props} />

      {/* video render  */}
      <div className="columns-1 md:columns-1">
        {files?.filter(i => i.previewType == 'video').map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className='group relative flex p-2 items-center gap-2 cursor-pointer transition-all rounded-2xl'
          >
            <video
              onDoubleClick={(e) => e.stopPropagation()}
              src={file.preview}
              id="player"
              playsInline
              controls
              className='rounded-2xl w-full z-0 max-h-[150px]'
            />
            {!file.uploadPromise?.loading?.value && !preview &&
              <DeleteIcon className='absolute z-10 right-[5px] top-[5px]' files={files} file={file} />
            }
          </div>
        ))}
      </div>

      {/* other file render */}
      {
        files?.filter(i => i.previewType == 'other' || i.previewType == 'audio').map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className={`relative flex p-2 items-center gap-2 cursor-pointer 
              bg-sencondbackground hover:bg-hover transition-all rounded-md group
              ${!preview ? 'min-w-[200px] flex-shrink-0' : 'w-full'}`}
          >
            <FileIcons path={file.name} isLoading={file.uploadPromise?.loading?.value} />
          </div>
        ))
      }
    </div>
  )
})



const FilesAttachmentRender = observer(({
  files,
  preview,
  columns,
  onReorder
}: {
  files: Attachment[],
  preview?: boolean,
  columns?: number,
  onReorder?: (newFiles: Attachment[]) => void
}) => {
  const [handledFiles, setFiles] = useState<FileType[]>([]);

  useEffect(() => {
    setFiles(HandleFileType(files));
  }, [files]);

  const handleReorder = (newFiles: FileType[]) => {
    const newAttachments = files.slice().sort((a, b) => {
      const aIndex = newFiles.findIndex(f => f.name === a.name);
      const bIndex = newFiles.findIndex(f => f.name === b.name);
      return aIndex - bIndex;
    });
    onReorder?.(newAttachments);
  };

  return (
    <AttachmentsRender
      files={handledFiles}
      preview={preview}
      columns={columns}
      onReorder={handleReorder}
    />
  );
});


export { AttachmentsRender, FilesAttachmentRender }

