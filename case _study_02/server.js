
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");

const { Student, Exam, Result } = require("./models/models");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  name: "exam.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 1000
  }
}));

// Make the logged-in user available to EJS pages.
app.use(async (req, res, next) => {
  res.locals.currentUser = null;

  if (req.session.userId) {
    try {
      res.locals.currentUser = await Student.findById(
        req.session.userId
      ).select("name email role");
    } catch (error) {
      return next(error);
    }
  }

  next();
});

// Authentication middleware
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.userId || req.session.role !== "admin") {
    return res.status(403).send("Access denied. Administrator only.");
  }
  next();
}

function requireStudent(req, res, next) {
  if (!req.session.userId || req.session.role !== "student") {
    return res.status(403).send("Please log in as a student.");
  }
  next();
}

// Register a student account
app.get("/", (req, res) => {
  res.render("page", { page: "home" });
});

app.get("/register", (req, res) => {
  res.render("page", { page: "register", error: null });
});

app.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 8) {
      return res.status(400).render("page", {
        page: "register",
        error: "Enter all details. Password must have at least 8 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await Student.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).render("page", {
        page: "register",
        error: "This email is already registered."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Student.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "student"
    });

    res.redirect("/login");
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).render("page", {
        page: "register",
        error: "This email is already registered."
      });
    }
    next(error);
  }
});

// Login
app.get("/login", (req, res) => {
  res.render("page", { page: "login", error: null });
});

app.post("/login", async (req, res, next) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    const user = await Student.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).render("page", {
        page: "login",
        error: "Invalid email or password."
      });
    }

    req.session.regenerate((error) => {
      if (error) return next(error);

      req.session.userId = user._id.toString();
      req.session.role = user.role;

      req.session.save((saveError) => {
        if (saveError) return next(saveError);
        res.redirect("/dashboard");
      });
    });
  } catch (error) {
    next(error);
  }
});

// Logout
app.post("/logout", requireLogin, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie("exam.sid");
    res.redirect("/");
  });
});

// Dashboard for administrator or student
app.get("/dashboard", requireLogin, async (req, res, next) => {
  try {
    if (req.session.role === "admin") {
      const exams = await Exam.find().sort({ createdAt: -1 });
      const results = await Result.find()
        .populate("student", "name email")
        .populate("exam", "title")
        .sort({ submittedAt: -1 });

      return res.render("page", {
        page: "admin",
        exams,
        results,
        error: null
      });
    }

    const exams = await Exam.find().sort({ createdAt: -1 });

    const results = await Result.find({
      student: req.session.userId
    })
      .populate("exam", "title")
      .sort({ submittedAt: -1 });

    res.render("page", {
      page: "student",
      exams,
      results
    });
  } catch (error) {
    next(error);
  }
});

