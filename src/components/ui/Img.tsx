import { getImageProps, type ImageProps } from 'next/image'
import { preload as preloadResource } from 'react-dom'

// next/image without its client component: getImageProps gives the same optimised srcset, sizes
// and lazy loading as a plain <img>, rendered on the server with nothing to hydrate (Next's docs:
// it avoids the component's state). The homepage has about thirty images, so this keeps them out
// of hydration. No `placeholder`: nothing would ever remove it. `preload` puts the image in the
// <head> at high priority, for the LCP image.

type ImgProps = Omit<
  ImageProps,
  'placeholder' | 'blurDataURL' | 'onLoad' | 'onError' | 'preload'
> & {
  preload?: boolean
}

export function Img({ className, preload = false, ...image }: ImgProps) {
  const { props } = getImageProps(image)
  if (preload && props.src) {
    preloadResource(props.src, {
      as: 'image',
      imageSrcSet: props.srcSet,
      imageSizes: props.sizes,
      fetchPriority: 'high',
    })
  }
  // eslint-disable-next-line @next/next/no-img-element -- this is next/image's own output
  return <img {...props} alt={props.alt} className={className} />
}
