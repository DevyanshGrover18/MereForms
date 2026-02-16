import React, { useState, useEffect } from "react";
import PreviewTemplate from "./PreviewTemplate";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Preview = () => {
  const location = useLocation();
  const { formDetails } = location.state || {};
  const { bgImage } = location.state || {};

  const [bgColor, setBgColor] = useState(formDetails?.bgColor || "bg-gray-300");
  const [formTitle, setFormTitle] = useState(formDetails?.formTitle || "");
  const [formDesc, setFormDesc] = useState(formDetails?.formDesc || "");
  const [initialFormData, setInitialFormData] = useState(
    formDetails?.formData || [],
  );
  const [activeSection, setActiveSection] = useState(0);
  const [formValues, setFormValues] = useState({});
  const navigate = useNavigate();
  // console.log(bgColor)

  useEffect(() => {
    if (initialFormData.length > 0) {
      setFormValues(
        initialFormData.reduce((acc, section, index) => {
          acc[index] = {};
          section.questions.forEach((question) => {
            acc[index][question.question] = "";
          });
          return acc;
        }, {}),
      );
    }
  }, [initialFormData]);

  const handleInputChange = (sectionIndex, fieldName, value) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [sectionIndex]: {
        ...prevValues[sectionIndex],
        [fieldName]: value,
      },
    }));
  };

  const handleShortcutClick = (index) => {
    setActiveSection(index);
  };

  const handleNextClick = () => {
    if (activeSection < initialFormData.length - 1) {
      setActiveSection(activeSection + 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    console.log("Form Data:", JSON.stringify(formValues, null, 2));

    alert("For submitted succesfully")
    navigate("/endpage", { state: { bgImage, bgColor } });
    localStorage.clear(); // Clear localStorage if needed
  };

  const handleNextSection = () => {
    handleNextClick();
  };

  const handleLoadForm = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loadedData = JSON.parse(e.target.result);
        setFormValues({});
        setActiveSection(0);
        setInitialFormData(loadedData.formData || []);
        setFormTitle(loadedData.formTitle || "");
        setFormDesc(loadedData.formDesc || "");
        setBgColor(loadedData.bgColor || "bg-gray-300");
      } catch (error) {
        console.error("Error loading JSON file:", error);
      }
    };
    if (file) {
      reader.readAsText(file);
    }
  };

  return (
    <div
      className={`min-h-screen flex ${bgColor ? `${bgColor}` : "bg-gray-300"}`}
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : "",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: bgImage ? "" : bgColor,
      }}
    >
      <div className="w-1/5 bg-white bg-opacity-40 p-4 m-4 shadow-md rounded">
        <h2 className="text-lg font-bold mb-4">Shortcuts</h2>
        {initialFormData &&
          initialFormData.map((item, index) => (
            <div
              key={index}
              className={`cursor-pointer py-2 px-4 mb-2 rounded ${
                activeSection === index ? "bg-gray-300" : ""
              } `}
              onClick={() => handleShortcutClick(index)}
            >
              {item.title}
            </div>
          ))}
      </div>
      <div className="w-4/5 m-10">
        <h1
          className={`text-4xl text-center font-semibold my-2 ${bgColor === "bg-gray-700" ? "text-white" : ""}`}
        >
          {formTitle}
        </h1>
        <h1
          className={`text-md text-center my-2 ${bgColor === "bg-gray-700" ? "text-white" : ""}`}
        >
          {formDesc}
        </h1>
        <form onSubmit={handleSubmit}>
          {initialFormData &&
            initialFormData.map((item, index) => (
              <div
                key={index}
                className={`${activeSection === index ? "relative" : "hidden relative"}`}
              >
                <PreviewTemplate
                  data={item}
                  onInputChange={(fieldName, value) =>
                    handleInputChange(index, fieldName, value)
                  }
                />
                {activeSection === initialFormData.length - 1 && (
                  <div className="bottom-4 right-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white rounded px-4 py-2 text-xl absolute right-16 flex items-center gap-2"
                    >
                      Submit
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="15px"
                        fill="#FFFFFF"
                      >
                        <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          {activeSection !== initialFormData.length - 1 && (
            <div className="bottom-4 right-4 ">
              <button
                type="button"
                onClick={handleNextSection}
                className="bg-blue-600 text-white rounded px-4 py-2 text-xl flex items-center absolute right-28  gap-2"
              >
                Next
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="15px"
                  fill="#FFFFFF"
                >
                  <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" />
                </svg>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Preview;
