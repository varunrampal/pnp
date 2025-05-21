import React, { useRef,useState } from 'react';
import emailjs from '@emailjs/browser';
import ReactJsAlert from "reactjs-alert";

const Quote = () => {

    const form = useRef();
    const [status, setStatus] = useState(false);
    const [type, setType] = useState("success");
    const [title, setTitle] = useState("Thank you for your inquiry. We will get back to you as soon as possible.");
    const sendEmail = (e) => {
      e.preventDefault();
     
     
      emailjs
        .sendForm('service_9wwh682', 'template_v3t8cy4', form.current, {
          publicKey: 'LjissUB9pujYt6oa7',
        })
        .then(
          () => {
            console.log('SUCCESS!');

          setStatus(true);
          setType("success");
          setTitle("Thank you for your inquiry. We will get back to you as soon as possible.");
  
          },
          (error) => {
            console.log('FAILED...', error.text);
          },
        );
    };


  return (
    <>
    <div class="container-fluid py-5">
    <div class="container">
        <div class="text-center mx-auto wow fadeInUp" data-wow-delay="0.1s" style={{maxHeight:'500px'}}>
            <p class="fs-5 fw-bold text-primary">Quote</p>
            <h1 class="display-5 mb-5">Get A Quote</h1>
        </div>
        <form class="formContainer" ref={form} onSubmit={sendEmail}>
        <div class="row justify-content-center">
            
            <div class="col-lg-7">
                <div class="bg-light rounded p-4 p-sm-5 wow fadeInUp" data-wow-delay="0.1s">
                    <div class="row g-3">
                    <div class="col-sm-6">
                            <div class="form-floating">
                                <input type="text" class="form-control border-0" id="cname" name='cname' placeholder="GreenGrow Landscaping"/>
                                <label for="cage">Company Name</label>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <div class="form-floating">
                                <input type="text" class="form-control border-0" id="name" name='name' placeholder="John Smith"/>
                                <label for="gname">Full Name</label>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <div class="form-floating">
                                <input type="email" class="form-control border-0" id="email" name='email' placeholder="example@gmail.com"/>
                                <label for="gmail">Email</label>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <div class="form-floating">
                                <input type="text" class="form-control border-0" id="phone" name='phone' placeholder="604-217-1351"/>
                                <label for="cname">Phone Number</label>
                            </div>
                        </div>
                       
                        <div class="col-12">
                            <div class="form-floating">
                                <textarea class="form-control border-0" placeholder="e.g. 20x Red Maple 10-gallon, 30x Blue Spruce Plugs" id="message" name='message' style={{height:'200px'}}/>
                                <label for="message">Plant Name, Quantity, Size</label>
                            </div>
                        </div>
                        <div class="col-12 text-center">
                            <button class="btn btn-primary py-3 px-4" type="submit">Submit Quote</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </form>
    </div>
</div>
<ReactJsAlert
        status={status}
        type={type}
        title={title}
        Close={() => setStatus(false)}
      />
</>
  )
}

export default Quote