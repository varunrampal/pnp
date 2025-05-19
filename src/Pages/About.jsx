import React from 'react'
import AboutUs from '../Components/AboutUs'
// import { useLocation } from 'react-router-dom';

 const About = () => {
  // const location = useLocation();
  // const hiddenParam = location.state?.hiddenParam;
  // console.log("sdfsdf"+location.state);
  return (
    <>
    <div class="container-fluid page-header py-5 mb-5 wow fadeIn" data-wow-delay="0.1s">
        <div class="container text-center py-5">
            <h1 class="display-3 text-white mb-4 animated slideInDown">About Us</h1>
        </div>
    </div>

   <AboutUs/>
   </>
  )
}

export default About
