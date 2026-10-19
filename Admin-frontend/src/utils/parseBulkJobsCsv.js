import * as XLSX from "xlsx";

const REQUIRED_COLUMNS = ["title", "industry", "responsibilities", "country", "skills"];

const HEADER_ALIASES = {
  job_title: "title",
  "job title": "title",
  industry_sector: "industry",
  preferred_country: "country",
  preferred_state: "state",
  workmode: "workmode",
  work_mode: "workmode",
  remote_preference: "workmode",
  description: "responsibilities",
};

const normalizeHeader = (header) => {
  const key = String(header || "")
    .trim()
    .toLowerCase()
    .replace(/^\uFEFF/, "");
  return HEADER_ALIASES[key] || key;
};

const parseCsvLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const parseSkills = (skillsValue, defaultExperience = 0) => {
  const raw = String(skillsValue || "").trim();
  if (!raw) return [];

  if (raw.includes("|") || raw.includes(":")) {
    return raw
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [skill, experience] = part.split(":").map((value) => value.trim());
        return {
          skill,
          experience: Number(experience) || Number(defaultExperience) || 0,
        };
      })
      .filter((entry) => entry.skill);
  }

  return raw
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .map((skill) => ({
      skill,
      experience: Number(defaultExperience) || 0,
    }));
};

const normalizeWorkMode = (value) => {
  const mode = String(value || "Remote").trim();
  if (!mode) return "Remote";
  if (/^on[-\s]?site$/i.test(mode)) return "Onsite";
  if (/^hybrid$/i.test(mode)) return "Hybrid";
  if (/^remote$/i.test(mode)) return "Remote";
  return mode;
};

export const validateBulkJobRow = (job) => {
  const errors = [];

  if (!job.title?.trim()) errors.push("Title is required");
  if (!job.industry?.trim()) errors.push("Industry is required");
  if (!job.roles?.trim()) errors.push("Roles are required");
  if (!job.responsibilities?.trim()) errors.push("Responsibilities are required");
  if (!job.country?.trim()) errors.push("Country is required");
  if (!job.skills?.length) errors.push("At least one skill is required");

  return errors;
};

const normalizeRawRow = (rawRow) => {
  const row = {};

  Object.entries(rawRow || {}).forEach(([key, value]) => {
    row[normalizeHeader(key)] = String(value ?? "").trim();
  });

  if (!row.roles && row.responsibilities) {
    row.roles = row.responsibilities;
  }

  return row;
};

const normalizeJobRow = (row, rowNumber) => {
  const payload = {
    title: row.title || "",
    industry: row.industry || "",
    roles: row.roles || "",
    responsibilities: row.responsibilities || "",
    workMode: normalizeWorkMode(row.workmode),
    country: row.country || "",
    state: row.state || "",
    skills: parseSkills(row.skills, row.experience),
  };

  const errors = validateBulkJobRow(payload);

  return {
    id: `row-${rowNumber}`,
    rowNumber,
    payload,
    errors,
    isValid: errors.length === 0,
  };
};

const isEmptyRow = (rawRow) => {
  const normalized = normalizeRawRow(rawRow);
  return !Object.values(normalized).some((value) => String(value).trim());
};

const parseRows = (rawRows) => {
  const dataRows = rawRows.filter((row) => !isEmptyRow(row));

  if (!dataRows.length) {
    throw new Error("No job rows found in the uploaded file");
  }

  const normalizedRows = dataRows.map(normalizeRawRow);
  const headerKeys = Object.keys(normalizedRows[0] || {});

  const missingColumns = REQUIRED_COLUMNS.filter(
    (column) => !headerKeys.includes(column),
  );

  if (missingColumns.length) {
    throw new Error(
      `Missing required columns: ${missingColumns.join(", ")}. Download the template and try again.`,
    );
  }

  return normalizedRows.map((row, index) => normalizeJobRow(row, index + 2));
};

export const parseBulkJobsCsv = (text) => {
  const cleanedText = String(text || "")
    .replace(/^\uFEFF/, "")
    .trim();

  const lines = cleanedText.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error("CSV must include a header row and at least one job row");
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rawRows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, columnIndex) => {
      row[header] = values[columnIndex]?.trim() || "";
    });
    return row;
  });

  return parseRows(rawRows);
};

export const parseBulkJobsExcel = (arrayBuffer) => {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("The Excel file does not contain any sheets");
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
  });

  return parseRows(rawRows);
};

export const parseBulkJobsFile = async (file) => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv" || extension === "txt") {
    const text = await file.text();
    return parseBulkJobsCsv(text);
  }

  if (extension === "xlsx" || extension === "xls") {
    const buffer = await file.arrayBuffer();
    return parseBulkJobsExcel(buffer);
  }

  throw new Error(
    "Unsupported file format. Upload a CSV, TXT, or Excel (.xlsx/.xls) file.",
  );
};

export const BULK_JOB_TEMPLATE_ROWS = [
  {
    title: "",
    industry: "",
    roles: "",
    responsibilities: "",
    workMode: "Remote",
    country: "",
    state: "",
    skills: "",
    experience: "",
  },
];

export const downloadBulkJobTemplate = () => {
  const headers = [
    "title",
    "industry",
    "roles",
    "responsibilities",
    "workMode",
    "country",
    "state",
    "skills",
    "experience",
  ];

  const csvContent = [headers.join(",")].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "bulk_jobs_template.csv";
  anchor.click();
  URL.revokeObjectURL(url);
};
