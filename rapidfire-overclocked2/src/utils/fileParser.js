import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Parses a file (CSV or Excel) and returns array of row objects
 */
export const readFileRows = async (file) => {
  const extension = file.name.split('.').pop().toLowerCase();

  if (extension === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
        complete: (results) => resolve(results.data),
        error: (err) => reject(err)
      });
    });
  }

  // Excel files (.xlsx, .xls)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parses team names from uploaded rows with flexible column detection.
 * Looks for "Name" or "Team Name" (case-insensitive match) and ignores extra columns.
 */
export const parseTeamListFromFile = async (file) => {
  const rows = await readFileRows(file);
  if (!rows || rows.length === 0) {
    throw new Error("File is empty or contains no readable rows.");
  }

  const teamNames = [];

  // Inspect first row to find matching column header
  const sampleRow = rows[0];
  const keys = Object.keys(sampleRow);

  // Search for column matching "name" or "team name" or "team"
  let targetKey = keys.find(k => {
    const cleaned = k.toLowerCase().trim();
    return cleaned === 'name' || cleaned === 'team name' || cleaned === 'team' || cleaned === 'team_name';
  });

  if (!targetKey) {
    // If only one column exists, use that column
    if (keys.length === 1) {
      targetKey = keys[0];
    } else {
      // Fallback: check if any header contains "team" or "name"
      targetKey = keys.find(k => {
        const cleaned = k.toLowerCase().trim();
        return cleaned.includes('team') || cleaned.includes('name');
      });
    }
  }

  if (!targetKey) {
    throw new Error(
      `Could not detect a team name column. Found columns: [${keys.join(', ')}]. Expected 'Name' or 'Team Name'.`
    );
  }

  for (const row of rows) {
    const rawVal = row[targetKey];
    if (rawVal !== undefined && rawVal !== null) {
      const name = String(rawVal).trim();
      if (name && !teamNames.includes(name)) {
        teamNames.push(name);
      }
    }
  }

  if (teamNames.length === 0) {
    throw new Error(`Found column '${targetKey}', but it contained no non-empty team names.`);
  }

  return teamNames;
};

/**
 * Parses questions from uploaded rows.
 * Expected columns: Question, Type, Option A, Option B, Option C, Option D, Correct Answer
 */
export const parseQuestionsFromFile = async (file) => {
  const rows = await readFileRows(file);
  if (!rows || rows.length === 0) {
    throw new Error("File is empty or contains no readable rows.");
  }

  const questions = [];

  rows.forEach((row, idx) => {
    // Case-insensitive key lookup helper
    const getVal = (...possibleKeys) => {
      for (const pk of possibleKeys) {
        const foundKey = Object.keys(row).find(k => k.toLowerCase().trim() === pk.toLowerCase().trim());
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
          return String(row[foundKey]).trim();
        }
      }
      return "";
    };

    const questionText = getVal('question', 'question text', 'prompt', 'q');
    if (!questionText) return; // Skip empty question rows

    const typeRaw = getVal('type', 'question type', 'format').toLowerCase();
    const isTextType = typeRaw === 'text' || typeRaw === 'short answer';
    const type = isTextType ? 'text' : 'mcq';

    const optA = getVal('option a', 'option 1', 'a', 'opt a');
    const optB = getVal('option b', 'option 2', 'b', 'opt b');
    const optC = getVal('option c', 'option 3', 'c', 'opt c');
    const optD = getVal('option d', 'option 4', 'd', 'opt d');

    const options = [optA, optB, optC, optD].filter(o => Boolean(o));
    const correctAnswer = getVal('correct answer', 'correct', 'answer', 'ans');

    questions.push({
      id: `q-upload-${Date.now()}-${idx + 1}`,
      type: options.length >= 2 && type !== 'text' ? 'mcq' : (type === 'mcq' && options.length === 0 ? 'text' : type),
      question: questionText,
      options: options,
      correctAnswer: correctAnswer || (options.length > 0 ? options[0] : "")
    });
  });

  if (questions.length === 0) {
    throw new Error("No valid questions found. Ensure the file contains a 'Question' column.");
  }

  return questions;
};
