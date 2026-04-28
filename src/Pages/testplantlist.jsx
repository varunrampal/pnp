import React, { useState, useEffect } from 'react';
import PaginatedFilterSearchSort from '../Components/PaginatedFilterSearchSort'
import items from '../json/Categoty.json'

const testplantlist = () => {

  
    return (
     
      <PaginatedFilterSearchSort items={items} />
    );
}

export default testplantlist