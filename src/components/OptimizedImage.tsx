import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  lazyLoad?: boolean;
  fallbackSrc?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  lazyLoad = true,
  fallbackSrc = '/images/placeholder.jpg',
  className = '',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazyLoad);
  const [imageSrc, setImageSrc] = useState(lazyLoad ? '' : src);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!lazyLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setImageSrc(src);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading when image is 50px away from viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, lazyLoad]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      onError?.();
    }
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      onLoad={handleLoad}
      onError={handleError}
      loading={lazyLoad ? 'lazy' : 'eager'}
      decoding="async"
      {...props}
      style={{
        aspectRatio: width && height ? `${width}/${height}` : undefined,
        ...props.style,
      }}
    />
  );
};

// SEO-optimized image component for logos
export const CompanyLogoImage: React.FC<{
  src: string;
  companyName: string;
  size?: number;
  className?: string;
}> = ({ src, companyName, size = 40, className = '' }) => (
  <OptimizedImage
    src={src}
    alt={`${companyName} company logo`}
    width={size}
    height={size}
    className={`rounded-md object-contain ${className}`}
    fallbackSrc="/images/default-company-logo.png"
    lazyLoad={true}
  />
);

// SEO-optimized image for trip/route illustrations
export const RouteImage: React.FC<{
  src: string;
  fromCity: string;
  toCity: string;
  className?: string;
}> = ({ src, fromCity, toCity, className = '' }) => (
  <OptimizedImage
    src={src}
    alt={`Freight route from ${fromCity} to ${toCity}`}
    className={`rounded-lg object-cover ${className}`}
    fallbackSrc="/images/default-route.jpg"
    lazyLoad={true}
  />
);

// SEO-optimized profile/avatar image
export const ProfileImage: React.FC<{
  src: string;
  userName: string;
  size?: number;
  className?: string;
}> = ({ src, userName, size = 40, className = '' }) => (
  <OptimizedImage
    src={src}
    alt={`${userName} profile picture`}
    width={size}
    height={size}
    className={`rounded-full object-cover ${className}`}
    fallbackSrc="/images/default-avatar.jpg"
    lazyLoad={true}
  />
);