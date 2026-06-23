// backend/seeds/seedInterviewers.js
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const db = require("../config/db");

async function seedInterviewers() {
  try {
    console.log("Starting to seed interviewer data...");

    // Clear existing data
    await db.query("DELETE FROM interviewer");

    // Reset sequence if needed
    // await db.query('ALTER SEQUENCE interviewer_id_seq RESTART WITH 1');

    // Path to the CSV file
    const csvPath = path.join(__dirname, "../../data/interviewer.csv");

    // Create a promise to track when all rows are processed
    return new Promise((resolve, reject) => {
      const results = [];

      fs.createReadStream(csvPath)
        .pipe(csv())
        .on("data", (data) => {
          results.push(data);
        })
        .on("end", async () => {
          try {
            // Insert each interviewer
            for (const row of results) {
              await db.query(
                "INSERT INTO interviewer (staff_id, staff_name, staff_faculty) VALUES ($1, $2, $3)",
                [row.staff_id, row.staff_name, row.staff_faculty]
              );
            }

            console.log(`Seeded ${results.length} interviewers successfully`);
            resolve(results.length);
          } catch (err) {
            console.error("Error inserting interviewer data:", err);
            reject(err);
          }
        })
        .on("error", (err) => {
          console.error("Error reading CSV:", err);
          reject(err);
        });
    });
  } catch (error) {
    console.error("Error in seedInterviewers:", error);
    throw error;
  }
}

module.exports = seedInterviewers;
