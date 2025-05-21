import React from 'react'
import { Link } from 'react-router-dom';

const Mission = () => {
  return (
    <div class="container-xxl py-5">
        <div class="container">
            <div class="row g-5 align-items-center">
                <div class="col-lg-6 wow fadeInUp" data-wow-delay="0.1s">
                    {/* <p class="fs-5 fw-bold text-primary">Why Choosing Us!</p> */}
                    <h1 class="display-5 mb-4">Our Mission & Commitment</h1>
                    <p class="mb-4">We are committed to satisfy each customer. We are not stopping until you are fully satisfied.</p>
                    <p>Our mission is to produce good quality plants at reasonable price. And we are committed to take the Nursery line of business to next level where Landscapers, Developers, Retail customers, and Garden centers can purchase any plants through us via online, phone or e-mail without visiting our Nursery. Once order is placed our team works very dedicatedly to complete the order and deliver.</p>
                    <Link to="/contact" class="btn btn-primary py-3 px-4">Contact Now</Link>
                </div>
                <div class="col-lg-6">
                    <div class="row g-4 align-items-center">
                        <div class="col-md-6">
                            <div class="row g-4">
                                <div class="col-12 wow fadeIn" data-wow-delay="0.3s">
                                    <div class="text-center rounded py-5 px-4" style={{boxShadow:'0 0 45px rgba(0,0,0,.08)'}}>
                                        <div class="btn-square bg-light rounded-circle mx-auto mb-4" style={{width:'90px',height:'90px'}}>
                                            <i class="fa fa-check fa-3x text-primary"></i>
                                        </div>
                                        <h4 class="mb-0">100% Satisfaction</h4>
                                    </div>
                                </div>
                                <div class="col-12 wow fadeIn" data-wow-delay="0.5s">
                                    <div class="text-center rounded py-5 px-4" style={{boxShadow:'0 0 45px rgba(0,0,0,.08)'}}>
                                        <div class="btn-square bg-light rounded-circle mx-auto mb-4" style={{width:'90px',height:'90px'}}>
                                            <i class="fa fa-users fa-3x text-primary"></i>
                                        </div>
                                        <h4 class="mb-0">Dedicated Team</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 wow fadeIn" data-wow-delay="0.7s">
                            <div class="text-center rounded py-5 px-4" style={{boxShadow:'0 0 45px rgba(0,0,0,.08)'}}>
                                <div class="btn-square bg-light rounded-circle mx-auto mb-4" style={{width:'90px',height:'90px'}}>
                                    <i class="fa fa-user fa-3x text-primary"></i>
                                </div>
                                <h4 class="mb-0">Years Of Experience </h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Mission