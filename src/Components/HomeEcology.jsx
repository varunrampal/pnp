import React from 'react';
import { Link } from 'react-router-dom';
import propagationImage from '../assets/images/peels/propagation-detail.jpg';
import restorationImage from '../assets/images/peels/riparian-restoration.jpg';

const applications = [
  { number: '01', title: 'Riparian restoration', copy: 'Trees, shrubs, sedges and live stakes selected for stream edges, bank stability and layered habitat.' },
  { number: '02', title: 'Wetland systems', copy: 'Moisture-responsive plant material for wetland margins, stormwater landscapes and transitional zones.' },
  { number: '03', title: 'Habitat renewal', copy: 'Native plant communities that provide food, shelter and structural diversity for local wildlife.' },
  { number: '04', title: 'Resilient landscapes', copy: 'Regionally appropriate species for parks, green infrastructure and enduring designed landscapes.' },
  { number: '05', title: 'Mitigation & reclamation', copy: 'Project-scale supply for disturbed sites where establishment, function and dependable delivery matter.' },
  { number: '06', title: 'Municipal planting', copy: 'Consistent nursery stock and practical support for public-realm and infrastructure projects.' },
];

const operatingModel = [
  { number: '01', title: 'Understand the site', copy: 'We begin with location, exposure, moisture, soil, schedule and the ecological outcomes the planting needs to support.' },
  { number: '02', title: 'Align the material', copy: 'Species, formats and quantities are reviewed against site realities—not simply pulled from a generic plant list.' },
  { number: '03', title: 'Prepare for establishment', copy: 'Plant quality, root health and order readiness are considered together so material arrives prepared for professional installation.' },
  { number: '04', title: 'Coordinate the project', copy: 'Clear communication around availability, substitutions, timing and delivery helps complex planting work move forward.' },
];

const HomeEcology = () => (
  <>
    <section className="home-positioning editorial-section" aria-labelledby="positioning-title">
      <div className="container">
        <div className="row g-5 align-items-end">
          <div className="col-lg-7">
            <p className="editorial-kicker">PLANTS WITH A PURPOSE</p>
            <h2 id="positioning-title" className="display-5">Grown for the work landscapes need to do.</h2>
          </div>
          <div className="col-lg-5">
            <p className="positioning-copy">PEELS is a specialist native-plant grower serving restoration professionals, landscape architects, contractors, municipalities and land stewards across British Columbia.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="applications" className="home-applications editorial-section" aria-labelledby="applications-title">
      <div className="container">
        <div className="row g-5 mb-5 align-items-end">
          <div className="col-lg-7">
            <p className="editorial-kicker">BUILT FOR THE SITE</p>
            <h2 id="applications-title" className="display-5">Ecological applications</h2>
          </div>
          <div className="col-lg-5">
            <img src={restorationImage} className="applications-landscape" alt="Native riparian vegetation establishing along a coastal BC stream" loading="lazy" decoding="async" />
          </div>
        </div>
        <div className="application-grid">
          {applications.map(application => (
            <article className="application-item" key={application.number}>
              <span>{application.number}</span>
              <h3>{application.title}</h3>
              <p>{application.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section id="expertise" className="home-expertise editorial-section" aria-labelledby="expertise-title">
      <div className="container">
        <div className="row g-5 align-items-center">
          <div className="col-lg-5">
            <figure className="botanical-figure expertise-figure">
              <img src={propagationImage} alt="Nursery grower inspecting the roots of a native seedling" loading="lazy" decoding="async" />
              <figcaption>ROOT HEALTH · PROPAGATION · ESTABLISHMENT</figcaption>
            </figure>
          </div>
          <div className="col-lg-6 offset-lg-1">
            <p className="editorial-kicker">FROM PROPAGATION TO PROJECT</p>
            <h2 id="expertise-title" className="display-5">Horticultural rigour. Ecological intent.</h2>
            <p>Healthy landscapes begin with healthy plant material. PEELS combines disciplined nursery practice with regional knowledge and responsive project support.</p>
            <dl className="expertise-list">
              <div><dt>01</dt><dd><strong>Purpose-grown stock</strong><span>Consistent material cultivated for professional installation.</span></dd></div>
              <div><dt>02</dt><dd><strong>Site-informed guidance</strong><span>Practical support for moisture, exposure, soil and restoration function.</span></dd></div>
              <div><dt>03</dt><dd><strong>Project-scale supply</strong><span>Inventory depth and coordination for demanding schedules.</span></dd></div>
            </dl>
            <Link to="/about" className="editorial-link">How PEELS grows <i className="fa fa-arrow-right" aria-hidden="true"></i></Link>
          </div>
        </div>
      </div>
    </section>

    <section className="home-operations editorial-section" aria-labelledby="operations-title">
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-4">
            <div className="operations-intro">
              <p className="editorial-kicker">HOW PEELS WORKS</p>
              <h2 id="operations-title" className="display-5">From site conditions to planting day.</h2>
              <p>Our value is not only what we grow. It is how horticultural knowledge, ecological intent and project coordination come together around every order.</p>
              <Link to="/contact" className="editorial-link">Discuss your project <i className="fa fa-arrow-right" aria-hidden="true"></i></Link>
            </div>
          </div>
          <div className="col-lg-7 offset-lg-1">
            <div className="operations-list">
              {operatingModel.map(item => (
                <article className="operation-row" key={item.number}>
                  <span>{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="home-project-cta" aria-labelledby="project-cta-title">
      <div className="container">
        <div className="row g-4 align-items-center">
          <div className="col-lg-8">
            <p className="editorial-kicker">PLANNING A PROJECT?</p>
            <h2 id="project-cta-title">Let’s assemble the right plant material.</h2>
          </div>
          <div className="col-lg-4 text-lg-end">
            <Link to="/quote" className="btn btn-outline-light py-3 px-4">Request a quote <i className="fa fa-arrow-right ms-3" aria-hidden="true"></i></Link>
          </div>
        </div>
      </div>
    </section>
  </>
);

export default HomeEcology;
