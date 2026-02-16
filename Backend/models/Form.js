import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    required: true,
    enum: [
      "text",
      "radio",
      "select",
      "checkbox",
      "number",
      "date",
      "email",
      "textarea",
      "file",
    ],
  },
  options: [String],
  required: {
    type: Boolean,
    default: false,
  },
  conditions: [
    {
      conditionIf: String,
      conditionValue: String,
      conditionDo: String,
      conditionField: String,
    },
  ],
  hide: {
    type: Boolean,
    default: false,
  },
});

const categorySchema = new mongoose.Schema({
  id: Number,
  title: String,
  questions: [questionSchema],
});

const formSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    formTitle: {
      type: String,
      required: [true, "Form title is required"],
    },
    formDesc: {
      type: String,
      default: "",
    },
    bgColor: {
      type: String,
      default: "bg-gray-300",
    },
    bgImage: {
      type: String,
      default: null,
    },
    formData: [categorySchema],
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Form", formSchema)
