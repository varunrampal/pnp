import React from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

const ZoomImage = ({ src, alt}) => {
   
  return (
    <div className="zoom-container">
      <Zoom>
        <img
          src={src}
          alt={alt}
          className="zoomable-image"
          loading="lazy"
          decoding="async"
        />
      </Zoom>
      
    
    </div>
  );
};

export default ZoomImage;
