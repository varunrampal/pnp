import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import roseImage from '../../public/images/plants/Rose-Magic-Meidiland.webp'; // Example image path, adjust as needed
   
    
    function AutoPopup() {
      const [open, setOpen] = useState(false);
      
    
      useEffect(() => {
        const timer = setTimeout(() => {
          setOpen(true);
        }, 2000); // Show popup after 2 seconds
    
        return () => clearTimeout(timer); // Clear timeout if component unmounts
      }, []);
    
      const closePopup = () => setOpen(false);
    
      return (
        <div>
          <Popup open={open} closeOnDocumentClick onClose={closePopup} position="left bottom" contentStyle={{paddingTop:'20px', backgroundColor:'#ffffff'}}>
            
          <div  >
          <img src={roseImage} alt="logo"style={{maxHeight: '100px', maxWidth:'100px'}} />
          <h4>Rosa Nutkana on Sale - #1 for $4.50</h4>
          {/* <p>Contact us on info@peelsnativeplants.com or 604-217-13551</p> */}
          <p><a href="" className='btn btn-link'>Check our June Sale</a></p>
          <button onClick={() => setOpen(false)}>Close</button>
        </div>
        
          </Popup>
        </div>
      );
    }
    
    export default AutoPopup;