const express = require('express');
const router = express.Router();
const { getDiagrams, getDiagramById } = require('../controllers/diagramController');

// GET /api/diagrams
router.get('/diagrams', getDiagrams);

// GET /api/diagrams/:id
router.get('/diagrams/:id', getDiagramById);

module.exports = router;
