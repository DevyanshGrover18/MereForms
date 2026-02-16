import express from "express";
const router = express.Router();
import {
  uploadForm,
  getAllForms,
  getFormById,
  updateFormById,
  deleteForm,
  submitForm,
  getSubmittedForm,
  getPublicForm,
  submitPublicForm
} from "../controller/formController.js";
import {protect} from '../middleware/auth.js'

// Public routes - no auth required
router.get('/public/:id', getPublicForm)
router.post('/public/:id/submit', submitPublicForm)

// Protected routes
router.route("/").post(protect, uploadForm).get(protect, getAllForms);
router.route("/:id").get(protect, getFormById).put(protect, updateFormById).delete(protect, deleteForm);
router.post('/:id/submit', protect, submitForm)
router.get('/:id/submissions', protect, getSubmittedForm)

export default router;