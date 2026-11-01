import { getImageProps, type ImageProps } from 'next/image'

// next/image without its client component: getImageProps gives the same optimised srcset, sizes
// and lazy loading as a plain <img>, rendered on the server with nothing to hydrate (Next's docs:
// it avoids the component's state). The homepage has about thirty images, so this keeps them out
// of hydration. No `placeholder`: nothing would ever remove it.

type ImgProps = Omit<ImageProps, 'placeholder' | 'blurDataURL' | 'onLoad' | 'onError'>

export function Img({ className, ...image }: ImgProps) {
  const { props } = getImageProps(image)
  // eslint-disable-next-line @next/next/no-img-element -- this is next/image's own output
  return <img {...props} alt={props.alt} className={className} />
}
