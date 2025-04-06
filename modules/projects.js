require("dotenv").config();
require("pg");
const { Sequelize, DataTypes } = require("sequelize");

let sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  dialect: "postgres",
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

// Sector Model
const Sector = sequelize.define(
  "Sector",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sector_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

// Project model
const Project = sequelize.define(
  "Project",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: DataTypes.STRING,
    feature_img_url: DataTypes.STRING,
    summary_short: DataTypes.TEXT,
    intro_short: DataTypes.TEXT,
    impact: DataTypes.TEXT,
    original_source_url: DataTypes.STRING,
  },
  {
    timestamps: false,
  }
);

Project.belongsTo(Sector, { foreignKey: "sector_id" });

const initialize = () => {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        console.log("Database synced successfully.");
        resolve();
      })
      .catch((err) => {
        console.error("Error syncing database:", err);
        reject("Error syncing database: " + err);
      });
  });
};

const getAllProjects = () => {
  return Project.findAll({
    include: [Sector],
  })
    .then((projects) => {
      return projects;
    })
    .catch((err) => {
      throw new Error("Error fetching projects: " + err);
    });
};

const getProjectById = (projectId) => {
  return Project.findAll({
    where: { id: projectId }, // Filter by project ID
    include: [Sector],
  })
    .then((projects) => {
      if (projects.length === 0) {
        throw new Error(`Unable to find requested project with ID: ${projectId}`);
      }
      return projects[0];
    })
    .catch((err) => {
      throw new Error("Error fetching project: " + err);
    });
};

const getProjectsBySector = (sector) => {
  return Project.findAll({
    include: [Sector],
    where: {
      "$Sector.sector_name$": {
        [Sequelize.Op.iLike]: `%${sector}%`, // iLike = Case-insensitive search
      },
    },
  })
    .then((projects) => {
      if (projects.length === 0) {
        throw new Error(`Unable to find requested projects in sector: ${sector}`);
      }
      return projects;
    })
    .catch((err) => {
      throw new Error("Error fetching projects: " + err);
    });
};

// addProject function
function addProject(projectData) {
  return new Promise((resolve, reject) => {
    Project.create(projectData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}

// getAllSectors function
function getAllSectors() {
  return new Promise((resolve, reject) => {
    Sector.findAll()
      .then((sectors) => {
        resolve(sectors);
      })
      .catch((err) => {
        reject("Error fetching sectors: " + err);
      });
  });
}

// Update project function
function updateProject(id, updatedData) {
  return Project.update(updatedData, {
    where: { id: id },
  })
    .then(() => {
      console.log("Project updated successfully.");
    })
    .catch((err) => {
      throw new Error("Error updating project: " + err);
    });
}

// Edit project function
function editProject(id, updatedData) {
  return new Promise((resolve, reject) => {
    Project.findByPk(id)
      .then((project) => {
        if (!project) {
          return reject({ message: 'Project not found' });
        }
        project.update(updatedData)
          .then(() => {
            resolve();
          })
          .catch((err) => {
            reject({ message: err.errors[0].message });
          });
      })
      .catch((err) => {
        reject({ message: err.message });
      });
  });
}

// Delete project function
function deleteProject(id) {
  return Project.destroy({
    where: { id: id },
  })
    .then((deletedCount) => {
      if (deletedCount > 0) {
        return;
      } else {
        throw new Error("Project not found.");
      }
    })
    .catch((err) => {
      throw new Error(err.errors ? err.errors[0].message : "Error deleting project");
    });
}

module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  sequelize,
  Sector,
  Project,
  addProject,
  getAllSectors,
  updateProject,
  editProject,
  deleteProject,
};