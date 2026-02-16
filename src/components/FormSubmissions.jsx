import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const FormSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [formDetails, setFormDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { formId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFormAndSubmissions();
  }, [formId]);

  const fetchFormAndSubmissions = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Fetch form details
      const formResponse = await axios.get(
        `http://localhost:8000/api/forms/${formId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFormDetails(formResponse.data.form);

      // Fetch submissions
      const submissionsResponse = await axios.get(
        `http://localhost:8000/api/forms/${formId}/submissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSubmissions(submissionsResponse.data.submissions);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to fetch submissions");
      setLoading(false);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(submissions, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `${formDetails?.formTitle || "form"}_submissions.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportToCSV = () => {
    if (submissions.length === 0) return;

    // Get all unique question keys
    const allKeys = new Set();
    submissions.forEach((sub) => {
      Object.keys(sub.responses).forEach((key) => {
        Object.keys(sub.responses[key]).forEach((question) => {
          allKeys.add(question);
        });
      });
    });

    const headers = ["Submission ID", "Submitted By", "Submitted At", ...Array.from(allKeys)];
    
    const rows = submissions.map((sub) => {
      const row = [
        sub._id,
        sub.submittedBy,
        formatDate(sub.createdAt),
      ];

      allKeys.forEach((key) => {
        let value = "";
        Object.keys(sub.responses).forEach((sectionIndex) => {
          if (sub.responses[sectionIndex][key]) {
            value = sub.responses[sectionIndex][key];
          }
        });
        row.push(value);
      });

      return row;
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${formDetails?.formTitle || "form"}_submissions.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => navigate("/my-forms")}
                className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-1"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to My Forms
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {formDetails?.formTitle || "Form"} - Submissions
              </h1>
              <p className="text-gray-600 mt-1">
                Total submissions: {submissions.length}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                disabled={submissions.length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Export CSV
              </button>
              <button
                onClick={exportToJSON}
                disabled={submissions.length === 0}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Submissions List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {submissions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No submissions yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Submissions will appear here once users fill out your form
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission, index) => (
              <div
                key={submission._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Submission Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Submission #{submissions.length - index}
                      </h3>
                      <p className="text-sm text-gray-600">
                        By: {submission.submittedBy || "Anonymous"}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(submission.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Submission Responses */}
                <div className="px-6 py-4">
                  {Object.keys(submission.responses).map((sectionIndex) => (
                    <div key={sectionIndex} className="mb-6 last:mb-0">
                      <h4 className="text-md font-semibold text-gray-700 mb-3 pb-2 border-b">
                        Section {parseInt(sectionIndex) + 1}
                      </h4>
                      <div className="space-y-3 pl-4">
                        {Object.entries(submission.responses[sectionIndex]).map(
                          ([question, answer]) => (
                            <div key={question} className="grid grid-cols-3 gap-4">
                              <div className="col-span-1 font-medium text-gray-700">
                                {question}:
                              </div>
                              <div className="col-span-2 text-gray-900">
                                {answer || <span className="text-gray-400 italic">No answer</span>}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormSubmissions; 