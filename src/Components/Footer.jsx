import React from 'react'
import { Link } from 'react-router-dom';
const Footer = () => {  
        const handleDownload = () => {
        const fileUrl = '../../files/PNP_Availability_List.xlsx';
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = 'PNP_Availability_List.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
  return (
    <div class="container-fluid bg-dark text-light footer mt-5 py-5 wow fadeIn" data-wow-delay="0.1s">
    <div class="container py-5">
        <div class="row g-5">
            <div class="col-lg-8 col-md-6">
                <h4 class="text-white mb-4">Our Office</h4>
                <p class="mb-2"><i class="fa fa-map-marker-alt me-3"></i>22064 64 Ave, Langley, BC, V2Y 2N8</p>
                <p class="mb-2"><i class="fa fa-phone-alt me-3"></i>604-217-1351</p>
                <p class="mb-2"><i class="fa fa-envelope me-3"></i>info@peelsnativeplants.com</p>
                <div class="d-flex pt-2">
                    <a class="btn btn-square btn-outline-light rounded-circle me-2" href=""><i class="fab fa-twitter"></i></a>
                    <a class="btn btn-square btn-outline-light rounded-circle me-2" href=""><i class="fab fa-facebook-f"></i></a>
                    <a class="btn btn-square btn-outline-light rounded-circle me-2" href=""><i class="fab fa-youtube"></i></a>
                    <a class="btn btn-square btn-outline-light rounded-circle me-2" href=""><i class="fab fa-linkedin-in"></i></a>
                </div>
            </div>
           
            <div class="col-lg-3 col-md-6">
                <h4 class="text-white mb-4">Quick Links</h4>
                <Link to="/" class="btn btn-link">Home</Link>
                <Link to="/about" class="btn btn-link">About</Link>
                <Link to="/contact" class="btn btn-link">Contact</Link>
                <Link to="/quote" class="btn btn-link">Get A Quote</Link>
                <Link to="/sales/information" class="btn btn-link">Sales Information</Link>
                <Link to="/plants" class="btn btn-link">Plants</Link>
                <Link to="" class="btn btn-link" onClick={handleDownload}>Availability List</Link>
            </div>
            {/* <div class="col-lg-3 col-md-6">
            <h4 class="text-white mb-4">Our Location</h4>
            <div class="map-container">
                <iframe title="Peel Native Plants Location"  src="https://www.google.com/maps?q=22064+64+Ave,+Langley,+BC,+V2Y+2N8&amp;output=embed" width="100%" height="250" loading="lazy" referrerpolicy="no-referrer-when-downgrade" style={{border:0}}></iframe>
                
                </div>
            </div> */}
            <div class="col-lg-12 col-md-6">
                <h4 class="text-white mb-4">Our Location</h4>
                <iframe title="Peel Native Plants Location"  src="https://www.google.com/maps?q=22064+64+Ave,+Langley,+BC,+V2Y+2N8&amp;output=embed" width="100%" height="350" loading="lazy" referrerpolicy="no-referrer-when-downgrade" style={{border:0}}></iframe>
              
            </div>
        </div>
    </div>
</div>
  )
}

export default Footer