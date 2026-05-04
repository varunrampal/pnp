import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import TopBar from './Components/TopBar';
import NavBar from './Components/NavBar';
import BottomFeatures from './Components/BottomFeatures';
import Footer from './Components/Footer';
import Whatsapp from './Components/Whatsapp.jsx';
import SEO from './Components/SEO.jsx';
import Spinner from './Components/Spinner.jsx';

const Home = lazy(() => import('./Pages/Home'));
const About = lazy(() => import('./Pages/About'));
const Contact = lazy(() => import('./Pages/Contact'));
const SalesInfo = lazy(() => import('./Pages/SalesInfo'));
const Quote = lazy(() => import('./Pages/Quote'));
const Plants = lazy(() => import('./Pages/Plants'));
const PlantAdvisor = lazy(() => import('./Pages/PlantAdvisor'));
const FAQPage = lazy(() => import('./Pages/FaqPage'));
const DragDrop = lazy(() => import('./Pages/DragDrop'));
const PlantDetail = lazy(() => import('./Pages/PlantDetail'));
const Admin = lazy(() => import('./Pages/Admin'));

const CanonicalRedirect = () => {
  const location = useLocation();
  const normalizedPath = location.pathname.toLowerCase().replace(/\/+$/, '') || '/';

  if (location.pathname !== normalizedPath) {
    return <Navigate to={`${normalizedPath}${location.search}${location.hash}`} replace />;
  }

  return null;
};

const App = () => {
  return (
      
    <>
    {/* <AutoPopup/> */}
    <TopBar/>
     <Router>
      <NavBar/>
      <SEO/>
      <CanonicalRedirect/>
   
      <Suspense fallback={<Spinner/>}>
      <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />   
            <Route path="/contact" element={<Contact />} />
            <Route path="/sales/information" element={<SalesInfo />} />
            <Route path="/quote" element={<Quote />} />   
            <Route path="/plants" element={<Plants />} />
            <Route path="/plant-advisor" element={<PlantAdvisor />} />
            <Route path="/plant/:slug" element={<PlantDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/plants/:slug/edit" element={<Admin />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/dragdrop" element={<DragDrop/>} />  
            <Route path="*" element={<Navigate to="/" replace />} />
               
          </Routes>
          </Suspense>
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
