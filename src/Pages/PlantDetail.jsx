import React from 'react';
import { useParams, Link } from 'react-router-dom';
import items from '../json/PlantsList.json';
import ZoomImage from '../Components/ZoomImage ';

const PlantDetail = () => {
  const { slug } = useParams();
  const plant = items.find(item => item.slug === slug);
  if (!plant) return <div className="container py-5">Plant not found.</div>;

  const specifications = [
    ['Plant type', plant.Type], ['Regional fit', plant.Region], ['Light', plant.Sun], ['Moisture', plant.Moisture],
    ['Soil', plant.Soil], ['Slope', plant.Slope], ['Mature size', plant.MatureSize], ['Establishment irrigation', plant.Irrigation],
  ];

  return <>
    <header className="container-fluid page-header py-5 mb-5">
      <div className="container py-5">
        <p className="hero-kicker">{plant.Type} · {plant.Region || 'British Columbia'}</p>
        <h1 className="display-3 text-white mb-3"><em>{plant.Name}</em></h1>
        <p className="text-white">{plant.CommanName}</p>
      </div>
    </header>
    <main className="container py-5">
      <div className="mb-5"><Link to="/plants" className="editorial-link">← Back to plant catalogue</Link></div>
      <div className="row g-5 plant-detail-layout">
        <div className="col-lg-6"><ZoomImage src={plant.Imgpath} alt={plant.CommanName || plant.Name} /></div>
        <div className="col-lg-6">
          <p className="editorial-kicker">SPECIES RECORD</p>
          <h2><em>{plant.Name}</em></h2>
          <h3 className="plant-detail-common">{plant.CommanName}</h3>
          {plant.Description && <p className="plant-detail-description">{plant.Description}</p>}
          <dl className="plant-specification-grid">{specifications.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Ask PEELS'}</dd></div>)}</dl>
          <div className="plant-function"><span>PROJECT USE</span><p>{plant.Uses || 'Contact PEELS for application guidance.'}</p><span>RESTORATION VALUE</span><p>{plant.RestorationValue || 'Contact PEELS for ecological-function guidance.'}</p></div>
          <Link to="/quote" className="btn btn-primary py-3 px-4">Add to project enquiry <i className="fa fa-arrow-right ms-3" aria-hidden="true"></i></Link>
        </div>
      </div>
    </main>
  </>;
};

export default PlantDetail;
