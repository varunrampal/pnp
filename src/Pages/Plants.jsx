import React from 'react'
import items from '../json/PlantsList.json'
import PaginatedFilterSearchSort from '../Components/PaginatedFilterSearchSort'

const Plants = () => {
  return (
        <PaginatedFilterSearchSort items={items} />
  )
}

export default Plants