import React, { useState, useEffect } from 'react';

const ITEMS_PER_PAGE = 12;

const PaginatedFilterSearchSort = () => {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [visibleData, setVisibleData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOption, setSortOption] = useState('name-asc');

  useEffect(() => {
    fetch('/test.json')
      .then(res => res.json())
      .then(json => {
        setAllData(json);
        setFilteredData(json);
        setVisibleData(json.slice(0, ITEMS_PER_PAGE));
        setCurrentIndex(ITEMS_PER_PAGE);
        console.log('Data loaded:', json);
      });
  }, []);

  useEffect(() => {
    let filtered = [...allData];

    // Filter by category
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Search by name
    if (searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort data
    filtered.sort((a, b) => {
      if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
      if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
      if (sortOption === 'id-asc') return a.id - b.id;
      if (sortOption === 'id-desc') return b.id - a.id;
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

  const uniqueCategories = ['All', ...new Set(allData.map(item => item.category))];

  return (
    <>
    <div className="container py-4">
      <h2>Filter, Search & Sort List</h2>

      {/* Controls: Search, Filter, Sort */}
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
            <option value="name-asc">Sort: Name A–Z</option>
            <option value="name-desc">Sort: Name Z–A</option>
            <option value="id-asc">Sort: ID ↑</option>
            <option value="id-desc">Sort: ID ↓</option>
          </select>
        </div>
      </div>

      {/* List */}
      <ul className="list-group">
        {visibleData.map(item => (
          <li key={item.id} className="list-group-item d-flex justify-content-between">
            <span>{item.name}</span>
            <small className="text-muted">{item.category}</small>
          </li>
        ))}
      </ul>

      {/* Load More */}
      {currentIndex < filteredData.length && (
        <button className="btn btn-primary mt-3" onClick={loadMore}>
          Load More
        </button>
      )}
    </div>
    <div>asdsad</div>
    </>
  );
};

export default PaginatedFilterSearchSort;
