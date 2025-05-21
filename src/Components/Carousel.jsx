import React from 'react'
import { Link } from 'react-router-dom';
import image1 from "../assets/images/carousel-1.jpg";
import image2 from "../assets/images/carousel-2.jpg";   


const Carousel = () => {
  return (
    <div class="container-fluid p-0 wow fadeIn" data-wow-delay="0.1s">
    <div id="header-carousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
            <div class="carousel-item active">
                <img class="w-100" src={image1} alt="Image"/>
                <div class="carousel-caption">
                    <div class="container">
                        <div class="row justify-content-center">
                            <div class="col-lg-8">
                                {/* <h1 class="display-1 text-white mb-5 animated slideInDown">Wholesale BC Native Plants</h1> */}
                                <h1 class="text-white mb-5 animated slideInDown">Wholesale BC Native Plants</h1>
                                <Link to="/quote" class="btn btn-primary py-sm-3 px-sm-4">Get A Quote</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="carousel-item">
                <img class="w-100"  src={image2} alt="Image"/>
                <div class="carousel-caption">
                    <div class="container">
                        <div class="row justify-content-center">
                            <div class="col-lg-7">
                                {/* <h1 class="display-1 text-white mb-5 animated slideInDown">Best Quality Plants</h1> */}
                                <h1 class="text-white mb-5 animated slideInDown">Best Quality Plants</h1>
                                <a href="" class="btn btn-primary py-sm-3 px-sm-4">Our Plants</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#header-carousel"
            data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#header-carousel"
            data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
        </button>
    </div>
</div>
  )
}

export default Carousel