import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import Preview from "./components/Preview";
import MyForms from "./components/MyForms";
import FormSubmissions from "./components/FormSubmissions";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicFormSubmit from "./components/PublicFormSubmit";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/submit/:formId" element={<PublicFormSubmit />} />
        
        {/* Protected Routes */}
        <Route
          path="/builder"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/preview"
          element={
            <ProtectedRoute>
              <Preview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-forms"
          element={
            <ProtectedRoute>
              <MyForms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submissions/:formId"
          element={
            <ProtectedRoute>
              <FormSubmissions />
            </ProtectedRoute>
          }
        />
        
        {/* Default Route - Redirect to My Forms if logged in, otherwise login */}
        <Route 
          path="/" 
          element={
            localStorage.getItem("token") ? 
            <Navigate to="/my-forms" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
        
        {/* Catch all - Redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;