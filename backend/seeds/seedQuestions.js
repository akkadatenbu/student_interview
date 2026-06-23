// backend/seeds/seedQuestions.js
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const db = require("../config/db");

async function seedQuestions() {
  try {
    console.log("Starting to seed question data...");

    // Clear existing data
    await db.query("DELETE FROM question");
    console.log("Cleared existing question data");

    // Path to the CSV file
    const csvPath = path.join(__dirname, "../../data/question.csv");

    console.log(`Reading CSV file from: ${csvPath}`);

    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      throw new Error(`File not found: ${csvPath}`);
    }

    // Read the file content to diagnose format issues
    const fileContent = fs.readFileSync(csvPath, { encoding: 'utf8' });
    console.log("First 200 characters of the file:");
    console.log(fileContent.substring(0, 200));
    
    // Try to determine delimiter by looking at the first line
    const firstLine = fileContent.split('\n')[0];
    console.log("First line:", firstLine);
    
    // Count occurrences of common delimiters
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const tabCount = (firstLine.match(/\t/g) || []).length;
    console.log(`Delimiter counts - Comma: ${commaCount}, Semicolon: ${semicolonCount}, Tab: ${tabCount}`);
    
    // Determine the most likely delimiter
    let delimiter = ','; // Default
    if (semicolonCount > commaCount && semicolonCount > tabCount) {
      delimiter = ';';
    } else if (tabCount > commaCount && tabCount > semicolonCount) {
      delimiter = '\t';
    }
    console.log(`Using delimiter: ${delimiter === '\t' ? 'tab' : delimiter}`);
    
    // Create a promise to track when all rows are processed
    return new Promise((resolve, reject) => {
      const results = [];
      let rowCount = 0;
      let isFirstRow = true; // Flag to identify header row
      let columnKeys = []; // Will store the actual property keys

      fs.createReadStream(csvPath)
        .pipe(
          csv({
            separator: delimiter,
            trim: true,
            skipLines: 0,
            headers: false
          })
        )
        .on("data", (data) => {
          rowCount++;
          
          // Debug the raw data object to see its structure
          console.log(`Raw data object for row ${rowCount}:`, JSON.stringify(data));
          
          // For the first row, capture the actual property keys
          if (isFirstRow) {
            columnKeys = Object.keys(data);
            console.log("Actual column keys:", columnKeys);
            isFirstRow = false;
            
            // If this is the header row, skip it
            if (columnKeys.length > 0 && data[columnKeys[0]] === 'ข้อ') {
              console.log("Skipping header row");
              return;
            }
          }
          
          // If column keys are empty, there's a problem
          if (columnKeys.length === 0) {
            console.error("No column keys detected - CSV parsing failed");
            return;
          }
          
          // Map data based on column position rather than expecting specific property names
          const mappedData = {
            "ข้อ": data[columnKeys[0]],
            "คำถาม": data[columnKeys[1]],
            "รูปปบบคำถาม": data[columnKeys[2]],
            "ตัวเลือกคำตอบ": data[columnKeys[3]],
            "เงื่อนไขเชื่อมโยง": data[columnKeys[4]],
            "แสดงคำถามเพิ่มตามเงื่อนไข": data[columnKeys[5]]
          };
          
          console.log(`Mapped data for row ${rowCount}:`, mappedData);

          // Validate row data
          if (mappedData["ข้อ"] && mappedData["คำถาม"] && mappedData["รูปปบบคำถาม"]) {
            results.push(mappedData);
            console.log(`Row ${rowCount} is valid`);
          } else {
            console.warn(`Row ${rowCount} is invalid, missing required fields:`, {
              "ข้อ": mappedData["ข้อ"],
              "คำถาม": mappedData["คำถาม"],
              "รูปปบบคำถาม": mappedData["รูปปบบคำถาม"],
            });
          }
        })
        .on("end", async () => {
          try {
            console.log(`Total rows in CSV: ${rowCount}`);
            console.log(`Valid rows for insert: ${results.length}`);

            // No valid data found
            if (results.length === 0) {
              // Try a different approach - manual parsing
              console.log("Attempting manual CSV parsing...");
              const manualResults = manualParseCsv(fileContent, delimiter);
              
              if (manualResults.length === 0) {
                reject(new Error("No valid data found in CSV file after manual parsing"));
                return;
              }
              
              console.log(`Manually parsed ${manualResults.length} valid rows`);
              
              // Continue with the manual results
              await insertQuestions(manualResults);
              console.log(`Seeded ${manualResults.length} questions successfully`);
              resolve(manualResults.length);
              return;
            }

            // Insert questions
            await insertQuestions(results);
            console.log(`Seeded ${results.length} questions successfully`);
            resolve(results.length);
          } catch (err) {
            console.error("Error inserting question data:", err);
            reject(err);
          }
        })
        .on("error", (err) => {
          console.error("Error reading CSV:", err);
          reject(err);
        });
    });
  } catch (error) {
    console.error("Error in seedQuestions:", error);
    throw error;
  }
}

// Helper function for manual CSV parsing as a fallback
function manualParseCsv(content, delimiter) {
  const lines = content.split('\n');
  const results = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split by the delimiter, handling potential quotes
    let parts = [];
    let inQuotes = false;
    let currentPart = '';
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"' && (j === 0 || line[j-1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        parts.push(currentPart);
        currentPart = '';
      } else {
        currentPart += char;
      }
    }
    
    // Add the last part
    parts.push(currentPart);
    
    // Map parts to the expected structure
    const row = {
      "ข้อ": parts[0],
      "คำถาม": parts[1],
      "รูปปบบคำถาม": parts[2],
      "ตัวเลือกคำตอบ": parts[3],
      "เงื่อนไขเชื่อมโยง": parts[4],
      "แสดงคำถามเพิ่มตามเงื่อนไข": parts[5]
    };
    
    // Validate row
    if (row["ข้อ"] && row["คำถาม"] && row["รูปปบบคำถาม"]) {
      results.push(row);
      console.log(`Manually parsed row ${i} is valid`);
    }
  }
  
  return results;
}

// Helper function to insert questions into the database
async function insertQuestions(questions) {
  for (const row of questions) {
    // Convert to proper integer if it's a string
    const questionId = parseInt(row["ข้อ"], 10);

    if (isNaN(questionId)) {
      console.warn(
        `Invalid question_id: ${row["ข้อ"]}, skipping row`
      );
      continue;
    }

    console.log(
      `Inserting question: ${questionId}, ${row["คำถาม"]?.substring(
        0,
        30
      )}...`
    );

    try {
      // Start a transaction
      await db.query('BEGIN');

      // Insert with more detailed error logging
      await db.query(
        `INSERT INTO question 
          (question_id, question_text, question_type, answer_options, condition_logic, condition_display) 
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          questionId,
          row["คำถาม"],
          row["รูปปบบคำถาม"],
          row["ตัวเลือกคำตอบ"] || null,
          row["เงื่อนไขเชื่อมโยง"] || null,
          row["แสดงคำถามเพิ่มตามเงื่อนไข"] || null,
        ]
      );

      // Commit the transaction
      await db.query('COMMIT');
      console.log(`Inserted question ID ${questionId} successfully`);
    } catch (insertError) {
      // Rollback on error
      await db.query('ROLLBACK');
      console.error(`Error inserting question ID ${questionId}:`, insertError);
      throw insertError;
    }
  }
}

module.exports = seedQuestions;