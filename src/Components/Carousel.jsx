import React from 'react'
import { Link } from 'react-router-dom';
import image1 from "../assets/images/peels/nursery-hero.jpg";

const availabilityUrl = '/files/PEELS-Native-Plants-Availability.pdf';


const Carousel = () => {
    return (
        <section className="editorial-hero static-hero wow fadeIn" data-wow-delay="0.1s" aria-labelledby="home-hero-title">
            <img className="static-hero__image" src={image1} alt="Rows of project-ready native plants growing at PEELS" width="1920" height="1080" decoding="async" fetchPriority="high" />
            <div className="static-hero__veil" aria-hidden="true"></div>
            <div className="container static-hero__content">
                <div className="row">
                    <div className="col-lg-8 col-xl-7">
                        <p className="hero-kicker">PEELS · NATIVE PLANTS · LANGLEY, BC</p>
                        <h1 id="home-hero-title" className="text-white mb-4">Native plants for living systems.</h1>
                        <p className="hero-deck mb-5">Specialist-grown plant material for ecological restoration, habitat renewal and resilient landscapes across British Columbia.</p>
                        <div className="hero-actions">
                            <Link to="/plants" className="btn btn-primary py-3 px-4">Explore Plants<i className="fa fa-arrow-right ms-3" aria-hidden="true"></i></Link>
                            <a href={availabilityUrl} download className="btn btn-outline-light py-3 px-4">View Availability<i className="fa fa-download ms-3" aria-hidden="true"></i></a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="static-hero__note" aria-label="Image context">
                <span>PROJECT-READY STOCK</span>
                <span>FRASER VALLEY · BC</span>
            </div>
            <a className="static-hero__scroll" href="#home-capabilities" aria-label="Continue to PEELS capabilities">
                <span>DISCOVER</span>
                <i className="fa fa-arrow-down" aria-hidden="true"></i>
            </a>
        </section>
    )
}

export default Carousel
