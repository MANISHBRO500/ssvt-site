const http = require("http");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");
const MAX_BODY_BYTES = 8 * 1024 * 1024;

const DEFAULT_DATA = {
  toppers: [
    {
      id: "topper-1",
      classLevel: 10,
      year: 2026,
      rank: 1,
      name: "Aarav Sharma",
      percentage: 96.4,
      photo: ""
    },
    {
      id: "topper-2",
      classLevel: 10,
      year: 2026,
      rank: 2,
      name: "Riya Kumari",
      percentage: 94.8,
      photo: ""
    },
    {
      id: "topper-3",
      classLevel: 9,
      year: 2026,
      rank: 1,
      name: "Dev Patel",
      percentage: 95.2,
      photo: ""
    },
    {
      id: "topper-4",
      classLevel: 8,
      year: 2026,
      rank: 1,
      name: "Sanya Gupta",
      percentage: 93.6,
      photo: ""
    },
    {
      id: "topper-5",
      classLevel: 7,
      year: 2026,
      rank: 1,
      name: "Kunal Singh",
      percentage: 92.5,
      photo: ""
    },
    {
      id: "topper-6",
      classLevel: 6,
      year: 2026,
      rank: 1,
      name: "Meera Verma",
      percentage: 91.9,
      photo: ""
    },
    {
      id: "topper-7",
      classLevel: 10,
      year: 2025,
      rank: 1,
      name: "Nitin Yadav",
      percentage: 95.1,
      photo: ""
    }
  ],
  events: [
    {
      id: "event-1",
      title: "Annual Result Celebration",
      date: "2026-05-18",
      image:
        "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80",
      caption: "Students and teachers celebrating strong board results."
    },
    {
      id: "event-2",
      title: "Classroom Practice Session",
      date: "2026-04-08",
      image:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
      caption: "Focused practice and doubt clearing for middle school classes."
    }
  ],
  reviews: [
    {
      id: "review-1",
      name: "Priya",
      rating: 5,
      comment: "Teachers explain every topic clearly and give regular tests.",
      createdAt: "2026-05-25T10:30:00.000Z"
    },
    {
      id: "review-2",
      name: "Rahul",
      rating: 4,
      comment: "Good environment for study and revision.",
      createdAt: "2026-05-28T11:15:00.000Z"
    }
  ],
  testResults: [
    {
      id: "test-1",
      classLevel: 10,
      testName: "Monthly Test",
      testDate: "2026-06-01",
      totalMarks: 100,
      studentName: "Aarav Sharma",
      obtainedMarks: 92
    },
    {
      id: "test-2",
      classLevel: 10,
      testName: "Monthly Test",
      testDate: "2026-06-01",
      totalMarks: 100,
      studentName: "Riya Kumari",
      obtainedMarks: 88
    },
    {
      id: "test-3",
      classLevel: 9,
      testName: "Monthly Test",
      testDate: "2026-06-01",
      totalMarks: 100,
      studentName: "Dev Patel",
      obtainedMarks: 90
    },
    {
      id: "test-4",
      classLevel: 8,
      testName: "Monthly Test",
      testDate: "2026-06-01",
      totalMarks: 100,
      studentName: "Sanya Gupta",
      obtainedMarks: 86
    },
    {
      id: "test-5",
      classLevel: 7,
      testName: "Monthly Test",
      testDate: "2026-06-01",
      totalMarks: 100,
      studentName: "Kunal Singh",
      obtainedMarks: 82
    },
    {
      id: "test-6",
      classLevel: 6,
      testName: "Monthly Test",
      testDate: "2026-06-01",
      totalMarks: 100,
      studentName: "Meera Verma",
      obtainedMarks: 84
    },
    {
      id: "test-7",
      classLevel: 10,
      testName: "Revision Test",
      testDate: "2026-05-15",
      totalMarks: 80,
      studentName: "Aarav Sharma",
      obtainedMarks: 72
    }
  ]
};

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp"
};

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
  }
}

function readData() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
      if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
        reject(new Error("Request body is too large."));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("Invalid JSON body."));
      }
    });

    req.on("error", reject);
  });
}

