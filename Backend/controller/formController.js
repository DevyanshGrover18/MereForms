import Form from "../models/Form.js";
import FormSubmission from "../models/FormSubmission.js"

export const uploadForm = async (req, res) => {
  try {
    const { formTitle, formDesc, bgColor, bgImage, formData } = req.body;

    const sanitizedFormData = formData?.map(section => ({
      ...section,
      questions: section.questions?.filter(q => q.questionType && q.questionType.trim() !== '') ?? []
    })) ?? [];

    const form = new Form({
      userId: req.user._id,
      formTitle,
      formDesc,
      bgColor,
      bgImage,
      formData: sanitizedFormData,
    });

    await form.save();

    res.status(201).json({ message: "Form created successfully", form });
  } catch (error) {
    console.error("Create form error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getAllForms = async (req, res) => {
  try {
    const forms = await Form.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      forms,
      count: forms.length,
    });
  } catch (error) {
    console.error("Get forms error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFormById = async (req, res) => {
  try {
    const form = await Form.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.json({ form });
  } catch (error) {
    console.error("Get form error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateFormById = async (req, res) => {
  try {
    const { formTitle, formDesc, bgColor, bgImage, formData, isPublished } =
      req.body;

    const form = await Form.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Update fields
    if (formTitle !== undefined) form.formTitle = formTitle;
    if (formDesc !== undefined) form.formDesc = formDesc;
    if (bgColor !== undefined) form.bgColor = bgColor;
    if (bgImage !== undefined) form.bgImage = bgImage;
    if (formData !== undefined) form.formData = formData;
    if (isPublished !== undefined) form.isPublished = isPublished;

    await form.save();

    res.json({
      message: "Form updated successfully",
      form,
    });
  } catch (error) {
    console.error("Update form error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteForm = async (req, res) => {
  try {
    const form = await Form.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Also delete all submissions for this form
    await FormSubmission.deleteMany({ formId: req.params.id });

    res.json({ message: "Form deleted successfully" });
  } catch (error) {
    console.error("Delete form error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const submitForm = async (req, res) => {
  try {
    const { responses, submittedBy } = req.body;

    // Check if form exists and is published
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    if (!form.isPublished) {
      return res.status(403).json({ message: "This form is not published" });
    }

    const submission = new FormSubmission({
      formId: req.params.id,
      responses,
      submittedBy: submittedBy || "Anonymous",
    });

    await submission.save();

    res.status(201).json({
      message: "Form submitted successfully",
      submissionId: submission._id,
    });
  } catch (error) {
    console.error("Submit form error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getSubmittedForm = async (req, res) => {
  try {
    // Verify form belongs to user
    const form = await Form.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    const submissions = await FormSubmission.find({
      formId: req.params.id,
    }).sort({
      createdAt: -1,
    });

    res.json({
      submissions,
      count: submissions.length,
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//unauthenticated routes

export const getPublicForm = async(req,res)=>{
  try {
    const form = await Form.findOne({
      _id: req.params.id,
      isPublished: true 
    });

    if (!form) {
      return res.status(404).json({ 
        message: 'Form not found or not published' 
      });
    }

    res.json({
      _id: form._id,
      formTitle: form.formTitle,
      formDesc: form.formDesc,
      bgColor: form.bgColor,
      bgImage: form.bgImage,
      formData: form.formData,
      isPublished: form.isPublished
    });
  } catch (error) {
    console.error('Error fetching public form:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const submitPublicForm = async (req, res)=>{
  try {
    const { submitterName, submitterEmail, submitterPhone, responses } = req.body;

    if (!submitterName || !submitterEmail) {
      return res.status(400).json({ 
        message: 'Name and email are required' 
      });
    }

    const form = await req.db.collection('forms').findOne({
      _id: req.params.id,
      isPublished: true
    });

    if (!form) {
      return res.status(404).json({ 
        message: 'Form not found or not accepting submissions' 
      });
    }

    const submission = {
      formId: req.params.id,
      formTitle: form.formTitle,
      submitterName,
      submitterEmail,
      submitterPhone: submitterPhone || '',
      responses,
      submittedAt: new Date(),
      isGuest: true
    };

    const result = await req.db.collection('submissions').insertOne(submission);

    res.status(201).json({ 
      message: 'Form submitted successfully',
      submissionId: result.insertedId
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ message: 'Failed to submit form' });
  }
}