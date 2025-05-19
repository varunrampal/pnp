import React, { useRef,useState } from 'react';
import emailjs from '@emailjs/browser';
import ReactJsAlert from "reactjs-alert";
import ContactUs from '../Components/ContactUs'

const Contact = () => {
  return (
    <>
    <div class="container-fluid page-header py-5 mb-5 wow fadeIn" data-wow-delay="0.1s">
        <div class="container text-center py-5">
            <h1 class="display-3 text-white mb-4 animated slideInDown">Contact Us</h1>
        </div>
    </div>
<ContactUs/>
  
   </>
  )
}

export default Contact