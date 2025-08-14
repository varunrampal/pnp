import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TopBar from './Components/TopBar';
import NavBar from './Components/NavBar';
import Carousel from './Components/Carousel';
import BottomFeatures from './Components/BottomFeatures';
import Footer from './Components/Footer';
import Home from './Pages/Home';
import About from './Pages/About';
import Contact from './Pages/Contact';
import SalesInfo from './Pages/SalesInfo';
import Quote from './Pages/Quote';
import Plants from './Pages/Plants';
import DragDrop from './Pages/DragDrop';
import Whatsapp from './Components/Whatsapp.jsx';
import AutoPopup from './Components/AutoPopup.jsx';

const App = () => {
  return (
      
    <>
    {/* <AutoPopup/> */}
    <TopBar/>
     <Router>
      <NavBar/>
   
      <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />   
            <Route path="/contact" element={<Contact />} />
            <Route path="/Sales/Information" element={<SalesInfo />} />
            <Route path="/Quote" element={<Quote />} />   
            <Route path="/Plants" element={<Plants />} />  
            <Route path="/dragdrop" element={<DragDrop/>} />  
               
          </Routes>
          <BottomFeatures/>
          <Footer/>
         
        </Router>
         <Whatsapp/>
       
 </>
  );
};


//  const printZPL = async () => {
//     const zpl = `
//       ^XA
//       ^FO50,50^A0N,50,50^FDHello Zebra ZT231^FS
//       ^FO50,120^BY2
//       ^BCN,100,Y,N,N
//       ^FD1234567890^FS
//       ^XZ
//     `;

//     try {
//       // NOTE: This fetch will only work if printer supports HTTP printing directly
//       await fetch("http://192.168.1.100:9100", {
//         method: "POST",
//         body: zpl,
//         headers: {
//           "Content-Type": "text/plain"
//         }
//       });
//       alert("Label sent to printer.");
//     } catch (err) {
//       console.error("Print failed:", err);
//       alert("Failed to print label.");
//     }
//   };

//   return (
//     <button onClick={printZPL} className="bg-blue-600 text-white px-4 py-2 rounded">
//       Print Label
//     </button>
//   );
//};

export default App;