function text(value, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim();
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function id() {
  if (typeof randomUUID === "function") {
    return randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeTopper(body, existing = {}) {
  const classLevel = number(body.classLevel, existing.classLevel);
  const year = number(body.year, existing.year);
  const rank = number(body.rank, existing.rank);
  const name = text(body.name, existing.name);
  const percentage = number(body.percentage, existing.percentage);

  if (!classLevel || !year || !rank || !name || !percentage) {
    throw new Error("Class, year, rank, name, and percentage are required.");
  }

  return {
    ...existing,
    classLevel,
    year,
    rank,
    name,
    percentage,
    photo: text(body.photo, existing.photo)
  };
}

function normalizeEvent(body, existing = {}) {
  const title = text(body.title, existing.title);
  const date = text(body.date, existing.date);
  const image = text(body.image, existing.image);

  if (!title || !date || !image) {
    throw new Error("Event title, date, and image are required.");
  }

  return {
    ...existing,
    title,
    date,
    image,
    caption: text(body.caption, existing.caption)
  };
}

function normalizeReview(body, existing = {}) {
  const name = text(body.name, existing.name || "Guest");
  const rating = Math.max(1, Math.min(5, number(body.rating, existing.rating || 5)));
  const comment = text(body.comment, existing.comment);

  if (!name || !comment) {
    throw new Error("Name and comment are required.");
  }

  return {
    ...existing,
    name,
    rating,
    comment,
    createdAt: existing.createdAt || new Date().toISOString()
  };
}

function normalizeTestResult(body, existing = {}) {
  const classLevel = number(body.classLevel, existing.classLevel);
  const testName = text(body.testName, existing.testName);
  const testDate = text(body.testDate, existing.testDate);
  const totalMarks = number(body.totalMarks, existing.totalMarks);
  const studentName = text(body.studentName, existing.studentName);
  const obtainedMarks = number(body.obtainedMarks, existing.obtainedMarks);

  if (!classLevel || !testName || !testDate || !totalMarks || !studentName) {
    throw new Error("Class, test name, date, total marks, and student name are required.");
  }

  if (obtainedMarks < 0 || obtainedMarks > totalMarks) {
    throw new Error("Obtained marks must be between 0 and total marks.");
  }

  return {
    ...existing,
    classLevel,
    testName,
    testDate,
    totalMarks,
    studentName,
    obtainedMarks
  };
}

function collectionFor(pathname) {
  if (pathname.startsWith("/api/toppers")) {
    return ["toppers", normalizeTopper];
  }

  if (pathname.startsWith("/api/events")) {
    return ["events", normalizeEvent];
  }

  if (pathname.startsWith("/api/reviews")) {
    return ["reviews", normalizeReview];
  }

  if (pathname.startsWith("/api/test-results")) {
    return ["testResults", normalizeTestResult];
  }

  return null;
}

function getIdFromPath(pathname) {
  return decodeURIComponent(pathname.split("/").pop() || "");
}

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/data") {
    sendJson(res, 200, readData());
    return;
  }

  const collection = collectionFor(pathname);
  if (!collection) {
    sendError(res, 404, "API route not found.");
    return;
  }

  const [key, normalize] = collection;
  const data = readData();

  try {
    if (req.method === "POST") {
      const body = await readBody(req);
      const item = normalize(body);
      item.id = id();
      data[key].push(item);
      writeData(data);
      sendJson(res, 201, item);
      return;
    }

    const itemId = getIdFromPath(pathname);
    const itemIndex = data[key].findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      sendError(res, 404, "Item not found.");
      return;
    }

    if (req.method === "PUT") {
      const body = await readBody(req);
      const item = normalize(body, data[key][itemIndex]);
      item.id = itemId;
      data[key][itemIndex] = item;
      writeData(data);
      sendJson(res, 200, item);
      return;
    }

    if (req.method === "DELETE") {
      data[key].splice(itemIndex, 1);
      writeData(data);
      sendJson(res, 200, { ok: true });
      return;
    }

    sendError(res, 405, "Method not allowed.");
  } catch (error) {
    sendError(res, 400, error.message);
  }
}

function safeStaticPath(pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    return null;
  }

  return filePath;
}

function serveStatic(req, res, pathname) {
  const filePath = safeStaticPath(pathname);
  if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const fallback = path.join(PUBLIC_DIR, "index.html");
    if (fs.existsSync(fallback)) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(fs.readFileSync(fallback));
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIME_TYPES[ext] || "application/octet-stream"
  });
  fs.createReadStream(filePath).pipe(res);
}

ensureDataFile();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname.startsWith("/api/")) {
    handleApi(req, res, pathname);
    return;
  }

  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`SSVT Coaching website running at http://localhost:${PORT}`);
});
