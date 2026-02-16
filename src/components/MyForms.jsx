import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MyForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedFormId, setCopiedFormId] = useState(null);
  const [publishingId, setPublishingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/forms`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setForms(response.data.forms);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching forms:", err);
      setError(err.response?.data?.message || "Failed to fetch forms");
      setLoading(false);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleDelete = async (formId) => {
    if (!window.confirm("Are you sure you want to delete this form?")) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      await axios.delete(`${import.meta.env.BASE_URL}/api/forms/${formId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove from local state
      setForms(forms.filter((form) => form._id !== formId));
      alert("Form deleted successfully!");
    } catch (err) {
      console.error("Error deleting form:", err);
      alert(err.response?.data?.message || "Failed to delete form");
    }
  };

  const handleEdit = (form) => {
    // Load form data into localStorage for editing
    localStorage.setItem("categories", JSON.stringify(form.formData));
    localStorage.setItem("formTitle", form.formTitle);
    localStorage.setItem("formDesc", form.formDesc);
    localStorage.setItem("color", form.bgColor);
    localStorage.setItem("bgImage", form.bgImage || "");
    localStorage.setItem("editingFormId", form._id);

    navigate("/builder");
  };

  const handleView = (form) => {
    const formDetails = {
      bgColor: form.bgColor,
      formTitle: form.formTitle,
      formDesc: form.formDesc,
      formData: form.formData,
    };

    navigate("/preview", { state: { formDetails, bgImage: form.bgImage } });
  };

  const handleViewSubmissions = (formId) => {
    navigate(`/submissions/${formId}`);
  };

  const togglePublish = async (formId, currentStatus) => {
    const token = localStorage.getItem("token");
    setPublishingId(formId); // start loading

    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/forms/${formId}`,
        { isPublished: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setForms(
        forms.map((form) =>
          form._id === formId ? { ...form, isPublished: !currentStatus } : form,
        ),
      );
    } catch (err) {
      console.error("Error toggling publish status:", err);
      alert(err.response?.data?.message || "Failed to update form");
    } finally {
      setPublishingId(null); // stop loading
    }
  };

  const copyFormLink = (formId) => {
    const formLink = `${window.location.origin}/submit/${formId}`;
    navigator.clipboard.writeText(formLink).then(() => {
      setCopiedFormId(formId);
      setTimeout(() => setCopiedFormId(null), 2000);
    });
  };

  const filteredForms = forms.filter((form) =>
    form.formTitle.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forms...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">MereForms</h1>
              <p className="text-gray-600 mt-1">
                Manage all your created forms
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/builder")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Create New Form
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  navigate("/login");
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Forms Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredForms.length === 0 ? (
          <div className="text-center py-12">
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
              No forms found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Try adjusting your search"
                : "Get started by creating a new form"}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => navigate("/builder")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Create New Form
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <div
                key={form._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Form Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 truncate flex-1">
                      {form.formTitle || "Untitled Form"}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        form.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {form.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 h-10">
                    {form.formDesc || "No description"}
                  </p>
                </div>

                {/* Published Form Link */}
                {form.isPublished && (
                  <div className="px-6 py-3 bg-green-50 border-b border-green-200">
                    <p className="text-xs text-green-700 mb-2 font-semibold">
                      Share this link to collect submissions:
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/submit/${form._id}`}
                        className="flex-1 text-xs px-2 py-1 border border-green-300 rounded bg-white text-gray-700"
                        onClick={(e) => e.target.select()}
                      />
                      <button
                        onClick={() => copyFormLink(form._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-xs flex items-center gap-1"
                      >
                        {copiedFormId === form._id ? (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Copied
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Form Stats */}
                <div className="px-6 py-4 bg-gray-50">
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-gray-500">Categories</p>
                      <p className="font-semibold text-gray-900">
                        {form.formData?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Questions</p>
                      <p className="font-semibold text-gray-900">
                        {form.formData?.reduce(
                          (sum, cat) => sum + (cat.questions?.length || 0),
                          0,
                        ) || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(form.createdAt).split(",")[0]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleView(form)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition text-sm"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => handleEdit(form)}
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => togglePublish(form._id, form.isPublished)}
                    disabled={publishingId === form._id}
                    className={`flex-1 ${
                      form.isPublished
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white px-3 py-2 rounded transition text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {publishingId === form._id ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Updating...
                      </>
                    ) : form.isPublished ? (
                      "Unpublish"
                    ) : (
                      "Publish"
                    )}
                  </button>
                </div>

                <div className="px-6 pb-4 flex gap-2">
                  <button
                    onClick={() => handleViewSubmissions(form._id)}
                    className="flex-1 bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition text-sm"
                  >
                    Submissions
                  </button>
                  <button
                    onClick={() => handleDelete(form._id)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </button>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Last updated: {formatDate(form.updatedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyForms;