// Administrator creates an examination
app.post("/admin/exams", requireAdmin, async (req, res, next) => {
  try {
    const { title, description, duration } = req.body;
    const minutes = Number(duration);

    if (!title || !Number.isInteger(minutes) || minutes < 1) {
      return res.status(400).send("Enter a title and valid duration.");
    }

    await Exam.create({
      title: title.trim(),
      description: description || "",
      duration: minutes,
      createdBy: req.session.userId
    });

    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
});

// Administrator adds a multiple-choice question
app.post(
  "/admin/exams/:id/questions",
  requireAdmin,
  async (req, res, next) => {
    try {
      const { text, option1, option2, option3, option4,
        correctAnswer, marks } = req.body;

      const options = [option1, option2, option3, option4];
      const answer = Number(correctAnswer);
      const questionMarks = Number(marks || 1);

      if (
        !text ||
        options.some(option => !option || !option.trim()) ||
        !Number.isInteger(answer) ||
        answer < 0 || answer > 3 ||
        !Number.isInteger(questionMarks) ||
        questionMarks < 1
      ) {
        return res.status(400).send("Enter a valid question and four options.");
      }

      const exam = await Exam.findById(req.params.id);
      if (!exam) return res.status(404).send("Exam not found.");

      exam.questions.push({
        text: text.trim(),
        options: options.map(option => option.trim()),
        correctAnswer: answer,
        marks: questionMarks
      });

      await exam.save();
      res.redirect("/dashboard");
    } catch (error) {
      next(error);
    }
  }
);

// Administrator deletes an exam if no result has been submitted
app.post(
  "/admin/exams/:id/delete",
  requireAdmin,
  async (req, res, next) => {
    try {
      const exam = await Exam.findById(req.params.id);
      if (!exam) return res.status(404).send("Exam not found.");

      const hasResults = await Result.exists({ exam: exam._id });
      if (hasResults) {
        return res.status(400).send(
          "This exam has submitted results and cannot be deleted."
        );
      }

      await Exam.findByIdAndDelete(exam._id);
      res.redirect("/dashboard");
    } catch (error) {
      next(error);
    }
  }
);

// Student registers for an exam
app.post(
  "/exams/:id/register",
  requireStudent,
  async (req, res, next) => {
    try {
      const exam = await Exam.findById(req.params.id);
      if (!exam) return res.status(404).send("Exam not found.");

      if (exam.questions.length === 0) {
        return res.status(400).send(
          "This exam has no questions yet. Please try later."
        );
      }

      const alreadySubmitted = await Result.exists({
        student: req.session.userId,
        exam: exam._id
      });

      if (alreadySubmitted) {
        return res.status(400).send("You have already attempted this exam.");
      }

      if (!exam.registeredStudents.some(
        id => id.toString() === req.session.userId
      )) {
        exam.registeredStudents.push(req.session.userId);
        await exam.save();
      }

      res.redirect("/dashboard");
    } catch (error) {
      next(error);
    }
  }
);

// Student opens an examination
app.get(
  "/exams/:id/attempt",
  requireStudent,
  async (req, res, next) => {
    try {
      const exam = await Exam.findById(req.params.id);
      if (!exam) return res.status(404).send("Exam not found.");

      const registered = exam.registeredStudents.some(
        id => id.toString() === req.session.userId
      );

      if (!registered) {
        return res.status(403).send("Register for this exam first.");
      }

      const previousResult = await Result.exists({
        student: req.session.userId,
        exam: exam._id
      });

      if (previousResult) {
        return res.status(400).send("You have already submitted this exam.");
      }

      if (exam.questions.length === 0) {
        return res.status(400).send("This exam has no questions yet.");
      }

      // Do not send correct answers to the browser.
      const safeExam = {
        _id: exam._id,
        title: exam.title,
        duration: exam.duration,
        questions: exam.questions.map(question => ({
          _id: question._id,
          text: question.text,
          options: question.options,
          marks: question.marks
        }))
      };

      res.render("page", { page: "attempt", exam: safeExam });
    } catch (error) {
      next(error);
    }
  }
);

// Student submits an examination; score is calculated on the server
app.post(
  "/exams/:id/submit",
  requireStudent,
  async (req, res, next) => {
    try {
      const exam = await Exam.findById(req.params.id);
      if (!exam) return res.status(404).send("Exam not found.");

      const registered = exam.registeredStudents.some(
        id => id.toString() === req.session.userId
      );

      if (!registered) {
        return res.status(403).send("Register for this exam first.");
      }

      const previousResult = await Result.exists({
        student: req.session.userId,
        exam: exam._id
      });

      if (previousResult) {
        return res.status(400).send("This exam has already been submitted.");
      }

      const answers = [];
      let score = 0;
      let totalMarks = 0;

      for (const question of exam.questions) {
        totalMarks += question.marks;

        const rawAnswer = req.body.answers
          ? req.body.answers[question._id.toString()]
          : undefined;

        const selectedAnswer =
          rawAnswer === undefined || rawAnswer === ""
            ? null
            : Number(rawAnswer);

        const validAnswer =
          Number.isInteger(selectedAnswer) &&
          selectedAnswer >= 0 &&
          selectedAnswer <= 3;

        answers.push({
          questionId: question._id,
          selectedAnswer: validAnswer ? selectedAnswer : null
        });

        if (validAnswer && selectedAnswer === question.correctAnswer) {
          score += question.marks;
        }
      }

      const result = await Result.create({
        student: req.session.userId,
        exam: exam._id,
        answers,
        score,
        totalMarks
      });

      res.redirect(`/results/${result._id}`);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).send("This exam has already been submitted.");
      }
      next(error);
    }
  }
);

// View a result: only its owner or an administrator
app.get("/results/:id", requireLogin, async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate("student", "name email")
      .populate("exam", "title duration");

    if (!result) return res.status(404).send("Result not found.");

    const isAdmin = req.session.role === "admin";
    const isOwner =
      result.student._id.toString() === req.session.userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).send("You cannot view this result.");
    }

    res.render("page", { page: "result", result });
  } catch (error) {
    next(error);
  }
});

// Not-found and general error handlers
app.use((req, res) => {
  res.status(404).send("Page not found.");
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send(
    "Something went wrong. Check the terminal for details."
  );
});

// Create the initial administrator and start the server
async function start() {
  if (!process.env.MONGO_URI || !process.env.SESSION_SECRET) {
    throw new Error("Set MONGO_URI and SESSION_SECRET in your .env file.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const adminEmail = (
    process.env.ADMIN_EMAIL || "admin@example.com"
  ).trim().toLowerCase();

  const existingAdmin = await Student.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || adminPassword.length < 8) {
      throw new Error("Set an administrator password of at least 8 characters.");
    }

    await Student.create({
      name: process.env.ADMIN_NAME || "Administrator",
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 12),
      role: "admin"
    });

    console.log("Initial administrator account created.");
  }

  const port = Number(process.env.PORT) || 3000;

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

start().catch(error => {
  console.error("Failed to start application:", error.message);
  process.exit(1);
});
