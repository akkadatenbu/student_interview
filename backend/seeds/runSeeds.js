// backend/seeds/runSeeds.js
const seedInterviewers = require("./seedInterviewers");
const seedStudents = require("./seedStudents");
const seedQuestions = require("./seedQuestions");
const db = require("../config/db");

async function runSeeds() {
  try {
    console.log("Starting database seeding...");

    // Run seeds in sequence
    await seedInterviewers();
    await seedStudents();
    await seedQuestions();

    console.log("All seeds completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seeding
runSeeds();
