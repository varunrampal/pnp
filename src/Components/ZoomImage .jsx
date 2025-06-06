import React, { useState } from 'react';
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
        />
      </Zoom>
      
    
    </div>
  );
};

export default ZoomImage;