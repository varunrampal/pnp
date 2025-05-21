import React from 'react'
import { BrowserRouter as Router, Route, Link, useLocation } from 'react-router-dom';
import AboutImage from "../assets/images/about.jpg";

const AboutUs = () => {

    const location = useLocation();
    const isAboutPage = location.state?.hiddenParam || false; // Default to false if not provided

    let lnkbtn;
    
    if(!isAboutPage){

        lnkbtn= <Link to="/about" class="btn btn-primary py-3 px-4">Explore More</Link>
    }
    
  return (
    <div class="container-xxl py-5">
        <div class="container">
            <div class="row g-5 align-items-end">
                <div class="col-lg-3 col-md-5 wow fadeInUp" data-wow-delay="0.1s">
                    <img class="img-fluid rounded" data-wow-delay="0.1s" src={AboutImage}/>
                </div>
                <div class="col-lg-6 col-md-7 wow fadeInUp" data-wow-delay="0.3s">
                    {/* <h1 class="display-1 text-primary mb-0">25</h1>
                    <p class="text-primary mb-4">Year of Experience</p> */}
                    <h1 class="display-5 mb-4">Grow with Peel Native Plants Ltd.!</h1>
                    <p class="mb-4">Located in the heart of the Lower Mainland, Peel Native Plants Ltd. proudly specializes in the propagation and cultivation of top-quality BC native plants. Our plants are ideal for commercial and residential landscapes, habitat and wetland restoration, stream rehabilitation, mitigation projects, highways, parks, and more.

With one of the largest inventories in the region and unmatched growing capabilities, we are ready to supply all your wholesale native plant needs — big or small!

At Peel Native Plants, we’re passionate about delivering exceptional plants and outstanding customer service. Let’s grow success together!</p>
                
{lnkbtn}
                  

                </div>
                <div class="col-lg-3 col-md-12 wow fadeInUp" data-wow-delay="0.5s">
                    <div class="row g-5">
                        <div class="col-12 col-sm-6 col-lg-12">
                            <div class="border-start ps-4">
                                <i class="fa fa-award fa-3x text-primary mb-3"></i>
                                <h4 class="mb-3">Best Selling Plants</h4>
                                <span>We strive every day to produce the best quality plants</span>
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-lg-12">
                            <div class="border-start ps-4">
                                <i class="fa fa-users fa-3x text-primary mb-3"></i>
                                <h4 class="mb-3">Dedicated Team</h4>
                                <span>Dedicated team to provide quality support and advice.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default AboutUs