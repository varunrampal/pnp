import { React, useState, useEffect } from 'react'
import plants from '../json/PlantsList.json'
import CustomPagination from '../Components/CustomPagination';
import ZoomImage from '../Components/ZoomImage ';
import Modal from '../Components/Modal';
const Plants1 = () => {
  const [plantsList, setPlantsList] = useState([]);
  const itemsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState('');
  const items = plants;


  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const currentItems = items.slice(startIndex, endIndex);
  const pageSize = 12;

  const [activeItemId, setActiveItemId] = useState(null);
  const openModal = (id) => setActiveItemId(id);
  const closeModal = () => setActiveItemId(null);

  useEffect(() => {
    setPlantsList(plants);

  }, []);

  useEffect(() => {
    setCurrentPage(1);

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
    (currentPage - 1) * pageSize,
    currentPage * pageSize
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
          placeholder='Search Plant'
          value={searchFilter}
          onChange={handleFilter}
        />
        <div className="row">
          {paginatedData.map((plant, index) => (
            <div className="col-md-3 mb-4" key={index}>

              <div className="plant-card">

                <ZoomImage
                  src={plant.Imgpath} alt={plant.Name}
                />

                <a href="#" class="plant-name-link" onClick={(e) => { e.preventDefault(); openModal(index); }}>
                  {plant.Name}
                </a>
                <p class="plant-commanname">{plant.CommanName}</p>
                <p class="plant-category">{plant.Type}</p>
                <Modal isOpen={activeItemId === index} onClose={closeModal}>
                 

                  <div class="container py-4">

                    {/* <!-- Row 1: Full Width --> */}
                    <div class="row mb-4">
                      <div class="col">
                        <div class="p-4">
                           <h2>{plant.Name}</h2>
                           <p>{plant.CommanName}</p>
                        </div>
                      </div>
                    </div>
                    <div class="row mb-4">
                      <div class="col">
                        <div class="p-4">
                           <p>{plant.Description}</p>
                        </div>
                      </div>
                    </div>

                  </div>

                
                </Modal>
              </div>
            </div>
          ))}
        </div>
      </div>
      {filteredData.length > 0 &&
        <>
          <div className='pagination justify-content-center'>  <CustomPagination
            itemsCount={filteredData.length}
            itemsPerPage={pageSize}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            alwaysShown={true}
          /></div>



        </>
      }
      {/* <nav>
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
      </nav> */}

    </>
  )
}

export default Plants1