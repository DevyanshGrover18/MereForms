import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Client-Navbar";
import FieldTemplate from "./FieldTemplate";

const Home = () => {
  const [categories, setCategories] = useState(loadCategoriesFromStorage());
  const [formTitle, setFormTitle] = useState(
    loadFromLocalStorage("formTitle", ""),
  );
  const [formDesc, setFormDesc] = useState(
    loadFromLocalStorage("formDesc", ""),
  );
  const [isEditingFormTitle, setIsEditingFormTitle] = useState(false);
  const [isEditingFormDesc, setIsEditingFormDesc] = useState(false);
  const [color, setColor] = useState(
    loadFromLocalStorage("color", "bg-gray-300"),
  );
  const [bgImage, setBgImage] = useState(loadFromLocalStorage("bgImage", null));
  const [editingFormId, setEditingFormId] = useState(
    localStorage.getItem("editingFormId") || null,
  );
  const [currentFormId, setCurrentFormId] = useState(
    localStorage.getItem("currentFormId") || null,
  );
  const formRefs = useRef(categories.map(() => null));
  const navigate = useNavigate();

  useEffect(() => {
    const storedCategories = JSON.parse(localStorage.getItem("categories"));
    if (storedCategories) {
      setCategories(storedCategories);
    }
    setFormTitle(localStorage.getItem("formTitle") || "");
    setFormDesc(localStorage.getItem("formDesc") || "");
    setColor(localStorage.getItem("color") || "bg-gray-300");
    setBgImage(localStorage.getItem("bgImage") || null);
    setEditingFormId(localStorage.getItem("editingFormId") || null);
    setCurrentFormId(localStorage.getItem("currentFormId") || null);
  }, []);

  const clearForm = () => {
    localStorage.removeItem("categories");
    localStorage.removeItem("formTitle");
    localStorage.removeItem("formDesc");
    localStorage.removeItem("color");
    localStorage.removeItem("bgImage");
    localStorage.removeItem("editingFormId");
    localStorage.removeItem("currentFormId");

    setCategories([{ id: 1, title: "", questions: [] }]);
    setFormTitle("");
    setFormDesc("");
    setColor("bg-gray-300");
    setBgImage(null);
    setEditingFormId(null);
    setCurrentFormId(null);
    window.location.reload();
  };

  function loadCategoriesFromStorage() {
    const storedCategories = JSON.parse(localStorage.getItem("categories"));
    return storedCategories || [{ id: 1, title: "", questions: [] }];
  }

  function loadFromLocalStorage(key, defaultValue) {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? storedValue : defaultValue;
  }

  function saveFormDataToLocalStorage() {
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("formTitle", formTitle);
    localStorage.setItem("formDesc", formDesc);
    localStorage.setItem("color", color);
    localStorage.setItem("bgImage", bgImage);
  }

  useEffect(() => {
    saveFormDataToLocalStorage();
  }, [categories, formTitle, formDesc, color, bgImage]);

  const addCategory = () => {
    const newCategory = { id: categories.length + 1, title: "", questions: [] };
    setCategories([...categories, newCategory]);
    formRefs.current.push(null);
  };

  const handleSubmit = () => {
    const formData = categories.map((category, index) => {
      if (formRefs.current[index]) {
        return formRefs.current[index]();
      }
      return null;
    });

    const formDetails = {
      bgColor: color,
      formTitle: formTitle,
      formDesc: formDesc,
      formData: formData,
    };

    localStorage.setItem("Form", JSON.stringify(formDetails));
    alert("Form saved successfully!");

    navigate(`/preview`, { state: { formDetails, bgImage } });
  };

  // Save form to database
  const saveFormToDatabase = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to save forms to database");
      navigate("/login");
      return;
    }

    const rawFormData = categories.map((category, index) => {
      if (formRefs.current[index]) {
        return formRefs.current[index]();
      }
      return null;
    });

    // ✅ Remove null sections
    const formData = rawFormData.filter(Boolean);

    // ✅ Validate questionType
    const hasInvalidQuestion = formData.some((section) =>
      section.questions?.some(
        (q) => !q.questionType || q.questionType.trim() === "",
      ),
    );

    if (hasInvalidQuestion) {
      alert("All questions must have a question type selected.");
      return; // stop API call
    }

    const formDetails = {
      bgColor: color,
      formTitle,
      formDesc,
      bgImage,
      formData,
    };

    try {
      let response;
      const formIdToUpdate = editingFormId || currentFormId;

      if (formIdToUpdate) {
        response = await axios.put(
          `${import.meta.env.VITE_BASE_URL}/api/forms/${formIdToUpdate}`,
          formDetails,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        alert("Form updated successfully!");
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/forms`,
          formDetails,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        alert("Form saved to database successfully!");

        const newFormId = response.data._id || response.data.id;
        if (newFormId) {
          localStorage.setItem("currentFormId", newFormId);
          setCurrentFormId(newFormId);
        }
      }

      localStorage.removeItem("categories");
      localStorage.removeItem("formTitle");
      localStorage.removeItem("formDesc");
      localStorage.removeItem("color");
      localStorage.removeItem("bgImage");
      localStorage.removeItem("currentFormId");

      navigate("/my-forms");
    } catch (error) {
      console.error("Error saving form:", error);
      alert(error.response?.data?.message || "Failed to save form to database");

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleTitleChange = (event) => {
    setFormTitle(event.target.value);
  };

  const handleDescChange = (event) => {
    setFormDesc(event.target.value);
  };

  const toggleEditTitle = () => {
    setIsEditingFormTitle(!isEditingFormTitle);
  };

  const toggleEditDesc = () => {
    setIsEditingFormDesc(!isEditingFormDesc);
  };

  const getFieldData = (index, getData) => {
    formRefs.current[index] = getData;
    const updatedCategories = [...categories];
    updatedCategories[index] = getData();
    setCategories(updatedCategories);
  };

  const changeColor = (event) => {
    const value = event.target.value;
    setColor(value);

    if (value === "image") {
      document.getElementById("bg-image-upload").click();
    } else {
      setBgImage(null);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setBgImage(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const removeCategory = (index) => {
    const updatedCategories = [...categories];
    updatedCategories.splice(index, 1);
    setCategories(updatedCategories);
    formRefs.current.splice(index, 1);
  };

  const downloadJSON = () => {
    const formData = categories.map((category, index) => {
      return formRefs.current[index]?.();
    });

    const formDetails = {
      bgColor: color,
      formTitle: formTitle,
      formDesc: formDesc,
      formData: formData,
    };

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(formDetails));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "formDetails.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const loadJSON = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const loadedData = JSON.parse(e.target.result);
      setCategories(loadedData.formData || []);
      setFormTitle(loadedData.formTitle || "");
      setFormDesc(loadedData.formDesc || "");
      setColor(loadedData.bgColor || "bg-gray-300");
      setBgImage(loadedData.bgImage || null);
    };
    if (file) {
      reader.readAsText(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="relative">
      <div
        className={`${color} min-h-screen bg-cover bg-center`}
        style={{ backgroundImage: bgImage ? `url(${bgImage})` : "" }}
      >
        <div className="absolute top-5 right-5 flex gap-2 z-10">
          <select
            onChange={changeColor}
            value={color}
            name="bg-color"
            id="bg-color"
            className="rounded bg-white bg-opacity-40 border-2 border-black p-1 px-2"
          >
            <option value="bg-gray-300">-- Select Theme --</option>
            <option value="bg-gray-300">Default</option>
            <option value="bg-gray-700">Dark</option>
            <option value="bg-blue-200">Blue</option>
            <option value="bg-green-200">Green</option>
            <option value="bg-yellow-200">Yellow</option>
            <option value="image">Custom Image</option>
          </select>
          <button
            onClick={() => navigate("/my-forms")}
            className="rounded bg-blue-500 text-white border-2 border-blue-600 p-1 px-3 hover:bg-blue-600"
          >
            My Forms
          </button>
          <button
            onClick={handleLogout}
            className="rounded bg-red-500 text-white border-2 border-red-600 p-1 px-3 hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
          id="bg-image-upload"
        />
        <div>
          <Navbar color={color} />
          {(editingFormId || currentFormId) && (
            <div className="text-center bg-yellow-100 border-b-2 border-yellow-400 py-2">
              <span className="text-yellow-800 font-semibold">
                Editing existing form - changes will overwrite the saved version
              </span>
            </div>
          )}
          {isEditingFormTitle ? (
            <div className="flex justify-center items-center">
              <input
                className="h-12 px-2 my-2 text-4xl text-center"
                type="text"
                name="FormTitle"
                id="FormTitle"
                value={formTitle}
                onChange={handleTitleChange}
              />
              <button
                onClick={toggleEditTitle}
                className="w-10 h-10 mx-3 text-2xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#000000"
                  className={color === "bg-gray-700" ? "invert" : ""}
                >
                  <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
                </svg>
              </button>
            </div>
          ) : (
            <h1
              className={`${
                color === "bg-gray-700" ? "text-white" : ""
              } text-center h-12 px-2 my-2 text-4xl cursor-pointer`}
              onClick={toggleEditTitle}
            >
              {formTitle || "Add Form Title +"}
            </h1>
          )}
          {isEditingFormDesc ? (
            <div className="flex justify-center items-center">
              <textarea
                name="FormDesc"
                id="FormDesc"
                className="h-20 px-2 my-2 text-md w-1/2"
                value={formDesc}
                onChange={handleDescChange}
              ></textarea>
              <button
                onClick={toggleEditDesc}
                className="w-10 h-10 mx-3 text-2xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#000000"
                  className={color === "bg-gray-700" ? "invert" : ""}
                >
                  <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
                </svg>
              </button>
            </div>
          ) : (
            <h1
              className={`${
                color === "bg-gray-700" ? "text-white" : ""
              } text-md text-center my-2 cursor-pointer`}
              onClick={toggleEditDesc}
            >
              {formDesc || "Add Form Description +"}
            </h1>
          )}
        </div>
        <div className="max-w-4xl mx-auto items-center">
          {categories.map((category, index) => (
            <FieldTemplate
              key={category.id}
              id={category.id}
              initialData={category}
              getFieldData={(getData) => getFieldData(index, getData)}
              removeCategory={() => removeCategory(index)}
              questions={categories[index].questions}
            />
          ))}
          <div className="flex flex-col justify-center">
            <button
              onClick={addCategory}
              className="bg-white bg-opacity-40 border-2 border-black border-opacity-50 px-2 py-1 mt-3 cursor-pointer w-40 text-center mx-auto"
            >
              Add Category +
            </button>
            <button
              onClick={handleSubmit}
              className="font-bold px-2 py-1 mt-3 cursor-pointer w-40 text-center mx-auto flex items-center absolute bottom-10 right-5 "
            >
              Show Preview{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#000000"
              >
                <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
              </svg>
            </button>
            <button
              className="font-bold px-2 py-1 mt-3 cursor-pointer w-40 text-center mx-auto flex items-center absolute bottom-10 left-5 gap-2"
              onClick={clearForm}
            >
              Clear Form
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#000000"
              >
                <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q54 0 104-17.5t92-50.5L228-676q-33 42-50.5 92T160-480q0 134 93 227t227 93Zm252-124q33-42 50.5-92T800-480q0-134-93-227t-227-93q-54 0-104 17.5T284-732l448 448Z" />
              </svg>
            </button>
            <div className="flex mx-auto gap-3">
              <button
                onClick={saveFormToDatabase}
                className="bg-green-500 text-white border-2 mb-10 border-green-600 px-2 py-1 mt-3 cursor-pointer w-40 text-center mx-auto hover:bg-green-600"
              >
                {editingFormId || currentFormId
                  ? "Update Form"
                  : "Save to Database"}
              </button>
              <button
                onClick={downloadJSON}
                className="bg-white bg-opacity-40 border-2 mb-10 border-black border-opacity-50 px-2 py-1 mt-3 cursor-pointer w-40 text-center mx-auto"
              >
                Download JSON
              </button>
              <label
                htmlFor="load-form"
                className="bg-white bg-opacity-40 border-2 mb-10 border-black border-opacity-50 px-2 py-1 mt-3 cursor-pointer w-40 text-center mx-auto"
              >
                Load a Form
              </label>
              <input
                id="load-form"
                type="file"
                accept="application/json"
                onChange={loadJSON}
                style={{ display: "none" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
