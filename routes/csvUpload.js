const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const { Readable } = require("stream");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for CSV files
  },
  fileFilter: (req, file, cb) => {
    // Check if file is a CSV
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"), false);
    }
  },
});

// @route   POST /api/csv-upload/attendees
// @desc    Upload CSV file to parse attendee data
// @access  Private
router.post("/attendees", auth, upload.single("csv"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No CSV file provided" });
    }

    const attendees = [];
    const errors = [];

    // Create readable stream from buffer
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csv())
      .on("data", (row) => {
        // Validate required fields
        const name = row.name || row.Name || row.NAME;
        const empId =
          row.empId ||
          row.emp_id ||
          row.EmpId ||
          row.EMP_ID ||
          row.employeeId ||
          row.employee_id;
        const contractor =
          row.contractor || row.Contractor || row.CONTRACTOR || "";

        if (!name || !empId) {
          errors.push({
            row: attendees.length + 1,
            error: "Missing required fields: name and empId are required",
            data: row,
          });
          return;
        }

        // Check for duplicate empId in current upload
        const existingEmpId = attendees.find(
          (attendee) => attendee.empId === empId
        );
        if (existingEmpId) {
          errors.push({
            row: attendees.length + 1,
            error: `Duplicate employee ID: ${empId}`,
            data: row,
          });
          return;
        }

        attendees.push({
          name: name.trim(),
          empId: empId.trim(),
          contractor: contractor.trim(),
        });
      })
      .on("end", () => {
        if (attendees.length === 0) {
          return res.status(400).json({
            message: "No valid attendees found in CSV file",
            errors,
          });
        }

        res.json({
          message: "CSV processed successfully",
          data: {
            attendees,
            totalCount: attendees.length,
            errors: errors.length > 0 ? errors : null,
          },
        });
      })
      .on("error", (error) => {
        console.error("CSV parsing error:", error);
        res.status(500).json({
          message: "Error parsing CSV file",
          error: error.message,
        });
      });
  } catch (error) {
    console.error("CSV upload error:", error);
    res.status(500).json({
      message: "Server error during CSV processing",
      error: error.message,
    });
  }
});

// @route   POST /api/csv-upload/validate-attendees
// @desc    Validate attendee data against existing records
// @access  Private
router.post("/validate-attendees", auth, async (req, res) => {
  try {
    const { attendees } = req.body;

    if (!attendees || !Array.isArray(attendees)) {
      return res.status(400).json({
        message: "Attendees array is required",
      });
    }

    const validationResults = {
      valid: [],
      invalid: [],
      duplicates: [],
    };

    const seenEmpIds = new Set();

    attendees.forEach((attendee, index) => {
      const { name, empId, contractor } = attendee;

      // Check for required fields
      if (!name || !empId) {
        validationResults.invalid.push({
          index,
          attendee,
          error: "Missing required fields: name and empId are required",
        });
        return;
      }

      // Check for duplicates in current batch
      if (seenEmpIds.has(empId)) {
        validationResults.duplicates.push({
          index,
          attendee,
          error: `Duplicate employee ID in batch: ${empId}`,
        });
        return;
      }

      seenEmpIds.add(empId);

      // Basic validation
      if (name.trim().length < 2) {
        validationResults.invalid.push({
          index,
          attendee,
          error: "Name must be at least 2 characters long",
        });
        return;
      }

      if (empId.trim().length < 3) {
        validationResults.invalid.push({
          index,
          attendee,
          error: "Employee ID must be at least 3 characters long",
        });
        return;
      }

      validationResults.valid.push({
        index,
        attendee: {
          name: name.trim(),
          empId: empId.trim(),
          contractor: contractor ? contractor.trim() : "",
        },
      });
    });

    res.json({
      message: "Validation completed",
      data: {
        total: attendees.length,
        valid: validationResults.valid.length,
        invalid: validationResults.invalid.length,
        duplicates: validationResults.duplicates.length,
        results: validationResults,
      },
    });
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({
      message: "Server error during validation",
      error: error.message,
    });
  }
});

// @route   GET /api/csv-upload/template
// @desc    Download CSV template for attendee data
// @access  Private
router.get("/template", auth, (req, res) => {
  try {
    const csvContent = `name,empId,contractor
John Doe,EMP001,ABC Construction Ltd
Jane Smith,EMP002,XYZ Builders
Mike Johnson,EMP003,Metro Contractors`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendees_template.csv"
    );
    res.send(csvContent);
  } catch (error) {
    console.error("Template download error:", error);
    res.status(500).json({
      message: "Server error during template download",
      error: error.message,
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File too large. Maximum size is 5MB." });
    }
  }

  if (error.message === "Only CSV files are allowed") {
    return res.status(400).json({ message: error.message });
  }

  next(error);
});

module.exports = router;
