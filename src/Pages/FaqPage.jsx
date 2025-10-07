import React from 'react'
import SalesInfo from '../Components/SalesInfo'
import FaQ from '../Components/Faq'
export const FaqPage = () => {
  return (
    <>
    <div class="container-fluid page-header py-5 mb-5 wow fadeIn" data-wow-delay="0.1s">
        <div class="container text-center py-5">
            <h1 class="display-3 text-white mb-4 animated slideInDown">FAQ</h1>
        </div>
    </div>
<FaQ/>
</>
  )
}
export default FaqPage