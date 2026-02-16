import React from "react";
import './components.css'

const Navbar = ({color}) => {
  return (
    <div>
      <div className="form__main mx-auto p-5 py-1 text-center items-center ">
      <div>
        <h1 className={color=="bg-gray-700"?"text-white font-bold text-4xl m-6":"font-bold text-4xl m-6"}>
          Create Your Forms Easily!
        </h1>
      </div>
      
      </div>
    </div>
  );
};

export default Navbar;
