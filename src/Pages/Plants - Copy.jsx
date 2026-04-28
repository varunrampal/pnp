import { React, useState, useEffect } from 'react'
import plants from '../json/PlantsList.json'

const Plants = () => {
  const [plantsList, setPlantsList] = useState([]);
  const itemsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState('');
  const items = plants;


  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const currentItems = items.slice(startIndex, endIndex);

  useEffect(() => {
    setPlantsList(plants);
    console.log('I am called1');
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    console.log('I am called2');
    
  }, [searchFilter]);


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };


  const handleFilter = (e) => {
    setSearchFilter(e.target.value);

  };

  const filteredData = items.filter(
    (item) =>
      item.Name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.CommanName.toLowerCase().includes(searchFilter.toLocaleLowerCase())

  );


  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

 

  return (
    <>
      <div class="container-fluid page-header py-5 mb-5 wow fadeIn" data-wow-delay="0.1s">
        <div class="container text-center py-5">
          <h1 class="display-3 text-white mb-4 animated slideInDown">Our Plants</h1>
        </div>
      </div>
      <div className="container">
        <input
          style={{ width: "200px" }}
          className='form-control mb-2'
          placeholder='Search'
          value={searchFilter}
          onChange={handleFilter}
        />
        <div className="row">
          {paginatedData.map((plant, index) => (
            <div className="col-md-3 mb-4" key={index}>

              <div className="plant-card">
                {/* <div className="card-body"> */}
                <img class="card-img-top" src={plant.Imgpath} alt={plant.Name}></img>
                <h5>{plant.Name}</h5>
                <h5>{plant.CommanName}</h5>
                <p class="plant-category">{plant.Type}</p>
                {/* </div> */}
              </div>
            </div>
          ))}
        </div>
      </div>
      <nav>
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <li className={`page-item ${currentPage === pageNumber ? 'active' : ''}`} key={pageNumber}>
              <button className="page-link" onClick={() => handlePageChange(pageNumber)}>{pageNumber}</button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
          </li>
        </ul>
      </nav>

    </>
  )
}

export default Plants