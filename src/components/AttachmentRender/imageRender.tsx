import { useEffect, useMemo, useState } from 'react';
import { FileType } from '../Editor/type';
import { Image } from '@nextui-org/react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { Icon } from '@iconify/react';
import { DeleteIcon } from './icons';
import { observer } from 'mobx-react-lite';

type IProps = {
  files: FileType[]
  preview?: boolean
  columns?: number
  onReorder?: (newFiles: FileType[]) => void
}
export const ImageThumbnailRender = ({ src, className }: { src: string, className?: string }) => {
  const [isOriginalError, setIsOriginalError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(
    `${src}?thumbnail=true`
  );

  useEffect(() => {
    if (isOriginalError) {
      setCurrentSrc('/image-fallback.svg')
    }
  }, [isOriginalError])

  return <Image
    src={currentSrc}
    classNames={{
      wrapper: '!max-w-full',
    }}
    radius='sm'
    draggable={false}
    onError={() => {
      if (src === currentSrc) {
        return setIsOriginalError(true)
      }
      setCurrentSrc(src)
    }}
    className={`object-cover w-full ${className}`}
  />
}

const ImageRender = observer((props: IProps) => {
  const { files, preview = false, columns } = props
  const images = files?.filter(i => i.previewType == 'image')


  const renderImage = (file: FileType) => (
    <div className={`relative group w-[60px]`}>
      {file.uploadPromise?.loading?.value && (
        <div className='absolute inset-0 flex items-center justify-center w-full h-full'>
          <Icon icon="line-md:uploading-loop" width="40" height="40" />
        </div>
      )}
      <div className='w-full flex items-center'>
        <PhotoView src={file.preview}>
          <div className='w-full'>
            <ImageThumbnailRender
              src={file.preview}
              className={`mb-4 object-cover md:w-[1000px] h-[60px]`}
            />
          </div>
        </PhotoView>
      </div>
      {!file.uploadPromise?.loading?.value && !preview &&
        <DeleteIcon className='absolute z-10 right-[5px] top-[5px]' files={files} file={file} />
      }
    </div>
  )

  return (
    <PhotoProvider className='w-full flex gap-2'>
      <div className='w-full flex gap-2'>
        {
          images?.map(renderImage)
        }
      </div>
    </PhotoProvider>
  )
})

export { ImageRender }