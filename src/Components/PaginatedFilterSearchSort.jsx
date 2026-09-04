import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ZoomImage from '../Components/ZoomImage ';

const ITEMS_PER_PAGE = 12;
const valuesFor = (items, field) => ['All', ...new Set(items.map(item => item[field]).filter(Boolean))];

const PaginatedFilterSearchSort = ({ items }) => {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [moistureFilter, setMoistureFilter] = useState('All');
  const [sunFilter, setSunFilter] = useState('All');
  const [sortOption, setSortOption] = useState('name-asc');

  const categories = useMemo(() => valuesFor(items, 'Type'), [items]);
  const moistureOptions = useMemo(() => valuesFor(items, 'Moisture'), [items]);
  const sunOptions = useMemo(() => valuesFor(items, 'Sun'), [items]);

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const filtered = items.filter(item => {
      const matchesSearch = !query || item.Name?.toLowerCase().includes(query) || item.CommanName?.toLowerCase().includes(query);
      return matchesSearch
        && (categoryFilter === 'All' || item.Type === categoryFilter)
        && (moistureFilter === 'All' || item.Moisture === moistureFilter)
        && (sunFilter === 'All' || item.Sun === sunFilter);
    });

    return filtered.sort((a, b) => sortOption === 'name-desc'
      ? b.Name.localeCompare(a.Name)
      : a.Name.localeCompare(b.Name));
  }, [items, searchTerm, categoryFilter, moistureFilter, sunFilter, sortOption]);

  useEffect(() => setVisibleCount(ITEMS_PER_PAGE), [searchTerm, categoryFilter, moistureFilter, sunFilter, sortOption]);

  return (
    <>
      <div className="container-fluid page-header catalogue-header py-5 mb-5 wow fadeIn" data-wow-delay="0.1s">
        <div className="container py-5">
          <p className="hero-kicker">PEELS PLANT CATALOGUE</p>
          <h1 className="display-3 text-white mb-4">Plants for site and function</h1>
          <p className="catalogue-intro">Review growing conditions, mature size and restoration value, then open a species record for project details.</p>
        </div>
      </div>
      <div className="container catalogue-shell">
        <div className="catalogue-toolbar">
          <div><strong>{filteredData.length} species</strong><p>Filter the working catalogue by plant type and site conditions.</p></div>
          <a href="/files/PEELS-Native-Plants-Availability.pdf" download className="editorial-link">Download current availability <i className="fa fa-download" aria-hidden="true"></i></a>
        </div>
        <div className="row mb-5 g-3 catalogue-filters">
          <div className="col-lg-4"><label htmlFor="plant-search">Search</label><input id="plant-search" type="search" placeholder="Botanical or common name" className="form-control" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} /></div>
          <div className="col-lg-2 col-md-4"><label htmlFor="plant-type">Plant type</label><select id="plant-type" className="form-select" value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)}>{categories.map(value => <option key={value}>{value}</option>)}</select></div>
          <div className="col-lg-2 col-md-4"><label htmlFor="plant-moisture">Moisture</label><select id="plant-moisture" className="form-select" value={moistureFilter} onChange={event => setMoistureFilter(event.target.value)}>{moistureOptions.map(value => <option key={value} value={value}>{value === 'All' ? 'All moisture' : value}</option>)}</select></div>
          <div className="col-lg-2 col-md-4"><label htmlFor="plant-sun">Exposure</label><select id="plant-sun" className="form-select" value={sunFilter} onChange={event => setSunFilter(event.target.value)}>{sunOptions.map(value => <option key={value} value={value}>{value === 'All' ? 'All exposure' : value}</option>)}</select></div>
          <div className="col-lg-2 col-md-4"><label htmlFor="plant-sort">Sort</label><select id="plant-sort" className="form-select" value={sortOption} onChange={event => setSortOption(event.target.value)}><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option></select></div>
        </div>
        <div className="row">
          {filteredData.slice(0, visibleCount).map(plant => (
            <div className="col-xl-3 col-lg-4 col-md-6 mb-4" key={plant.slug}>
              <article className="plant-card">
                <ZoomImage src={plant.Imgpath} alt={plant.CommanName || plant.Name} />
                <Link to={`/plant/${plant.slug}`} className="plant-name-link"><em>{plant.Name}</em></Link>
                <p className="plant-commanname">{plant.CommanName}</p>
                <p className="plant-category">{plant.Type} · {plant.Region || 'British Columbia'}</p>
                <dl className="plant-card-specs">
                  <div><dt>Light</dt><dd>{plant.Sun || 'Ask PEELS'}</dd></div>
                  <div><dt>Moisture</dt><dd>{plant.Moisture || 'Ask PEELS'}</dd></div>
                  <div><dt>Size</dt><dd>{plant.MatureSize || 'Varies'}</dd></div>
                </dl>
                <Link to={`/plant/${plant.slug}`} className="plant-card-link">View species record <i className="fa fa-arrow-right" aria-hidden="true"></i></Link>
              </article>
            </div>
          ))}
          {filteredData.length === 0 && <p className="catalogue-empty">No plants match these filters. Adjust the site conditions or contact PEELS for guidance.</p>}
          {visibleCount < filteredData.length && <div className="center-button"><button className="btn btn-primary mt-3" onClick={() => setVisibleCount(count => count + ITEMS_PER_PAGE)}>Load more</button></div>}
        </div>
      </div>
    </>
  );
};

export default PaginatedFilterSearchSort;
