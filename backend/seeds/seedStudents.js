// backend/seeds/seedStudents.js
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const db = require("../config/db");

async function seedStudents() {
  try {
    console.log("Starting to seed student data...");

    // Clear existing data
    await db.query("DELETE FROM student");

    // Reset sequence if needed
    // await db.query('ALTER SEQUENCE student_id_seq RESTART WITH 1');

    // Path to the CSV file
    const csvPath = path.join(__dirname, "../../data/student.csv");

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
            // Insert each student
            for (const row of results) {
              await db.query(
                `INSERT INTO student 
                  (student_id, student_name, program, faculty, campus, level, phone, scholarship, graduated_school, hometown) 
                 VALUES 
                  ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                  row["รหัสนักศึกษา"],
                  row["ชื่อนักศึกษา"],
                  row["หลักสูตร"],
                  row["คณะ"],
                  row["วิทยาเขต"],
                  row["ระดับ"],
                  row["เบอร์โทร"],
                  row["ทุนการศึึกษา"],
                  row["โรงเรียนที่จบ"],
                  row["ภูมิลำเนา"],
                ]
              );
            }

            console.log(`Seeded ${results.length} students successfully`);
            resolve(results.length);
          } catch (err) {
            console.error("Error inserting student data:", err);
            reject(err);
          }
        })
        .on("error", (err) => {
          console.error("Error reading CSV:", err);
          reject(err);
        });
    });
  } catch (error) {
    console.error("Error in seedStudents:", error);
    throw error;
  }
}

module.exports = seedStudents;
