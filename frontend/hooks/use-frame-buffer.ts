import { useRef, useEffect, useState } from 'react';

export function useFrameBuffer(images: string[], currentFrame: number, bufferSize = 50) {
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (images.length === 0) return;
    const rangeEnd = Math.min(currentFrame + bufferSize, images.length);
    const urlsToLoad = images.slice(currentFrame, rangeEnd);

    if (currentFrame > 0) urlsToLoad.push(images[0]);

    urlsToLoad.forEach((url) => {
      if (!imageCache.current.has(url)) {
        const img = new Image();
        img.src = url;
        if ('decode' in img) {
          img.decode().then(() => {
            imageCache.current.set(url, img);

            if (url === images[currentFrame]) setIsReady(true);
          }).catch(() => {
            imageCache.current.set(url, img);
          })
        } 
      } else {
        if (url === images[currentFrame]) setIsReady(true);
      }
    })
  }, [images, currentFrame, bufferSize]);
  return { 
    getImage: (index: number) => imageCache.current.get(images[index]),
    isReady 
  }
}