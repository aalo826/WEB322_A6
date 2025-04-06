const projectData = require("../modules/projects");

// Mock projectData functions
jest.mock("../modules/projects");

describe("test projects - Aaron Lo - 111918249", () => {

  // Test for getAllProjects
  it("should return all projects", async () => {
    const mockProjects = [
      { id: 1, name: "Project 1", sector: "IT" },
      { id: 2, name: "Project 2", sector: "Business" },
      { id: 3, name: "Project 3", sector: "Tech" },
      { id: 4, name: "Project 4", sector: "Bank" },
      { id: 5, name: "Project 5", sector: "Retail" },
    ];
    projectData.getAllProjects.mockResolvedValue(mockProjects);
    const projects = await projectData.getAllProjects();
    expect(projects).toEqual(mockProjects);
    expect(projects.length).toBeGreaterThan(0);
  });

  // Test for getProjectById with a valid ID
  it("should return the correct project when a valid ID is given", async () => {
    const mockProject = { id: 1, name: "Project 1", sector: "IT" };
    projectData.getProjectById.mockResolvedValue(mockProject);
    const project = await projectData.getProjectById(1);
    expect(project).toEqual(mockProject);
    expect(project.id).toBe(1);
    expect(project.name).toBe("Project 1");
  });

  // Test for getProjectById with an invalid ID
  it("should reject with an error when given an invalid ID", async () => {
    projectData.getProjectById.mockRejectedValue(new Error("Project not found"));
    await expect(projectData.getProjectById(99)).rejects.toThrow("Project not found");
  });

  // Test for getProjectsBySector with a valid sector
  it("should return projects for a valid sector", async () => {
    const mockProjects = [
      { id: 1, name: "Project 1", sector: "IT" },
      { id: 2, name: "Project 2", sector: "IT" },
    ];
    projectData.getProjectsBySector.mockResolvedValue(mockProjects);
    const projects = await projectData.getProjectsBySector("IT");
    expect(projects).toEqual(mockProjects);
    expect(projects.length).toBeGreaterThan(0);
  });

  // Test for getProjectsBySector with an invalid sector
  it("should reject with an error when given an invalid sector", async () => {
    projectData.getProjectsBySector.mockRejectedValue(new Error("Sector not found"));
    await expect(projectData.getProjectsBySector("InvalidSector")).rejects.toThrow(
      "Sector not found"
    );
  });

  // Test for getProjectsBySector when no projects are found for the given sector
  it("should reject with an error when no projects are found for the given sector", async () => {
    projectData.getProjectsBySector.mockRejectedValueOnce(
      new Error("No projects found for the sector")
    );
    await expect(projectData.getProjectsBySector("IT")).rejects.toThrow(
      "No projects found for the sector"
    );
  });
});
