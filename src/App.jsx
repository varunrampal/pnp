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
    <AutoPopup/>
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
            plantstest   
          </Routes>
          <BottomFeatures/>
          <Footer/>
         
        </Router>
         <Whatsapp/>
       
 </>
  );
};

export default App;