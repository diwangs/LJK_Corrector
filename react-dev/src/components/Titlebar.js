import React from 'react';
import { Navbar, NavbarBrand } from 'reactstrap';

export default () => (
  <Navbar color="dark" fixed="top" expand="lg" className="titlebar">
    <NavbarBrand href="/">
      <h1>Korektor LJK</h1>
    </NavbarBrand>  
  </Navbar>
);