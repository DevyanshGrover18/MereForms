import React, { useState, useEffect } from "react";

const PreviewTemplate = ({ data, onInputChange }) => {
  const [visibleQuestions, setVisibleQuestions] = useState([]);
  const [formValues, setFormValues] = useState({});

  useEffect(() => {
    initializeVisibility();
  }, [data]);

  const initializeVisibility = () => {
    // Initialize visibility based on data.questions
    // If hide is true, the field should NOT be visible initially
    const initialVisibleQuestions = data.questions.map((question) => ({
      ...question,
      hide: question.hide || false,
      visible: !question.hide, // visible is opposite of hide
    }));
    setVisibleQuestions(initialVisibleQuestions);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    let inputValue = value;
    if (type === "checkbox") {
      inputValue = checked ? value : "";
    }

    // Update form values
    const updatedFormValues = {
      ...formValues,
      [name]: inputValue,
    };
    setFormValues(updatedFormValues);

    // Evaluate visibility based on all current form values
    evaluateVisibility(updatedFormValues);

    // Pass value to parent
    onInputChange(name, inputValue);
  };

  const evaluateVisibility = (currentFormValues) => {
    // Create a copy of questions with initial visibility based on hide state
    let updatedQuestions = data.questions.map((question) => ({
      ...question,
      visible: !question.hide, // Start with visibility opposite to hide state
    }));

    // Go through all questions and check their conditions
    // Note: We don't need the forEach loop below since we already set visibility above

    // Now apply conditional logic from all questions
    updatedQuestions.forEach((question) => {
      if (question.conditions && question.conditions.length > 0) {
        question.conditions.forEach((condition) => {
          const { conditionIf, conditionValue, conditionDo, conditionField } = condition;
          
          // Check if the condition is met
          const currentValue = currentFormValues[conditionIf];
          
          if (currentValue === conditionValue) {
            // Find the target field and apply the action
            updatedQuestions.forEach((targetQuestion) => {
              if (targetQuestion.question === conditionField) {
                if (conditionDo === "hide") {
                  targetQuestion.visible = false;
                } else if (conditionDo === "show") {
                  targetQuestion.visible = true;
                }
              }
            });
          }
        });
      }
    });

    setVisibleQuestions(updatedQuestions);
  };

  const isRequired = (question) => {
    if (question && question.required) {
      return '*';
    }
    return '';
  };

  return (
    <div className="max-w-4xl mx-auto items-center">
      <div className="m-5 bg-white bg-opacity-40 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h1 className="text-3xl my-3 flex justify-between items-center">
          {data.title}
        </h1>
        <hr className="bg-black border border-black" />
        <form className="my-4">
          {visibleQuestions.map((question, questionIndex) => (
            <div
              key={`${question.question}_${questionIndex}`}
              className={`mb-4 ${!question.visible ? "hidden" : ""}`}
            >
              <h1 className="font-semibold text-lg my-2">
                {question.question}
                <span className="text-red-600 text-xl">
                  {isRequired(question)}
                </span>
              </h1>

              {/* Select Dropdown */}
              {question.questionType === "select" && (
                <select
                  name={question.question}
                  id={question.question}
                  onChange={handleChange}
                  required={question.required && question.visible}
                  className="px-2 py-2 border-2 rounded-lg border-black w-full md:w-1/2"
                  value={formValues[question.question] || ""}
                >
                  <option value="">-- Select an option --</option>
                  {question.options && question.options.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {/* Radio Buttons */}
              {question.questionType === "radio" && (
                <div className="space-y-2">
                  {question.options && question.options.map((option, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="radio"
                        id={`${question.question}_${index}`}
                        name={question.question}
                        value={option}
                        onChange={handleChange}
                        required={question.required && question.visible}
                        checked={formValues[question.question] === option}
                        className="mr-2"
                      />
                      <label
                        htmlFor={`${question.question}_${index}`}
                        className="cursor-pointer"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Checkboxes */}
              {question.questionType === "checkbox" && (
                <div className="space-y-2">
                  {question.options && question.options.map((option, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${question.question}_${index}`}
                        name={question.question}
                        value={option}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label
                        htmlFor={`${question.question}_${index}`}
                        className="cursor-pointer"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Textarea */}
              {question.questionType === "textarea" && (
                <textarea
                  className="px-2 w-full border-2 rounded-lg border-black py-2"
                  name={question.question}
                  id={question.question}
                  placeholder="Enter your answer"
                  onChange={handleChange}
                  required={question.required && question.visible}
                  rows="4"
                  value={formValues[question.question] || ""}
                />
              )}

              {/* File Upload */}
              {question.questionType === "file" && (
                <input
                  className="px-2 w-full md:w-1/2 border-2 rounded-lg border-black py-2"
                  type="file"
                  name={question.question}
                  id={question.question}
                  onChange={handleChange}
                  required={question.required && question.visible}
                />
              )}

              {/* Standard Input Fields (text, number, date, email) */}
              {(question.questionType === "text" ||
                question.questionType === "number" ||
                question.questionType === "date" ||
                question.questionType === "email") && (
                <input
                  className="px-2 w-full md:w-1/2 border-2 rounded-lg border-black py-2"
                  type={question.questionType}
                  name={question.question}
                  id={question.question}
                  placeholder="Enter your answer"
                  onChange={handleChange}
                  required={question.required && question.visible}
                  value={formValues[question.question] || ""}
                />
              )}
            </div>
          ))}
        </form>
      </div>
    </div>
  );
};

export default PreviewTemplate;