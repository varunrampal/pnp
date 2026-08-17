import React from 'react'
import { Link, useLocation } from 'react-router-dom';
import AboutImage from "../assets/images/about.jpg";

const AboutUs = () => {

    const location = useLocation();
    const isAboutPage = location.state?.hiddenParam || false; // Default to false if not provided

    let lnkbtn;
    
    if(!isAboutPage){

        lnkbtn= <Link to="/about" class="btn btn-primary py-3 px-4">Explore More</Link>
    }
    
  return (
    <div class="container-xxl py-5 editorial-section about-editorial">
        <div class="container">
            <div class="row g-5 align-items-end">
                <div class="col-lg-3 col-md-5 wow fadeInUp" data-wow-delay="0.1s">
                    <figure className="botanical-figure">
                        <img class="img-fluid" data-wow-delay="0.1s" src={AboutImage} alt="PEELS native plant nursery in Langley, BC" width="500" height="1000" loading="lazy" decoding="async"/>
                        <figcaption>Propagation · Fraser Valley</figcaption>
                    </figure>
                </div>
                <div class="col-lg-6 col-md-7 wow fadeInUp" data-wow-delay="0.3s">
                    {/* <h1 class="display-1 text-primary mb-0">25</h1>
                    <p class="text-primary mb-4">Year of Experience</p> */}
                    <p className="editorial-kicker">SPECIALIST NATIVE-PLANT GROWERS</p>
                    <h2 class="display-5 mb-4">Rooted in the Fraser Valley</h2>
                    <p class="mb-4">PEELS propagates and grows native plant material for landscapes where ecological performance matters. Our Langley nursery supports restoration teams, landscape professionals, municipalities and land stewards working throughout British Columbia.</p>
                    <p className="mb-4">We focus on vigorous roots, reliable establishment and practical species guidance. From a focused planting plan to a multi-phase restoration contract, every order receives the same horticultural attention and responsive coordination.</p>
                
{lnkbtn}
                  

                </div>
                <div class="col-lg-3 col-md-12 wow fadeInUp" data-wow-delay="0.5s">
                    <div class="row g-5">
                        <div class="col-12 col-sm-6 col-lg-12">
                            <div class="border-start ps-4">
                                <i class="fa fa-award fa-3x text-primary mb-3"></i>
                                <h4 class="mb-3">Purpose-grown stock</h4>
                                <span>Native plant material cultivated for professional installation and establishment.</span>
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-lg-12">
                            <div class="border-start ps-4">
                                <i class="fa fa-users fa-3x text-primary mb-3"></i>
                                <h4 class="mb-3">Regional knowledge</h4>
                                <span>Practical guidance informed by BC growing conditions and ecological applications.</span>
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
