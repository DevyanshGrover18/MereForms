import React, { useState, useEffect } from "react";

const FieldTemplate = ({
  id,
  initialData,
  getFieldData,
  removeCategory,
  initialQuestions,
}) => {
  const [title, setTitle] = useState(initialData.title || "");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [questions, setQuestions] = useState(initialData.questions || []);
  
  useEffect(() => {
    getFieldData(getData);
  }, [title, questions]);

  useEffect(() => {
    saveDataToLocalStorage();
  }, [title, questions]);

  useEffect(() => {
    const savedCategories = JSON.parse(localStorage.getItem("categories")) || [];
    const currentCategory = savedCategories.find(category => category.id === id);
    if (currentCategory) {
      setTitle(currentCategory.title);
      setQuestions(currentCategory.questions);
    }
  }, [id]);
  

  const saveDataToLocalStorage = () => {
    try {
      const categories = JSON.parse(localStorage.getItem("categories")) || [];
      const updatedCategories = categories.map((category) =>
        category.id === id ? { ...category, title, questions } : category
      );
      localStorage.setItem("categories", JSON.stringify(updatedCategories));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };
  

  const titleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleTitle = () => {
    setIsEditingTitle(!isEditingTitle);
  };

  const saveTitle = () => {
    setIsEditingTitle(false);
  };

  const questionChange = (index, event) => {
    const newQuestions = [...questions];
    newQuestions[index].question = event.target.value;
    setQuestions(newQuestions);
  };

  const handleQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions[index].isEditingQuestion = true;
    setQuestions(newQuestions);
  };

  const saveQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions[index].isEditingQuestion = false;
    setQuestions(newQuestions);
  };

  const handleQuestionTypeChange = (index, event) => {
    const newQuestions = [...questions];
    newQuestions[index].questionType = event.target.value;

    // Clear options if not radio or select
    if (event.target.value !== "radio" && event.target.value !== "select" && event.target.value !== "checkbox") {
      newQuestions[index].options = [];
    } else if (event.target.value === "select") {
      newQuestions[index].options = [""];
    } else if (event.target.value === "radio") {
      newQuestions[index].options = [""];
    } else if (event.target.value === "checkbox") {
      newQuestions[index].options = [""];
    }

    setQuestions(newQuestions);
  };

  const handleOptionChange = (index, optionIndex, event) => {
    const newQuestions = [...questions];
    newQuestions[index].options[optionIndex] = event.target.value;
    setQuestions(newQuestions);
  };

  const addOption = (index) => {
    const newQuestions = [...questions];
    newQuestions[index].options.push("");
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        isEditingQuestion: true,
        questionType: "",
        options: [],
        required: false,
        conditions: [],
        hide: false,
      },
    ]);
  };

  const getData = () => {
    return {
      id,
      title,
      questions: questions.map((q) => ({
        question: q.question,
        questionType: q.questionType,
        options: q.options,
        required: q.required,
        conditions: q.conditions || [],
        hide: q.hide || false,
      })),
    };
  };

  const handleRequiredChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].required = value;
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (index, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[index].options.splice(optionIndex, 1);
    setQuestions(newQuestions);
  };

  const addCondition = (index) => {
    const newQuestions = [...questions];
    if (!newQuestions[index].conditions) {
      newQuestions[index].conditions = [];
    }
    newQuestions[index].conditions.push({
      conditionIf: "",
      conditionValue: "",
      conditionDo: "",
      conditionField: "",
    });
    setQuestions(newQuestions);
  };

  const removeCondition = (index, condIndex) => {
    const newQuestions = [...questions];
    newQuestions[index].conditions.splice(condIndex, 1);
    setQuestions(newQuestions);
  };

  const handleConditionIfChange = (index, condIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[index].conditions[condIndex].conditionIf = value;
    newQuestions[index].conditions[condIndex].conditionValue = "";
    setQuestions(newQuestions);
  };

  const handleConditionValueChange = (index, condIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[index].conditions[condIndex].conditionValue = value;
    setQuestions(newQuestions);
  };

  const handleConditionDoChange = (index, condIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[index].conditions[condIndex].conditionDo = value;
    setQuestions(newQuestions);
  };

  const handleConditionFieldChange = (index, condIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[index].conditions[condIndex].conditionField = value;
    setQuestions(newQuestions);
  };

  const handleHide = (index) => {
    const newQuestions = [...questions];
    newQuestions[index].hide = !newQuestions[index].hide;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const getOptionsForQuestion = (questionText) => {
    const question = questions.find((q) => q.question === questionText);
    return question ? question.options : [];
  };

  return (
    <div className="m-5 bg-white bg-opacity-40 shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {isEditingTitle ? (
        <div className="flex">
          <textarea
            onChange={titleChange}
            className="w-full max-h-10 min-h-10 border-none text-3xl px-2 font-semibold"
            value={title}
            required
          />
          <button type="button" onClick={saveTitle} className="w-10 h-10 text-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
              <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
            </svg>
          </button>
        </div>
      ) : (
        <h1
          className="text-3xl my-3 flex justify-between items-center hover:cursor-pointer"
          onClick={handleTitle}
        >
          {title ? title : "Add Category title +"}
        </h1>
      )}

      <hr className="bg-black border border-black" />

      {questions.map((q, index) => (
        <div key={index}>
          {/* Question Title Row - Always visible */}
          <div className="flex justify-between items-center my-2">
            {q.isEditingQuestion ? (
              <div className="flex flex-1 items-center gap-2">
                <textarea
                  onChange={(event) => questionChange(index, event)}
                  className="flex-1 max-h-8 min-h-8 border px-2 text-lg font-semibold rounded"
                  value={q.question}
                  placeholder="Enter question text"
                />
                <button
                  onClick={() => saveQuestion(index)}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            ) : (
              <h1
                className="font-semibold text-lg px-2 hover:cursor-pointer flex-1"
                onClick={() => handleQuestion(index)}
              >
                {q.question ? q.question : "Add Question +"}
                {q.hide && <span className="text-gray-500 text-sm ml-2">(Hidden in form)</span>}
              </h1>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={() => handleHide(index)}
                className="text-sm border border-gray-400 px-3 py-1 rounded hover:bg-gray-100"
              >
                {q.hide ? "Show in Form" : "Hide in Form"}
              </button>
              <button
                onClick={() => removeQuestion(index)}
                className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Question Configuration - Only show when editing */}
          {q.isEditingQuestion && (
            <div className="px-2 py-3 bg-gray-50 rounded my-2">
              <h2 className="font-semibold my-2 text-base">Question Configuration:</h2>

              <div className="mb-4">
                <label className="block mb-1 font-medium">Question Type:</label>
                <select
                  onChange={(event) => handleQuestionTypeChange(index, event)}
                  value={q.questionType}
                  className="w-64 px-2 py-2 rounded border"
                >
                  <option value="">Select Type</option>
                  <option value="text">Text</option>
                  <option value="radio">Multiple Choice</option>
                  <option value="select">Dropdown</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="email">Email</option>
                  <option value="textarea">Textarea</option>
                  <option value="file">File/Image Upload</option>
                </select>
              </div>

              {/* Options for Radio, Select, and Checkbox */}
              {(q.questionType === "radio" ||
                q.questionType === "select" ||
                q.questionType === "checkbox") && (
                <div className="mb-4">
                  <h3 className="font-semibold my-2">Options:</h3>
                  {q.options && q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center my-2 gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(event) =>
                          handleOptionChange(index, optIndex, event)
                        }
                        className="border px-2 py-1 rounded flex-grow"
                        placeholder={`Option ${optIndex + 1}`}
                      />
                      <button
                        onClick={() => handleRemoveOption(index, optIndex)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(index)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mt-2"
                  >
                    Add Option
                  </button>
                </div>
              )}

              {/* Required Checkbox */}
              <div className="my-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) => handleRequiredChange(index, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="font-medium">Required Field</span>
                </label>
              </div>

              {/* Conditional Logic Section */}
              <div className="mt-4 border-t pt-4">
                <h3 className="text-base font-semibold my-2">Conditional Logic:</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Show or hide other fields based on this question's answer
                </p>
                
                {q.conditions && q.conditions.map((condition, condIndex) => (
                  <div key={condIndex} className="border border-gray-300 p-3 my-2 rounded bg-white">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Condition {condIndex + 1}</h4>
                      <button
                        onClick={() => removeCondition(index, condIndex)}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-sm font-medium">If question:</label>
                        <select
                          value={condition.conditionIf}
                          onChange={(e) =>
                            handleConditionIfChange(index, condIndex, e.target.value)
                          }
                          className="w-full px-2 py-1 rounded border"
                        >
                          <option value="">Select a question</option>
                          {questions
                            .filter(
                              (quest) =>
                                quest.questionType === "radio" ||
                                quest.questionType === "select" ||
                                quest.questionType === "checkbox"
                            )
                            .map((quest, questIndex) => (
                              <option key={questIndex} value={quest.question}>
                                {quest.question || `Question ${questIndex + 1}`}
                              </option>
                            ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block mb-1 text-sm font-medium">Is equal to:</label>
                        <select
                          value={condition.conditionValue}
                          onChange={(e) =>
                            handleConditionValueChange(index, condIndex, e.target.value)
                          }
                          className="w-full px-2 py-1 rounded border"
                        >
                          <option value="">Select value</option>
                          {getOptionsForQuestion(condition.conditionIf).map(
                            (option, optionIndex) => (
                              <option key={optionIndex} value={option}>
                                {option}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block mb-1 text-sm font-medium">Then:</label>
                        <select
                          value={condition.conditionDo}
                          onChange={(e) =>
                            handleConditionDoChange(index, condIndex, e.target.value)
                          }
                          className="w-full px-2 py-1 rounded border"
                        >
                          <option value="">Select action</option>
                          <option value="show">Show</option>
                          <option value="hide">Hide</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block mb-1 text-sm font-medium">This field:</label>
                        <select
                          value={condition.conditionField}
                          onChange={(e) =>
                            handleConditionFieldChange(index, condIndex, e.target.value)
                          }
                          className="w-full px-2 py-1 rounded border"
                        >
                          <option value="">Select a field</option>
                          {questions.map((quest, questIndex) => (
                            <option key={questIndex} value={quest.question}>
                              {quest.question || `Question ${questIndex + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => addCondition(index)}
                  className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 mt-2"
                >
                  Add Condition
                </button>
              </div>
            </div>
          )}
          
          <hr className="bg-gray-300 my-2" />
        </div>
      ))}

      <div className="flex gap-2 mt-4">
        <button
          onClick={addQuestion}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Question
        </button>
        <button
          onClick={() => removeCategory(id)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Remove Category
        </button>
      </div>
    </div>
  );
};

export default FieldTemplate;