import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ZoomImage from '../Components/ZoomImage ';

const ITEMS_PER_PAGE = 12;

const PaginatedFilterSearchSort = ({items}) => {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [visibleData, setVisibleData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOption, setSortOption] = useState('name-asc');
  
    useEffect(() => {
    setAllData(items);
    setFilteredData(items);
    setVisibleData(items.slice(0, ITEMS_PER_PAGE));
    setCurrentIndex(ITEMS_PER_PAGE);

  }, [items]);

  useEffect(() => {
    let filtered = [...allData];

    // Filter by category
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(item => item.Type === categoryFilter);
    }

    // Search by name
    if (searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.CommanName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort data
    filtered.sort((a, b) => {
      if (sortOption === 'name-asc') return a.Name.localeCompare(b.Name);
      if (sortOption === 'name-desc') return b.Name.localeCompare(a.Name);
      return 0;
    });

    setFilteredData(filtered);
    setVisibleData(filtered.slice(0, ITEMS_PER_PAGE));
    setCurrentIndex(ITEMS_PER_PAGE);
  }, [searchTerm, categoryFilter, sortOption, allData]);

  const loadMore = () => {
    const nextIndex = currentIndex + ITEMS_PER_PAGE;
    setVisibleData(filteredData.slice(0, nextIndex));
    setCurrentIndex(nextIndex);
  };

  const uniqueCategories = ['All', ...new Set(allData.map(item => item.Type))];

  return (
    <>
       <div class="container-fluid page-header py-5 mb-5 wow fadeIn" data-wow-delay="0.1s">
        <div class="container text-center py-5">
          <h1 class="display-3 text-white mb-4 animated slideInDown">Our Plants</h1>
        </div>
      </div>
      <div className="container">
  <div className="row mb-4 g-3">
        <div className="col-md-4">
          <input
            type="text"
            placeholder="Search by name..."
            className="form-control"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
          >
            <option value="name-asc">Sort: Name A–Z </option>
            <option value="name-desc">Sort: Name Z–A</option>
        
          </select>
        </div>
      </div>
        <div className="row">
          {visibleData.map((plant, index) => (
            <div className="col-md-3 mb-4" key={index}>

              <div className="plant-card">

                <ZoomImage
                  src={plant.Imgpath} alt={plant.Name}
                />

                <Link to={`/plant/${plant.slug}`} className="plant-name-link">
                  {plant.Name}
                </Link>
                <p className="plant-commanname">{plant.CommanName}</p>
                <p className="plant-category">{plant.Type}</p>
              </div>
            </div>
          ))}
               {/* Load More */}
      {currentIndex < filteredData.length && (
        <div class="center-button">
        <button className="btn btn-primary mt-3" onClick={loadMore}>
          Load More
        </button>
        </div>
      )}
        </div>
      </div>
   
    </>
  );
};

export default PaginatedFilterSearchSort;
