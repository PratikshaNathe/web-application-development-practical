
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (options) {
        return options.length === 4 &&
          options.every(option => option.trim().length > 0);
      },
      message: "Each question must have four non-empty options."
    }
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  marks: {
    type: Number,
    default: 1,
    min: 1
  }
});

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "student"],
    default: "student"
  }
}, { timestamps: true });

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  questions: [questionSchema],
  registeredStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }
}, { timestamps: true });

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true
  },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    selectedAnswer: {
      type: Number,
      min: 0,
      max: 3
    }
  }],
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// A student can have only one submitted result per exam.
resultSchema.index(
  { student: 1, exam: 1 },
  { unique: true }
);

const Student = mongoose.model("Student", studentSchema);
const Exam = mongoose.model("Exam", examSchema);
const Result = mongoose.model("Result", resultSchema);

module.exports = { Student, Exam, Result };
