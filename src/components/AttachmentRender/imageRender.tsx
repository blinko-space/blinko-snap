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

  const imageHeight = useMemo(() => {
    if (!preview) {
      return 'h-[60px] w-[60px]'
    }

    const imageLength = images?.length
    if (columns) {
      return `max-h-[100px] w-auto`
    }
    if (imageLength == 1) {
      return `h-[200px] max-h-[200px] md:max-w-[200px]`
    }
    if (imageLength > 1 && imageLength <= 5) {
      return `md:h-[180px] h-[160px]`
    }
    if (imageLength > 5) {
      return `lg:h-[160px] md:h-[120px] h-[100px]`
    }
    return ''
  }, [images, preview, columns])

  const renderImage = (file: FileType) => (
    <div className={`relative group ${!preview ? 'min-w-[60px] flex-shrink-0' : 'w-full'} ${imageHeight}`}>
      {file.uploadPromise?.loading?.value && (
        <div className='absolute inset-0 flex items-center justify-center w-full h-full'>
          <Icon icon="line-md:uploading-loop" width="40" height="40" />
        </div>
      )}
      <div className='w-full'>
        <PhotoView src={file.preview}>
          <div>
            <ImageThumbnailRender
              src={file.preview}
              className={`mb-4 ${imageHeight} object-cover md:w-[1000px]`}
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
    <PhotoProvider>
      {
        images?.map(renderImage)
      }
    </PhotoProvider>
  )
})

export { ImageRender }