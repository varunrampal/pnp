import React from 'react';

const TopBar = () => (
  <div className="nursery-topbar">
    <div className="nursery-topbar__inner">
      <div className="nursery-topbar__contact">
        <a href="tel:+18334989898"><i className="fa fa-phone-alt" aria-hidden="true"></i><span>1-833-498-9898</span></a>
        <a href="mailto:info@peelsnativeplants.com"><i className="far fa-envelope" aria-hidden="true"></i><span>info@peelsnativeplants.com</span></a>
      </div>
      <div className="nursery-topbar__positioning"><span aria-hidden="true"></span>Specialist native-plant growers <b>Langley, BC</b></div>
    </div>
  </div>
);

export default TopBar;
