import React from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

const DEFAULT_IMAGE = '/images/plants/default.jpg';

const imagePath = (src) => {
  if (!src || src.includes('default.jpg')) return DEFAULT_IMAGE;

  return String(src).replace(/^(?:\.\.\/|\.\/)/, '/');
};

const handleImageError = (event) => {
  if (event.currentTarget.src.endsWith(DEFAULT_IMAGE)) return;

  event.currentTarget.src = DEFAULT_IMAGE;
};

const ZoomImage = ({ src, alt}) => {
   
  return (
    <div className="zoom-container">
      <Zoom>
        <img
          src={imagePath(src)}
          alt={alt}
          className="zoomable-image"
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
      </Zoom>
      
    
    </div>
  );
};

export default ZoomImage;
