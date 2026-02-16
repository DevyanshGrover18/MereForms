import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PublicFormSubmit = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState({});
  
  // User details state
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    fetchPublicForm();
  }, [formId]);

  const fetchPublicForm = async () => {
    try {
      // Fetch form without authentication
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/forms/public/${formId}`
      );

      if (!response.data.isPublished) {
        setError("This form is not published and cannot accept submissions.");
        setLoading(false);
        return;
      }

      setForm(response.data);
      setLoading(false);

      // Initialize responses object
      const initialResponses = {};
      response.data.formData?.forEach((category) => {
        category.questions?.forEach((question) => {
          initialResponses[question.id] = "";
        });
      });
      setResponses(initialResponses);
    } catch (err) {
      console.error("Error fetching form:", err);
      setError(
        err.response?.data?.message ||
          "Form not found or no longer available"
      );
      setLoading(false);
    }
  };

  const handleUserDetailsChange = (field, value) => {
    setUserDetails({
      ...userDetails,
      [field]: value
    });
  };

  const handleInputChange = (questionId, value) => {
    setResponses({
      ...responses,
      [questionId]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate user details
    if (!userDetails.name || !userDetails.email) {
      alert("Please provide your name and email");
      return;
    }

    setSubmitting(true);

    try {
      // Submit form without authentication - backend will handle as guest submission
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/forms/public/${formId}/submit`,
        {
          submitterName: userDetails.name,
          submitterEmail: userDetails.email,
          submitterPhone: userDetails.phone,
          responses: responses,
          submittedAt: new Date().toISOString()
        }
      );

      setSubmitted(true);
      setSubmitting(false);
    } catch (err) {
      console.error("Error submitting form:", err);
      alert(err.response?.data?.message || "Failed to submit form. Please try again.");
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    const questionId = question.id;

    switch (question.type) {
      case "text":
        return (
          <input
            type="text"
            value={responses[questionId] || ""}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            required={question.required}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your answer"
          />
        );

      case "email":
        return (
          <input
            type="email"
            value={responses[questionId] || ""}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            required={question.required}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter email address"
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={responses[questionId] || ""}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            required={question.required}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter a number"
          />
        );

      case "textarea":
        return (
          <textarea
            value={responses[questionId] || ""}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            required={question.required}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter your detailed response"
          />
        );

      case "radio":
        return (
          <div className="space-y-2">
            {question.options?.map((option, idx) => (
              <label key={idx} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="radio"
                  name={questionId}
                  value={option}
                  checked={responses[questionId] === option}
                  onChange={(e) => handleInputChange(questionId, e.target.value)}
                  required={question.required}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {question.options?.map((option, idx) => (
              <label key={idx} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  value={option}
                  checked={(responses[questionId] || "").split(",").filter(v => v).includes(option)}
                  onChange={(e) => {
                    const currentValues = responses[questionId]
                      ? responses[questionId].split(",").filter(v => v)
                      : [];
                    let newValues;
                    if (e.target.checked) {
                      newValues = [...currentValues, option];
                    } else {
                      newValues = currentValues.filter((v) => v !== option);
                    }
                    handleInputChange(questionId, newValues.join(","));
                  }}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case "select":
        return (
          <select
            value={responses[questionId] || ""}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            required={question.required}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select an option --</option>
            {question.options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "date":
        return (
          <input
            type="date"
            value={responses[questionId] || ""}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            required={question.required}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      default:
        return (
          <input
            type="text"
            value={responses[questionId] || ""}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            required={question.required}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your answer"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Form Not Available
            </h2>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-gray-900">
              Thank You!
            </h2>
            <p className="mt-2 text-gray-600">
              Your response has been submitted successfully.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              We've sent a confirmation to {userDetails.email}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: form?.bgColor || "#f3f4f6",
        backgroundImage: form?.bgImage ? `url(${form.bgImage})` : "none",
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Form Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {form?.formTitle || "Form"}
          </h1>
          <p className="text-gray-600">
            {form?.formDesc || "Please fill out this form"}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              * Required fields
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* User Details Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Information
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Please provide your contact details so we can reach you about your submission.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userDetails.name}
                  onChange={(e) => handleUserDetailsChange("name", e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={userDetails.email}
                  onChange={(e) => handleUserDetailsChange("email", e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={userDetails.phone}
                  onChange={(e) => handleUserDetailsChange("phone", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 99999-99999"
                />
              </div>
            </div>
          </div>

          {/* Form Questions */}
          {form?.formData?.map((category, catIndex) => (
            <div key={catIndex} className="bg-white rounded-lg shadow-lg p-8 mb-6">
              {category.title && (
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                  {category.title}
                </h2>
              )}

              <div className="space-y-6">
                {category.questions?.map((question, qIndex) => (
                  <div key={question.id || qIndex} className="pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {question.question}
                      {question.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {renderQuestion(question)}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 px-6 rounded-lg text-white font-semibold text-lg transition-all ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Form"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicFormSubmit;