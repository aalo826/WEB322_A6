/********************************************************************************
 *  WEB322 – Assignment 06
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 * https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: Aaron Lo Student ID: 111918249 Date: 04/06/2025
 *
 *  Published URL:
 *
 ********************************************************************************/

const projectData = require("./modules/projects");
const express = require("express");
const path = require("path");
const app = express();

const authData = require("./modules/auth-service");
const clientSessions = require("client-sessions");

// Middleware for client-sessions
app.use(
  clientSessions({
    cookieName: "session",
    secret: "gp2h0t9jsjDJ0910Df0wsm1nFA90FJ1l",
    duration: 30 * 60 * 1000,
    activeDuration: 2 * 60 * 1000,
  })
);

// Make session available to all templates
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Ensuer Login function
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public", "views"));

const stuInfo = {
  name: "Aaron Lo",
  stuNum: "111918249",
};

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Related middleware to be able to parse the request body.
app.use(express.text());

// Makes files accessible in the "public" folder
app.use(express.static("public"));

// Initialize the projects (this will populate the projects array)
projectData
  .initialize()
  .then(() => authData.initialize()) // Initialize the authentication module
  // If promise is resolved THEN
  .then(() => {
    console.log("Projects initialized successfully.");
    // Server starts
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  })
  // Promise is rejected
  .catch((error) => {
    console.error("Error initializing projects:", error);
  });

// Route for home page
app.get("/", (req, res) => res.render("home", { page: "/" }));

// Route for about page
app.get("/about", (req, res) => res.render("about", { page: "/about" }));

// Route for 404 page
app.get("/404", (req, res) => res.render("404", { page: "/404" }));

// GET "/solutions/projects"
app.get("/solutions/projects", (req, res) => {
  const sector = req.query.sector;

  //  Filter projects based on the sector if given
  if (sector) {
    projectData
      .getProjectsBySector(sector)
      .then((projects) => {
        const currentTime = new Date().toLocaleString();
        // Render the projects
        res.render("projects", {
          studentName: stuInfo.name,
          studentId: stuInfo.stuNum,
          timestamp: currentTime,
          projects: projects,
          page: "/solutions/projects",
        });
      })
      .catch((error) => {
        // Send 404 status and render the 404.ejs page
        res.status(404).render("404", {
          message: `Sorry, no project sectors found under: ${sector}`,
          studentName: stuInfo.name,
          studentId: stuInfo.stuNum,
          timestamp: new Date().toLocaleString(),
        });
      });
  } else {
    // Gives all projects if sector not given
    projectData
      .getAllProjects()
      // If promise is resolved THEN
      .then((projects) => {
        const currentTime = new Date().toLocaleString();
        res.render("projects", {
          // res.render instead of res.json
          studentName: stuInfo.name,
          studentId: stuInfo.stuNum,
          timestamp: currentTime,
          projects: projects,
          page: "/solutions/projects",
        });
      })
      // Promise is rejected
      .catch((error) => {
        // Send 404 status and render the 404.ejs page
        res.status(404).render("404", {
          message: "Sorry, the page you requested could not be found.",
          studentName: stuInfo.name,
          studentId: stuInfo.stuNum,
          timestamp: new Date().toLocaleString(),
        });
      });
  }
});

// GET "/solutions/projects/id-demo"
app.get("/solutions/projects/:id", (req, res) => {
  const projectId = parseInt(req.params.id, 10); // Convert from string to integer
  projectData
    .getProjectById(projectId)
    // If promise is resolved THEN
    .then((project) => {
      const currentTime = new Date().toLocaleString();
      res.render("project", {
        // res.render instead of res.json
        project: project,
      });
    })
    // Promise is rejected
    .catch((error) => {
      // Send 404 status and render the 404.ejs page
      res.status(404).render("404", {
        message: "Sorry, there was an error finding the specific project.",
        studentName: stuInfo.name,
        studentId: stuInfo.stuNum,
        timestamp: new Date().toLocaleString(),
      });
    });
});

// Route for "/solutions/addProject" (GET)
app.get("/solutions/addProject", ensureLogin, (req, res) => {
  projectData
    .getAllSectors()
    .then((sectorData) => {
      res.render("addProject", { sectors: sectorData });
    })
    .catch((err) => {
      res.status(500).render("500", {
        message: `An error occurred while fetching sectors: ${err}`,
        studentName: stuInfo.name,
        studentId: stuInfo.stuNum,
        timestamp: new Date().toLocaleString(),
      });
    });
});

// Route for "/solutions/addProject" (POST)
app.post("/solutions/addProject", ensureLogin, (req, res) => {
  const projectDataFromForm = req.body;
  projectData
    .addProject(projectDataFromForm)
    .then(() => {
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
        studentName: stuInfo.name,
        studentId: stuInfo.stuNum,
        timestamp: new Date().toLocaleString(),
      });
    });
});

// Route for "/soultions/editingProject" (GET)
app.get("/solutions/editProject/:id", ensureLogin, (req, res) => {
  const projectId = parseInt(req.params.id, 10); // Convert from string to integer
  projectData
    .getProjectById(projectId)
    .then((project) => {
      projectData
        .getAllSectors()
        .then((sectors) => {
          res.render("editProject", {
            project: project,
            sectors: sectors,
          });
        })
        .catch((error) => {
          res.status(404).render("404", {
            message: "Error fetching sectors.",
            studentName: stuInfo.name,
            studentId: stuInfo.stuNum,
            timestamp: new Date().toLocaleString(),
          });
        });
    })
    .catch((error) => {
      res.status(404).render("404", {
        message: "Project not found.",
        studentName: stuInfo.name,
        studentId: stuInfo.stuNum,
        timestamp: new Date().toLocaleString(),
      });
    });
});

// Route for "/soultions/editingProject" (POST)
app.post("/solutions/editProject", ensureLogin, (req, res) => {
  const {
    id,
    title,
    feature_img_url,
    summary_short,
    intro_short,
    impact,
    original_source_url,
    sector_id,
  } = req.body;

  const updatedProjectData = {
    title,
    feature_img_url,
    summary_short,
    intro_short,
    impact,
    original_source_url,
    sector_id,
  };

  projectData
    .updateProject(id, updatedProjectData)
    .then(() => {
      res.redirect(`/solutions/projects/${id}`);
    })
    .catch((error) => {
      res.status(400).render("404", {
        message: "Error updating the project.",
        studentName: stuInfo.name,
        studentId: stuInfo.stuNum,
        timestamp: new Date().toLocaleString(),
      });
    });
});

// Route for  "/solutions/deleteProject/:id"
app.get("/solutions/deleteProject/:id", ensureLogin, (req, res) => {
  const projectId = req.params.id;
  projectData
    .deleteProject(projectId)
    .then(() => {
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      });
    });
});

// Route for /login (GET)
app.get("/login", (req, res) => {
  res.render("login", {
    errorMessage: "",
    userName: "",
  });
});

// Route for /register (GET)
app.get("/register", (req, res) => {
  res.render("register", {
    errorMessage: "",
    successMessage: "",
    userName: "",
  });
});

// Route for /register (POST)
app.post("/register", (req, res) => {
  const userData = req.body;

  authData
    .registerUser(userData)
    .then(() => {
      res.render("register", {
        errorMessage: "",
        successMessage: "User created",
        userName: "",
      });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        successMessage: "",
        userName: req.body.userName,
      });
    });
});

// Route for /login (POST)
app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");

  authData
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("login", {
        errorMessage: err.message,
        userName: req.body.userName,
      });
    });
});

// Route for /logout (GET)
app.get("/logout", (req, res) => {
  req.session.reset(); // Reset the session
  res.redirect("/"); // Redirect to homepage
});

// Route for /userHistory (GET)
app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});

// 404 errors for invalid routes
app.use((req, res) => {
  res.status(404).render("404", {
    message: "Sorry, the page you requested could not be found.",
    studentName: stuInfo.name,
    studentId: stuInfo.stuNum,
    timestamp: new Date().toLocaleString(),
  });
});

// 500 errors for unexpected server issues
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500", {
    message: "An unexpected error occurred on the server.",
    studentName: stuInfo.name,
    studentId: stuInfo.stuNum,
    timestamp: new Date().toLocaleString(),
  });
});

// POST Route
app.post("/post-request", (req, res) => {
  const currentTime = new Date().toLocaleString();
  console.log(req.body);
  res.json({
    studentName: stuInfo.name,
    studentId: stuInfo.stuNum,
    timestamp: currentTime,
    requestBody: req.body,
  });
  console.log(req.body);
});

module.exports = app;
