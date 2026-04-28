import React from 'react';
import { useParams, Link } from 'react-router-dom';
import items from '../json/PlantsList.json';
import ZoomImage from '../Components/ZoomImage ';

const PlantDetail = () => {
  const { slug } = useParams();
  const plant = items.find(p => p.slug === slug);

  if (!plant) {
    return <div>Plant not found</div>;
  }

  return (
    <>
    <div className="container-fluid page-header py-5 mb-5 wow fadeIn" data-wow-delay="0.1s">
      <div className="container text-center py-5">
        <h1 className="display-3 text-white mb-4 animated slideInDown">{plant.Name}</h1>
        <p className="text-white">{plant.CommanName}</p>
      </div>
    </div>
    <div className="container py-5">
      <div className="mb-4">
        <Link to="/plants" className="btn btn-secondary">← Back to Plants</Link>
      </div>
      <div className="row">
        <div className="col-md-6">
          <ZoomImage src={'.' + plant.Imgpath} alt={plant.Name} />
        </div>
        <div className="col-md-6">
          <h2>{plant.Name}</h2>
          <h4>{plant.CommanName}</h4>
          <p><strong>Category:</strong> {plant.Type}</p>
          <p><strong>Uses:</strong> {plant.Uses}</p>
          <p><strong>Mature Size:</strong> {plant.MatureSize}</p>
          <p><strong>Sun/Moisture Needs:</strong> {plant.SunMoisture}</p>
          <p><strong>Restoration Value:</strong> {plant.RestorationValue}</p>
          {plant.Description && <p><strong>Description:</strong> {plant.Description}</p>}
          {/* <div className="mt-4">
            <Link to="/quote" className="btn btn-primary">Get Quote</Link>
          </div> */}
        </div>
      </div>
    </div>
    </>
  );
};

export default PlantDetail;