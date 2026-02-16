import React from "react";
import { useLocation } from "react-router-dom";

const EndPage = () => {
  let location = useLocation();
  const { bgImage } = location.state || {};
  const { bgColor } = location.state || {};

  return (
    <div
      className={`${bgColor ? bgColor : ""} ${bgColor === "bg-gray-700" ? "text-white" : ""}`}
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : "",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <h1 className="text-3xl" style={{ textAlign: "center", paddingTop: "20%" }}>Thank you</h1>
      <h1 className="text-xl" style={{ textAlign: "center"}}>Your Response has been submitted!</h1>
    </div>
  );
};

export default EndPage;
