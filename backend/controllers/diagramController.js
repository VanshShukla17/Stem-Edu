const Diagram = require('../models/Diagram');

/**
 * GET /api/diagrams
 * List all available interactive diagrams
 */
const getDiagrams = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.subject) {
      filter.subjectCode = req.query.subject.toLowerCase();
    }

    const diagrams = await Diagram.find(filter).sort({ createdAt: 1 });
    res.status(200).json(diagrams);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/diagrams/:id
 * Fetch single diagram with all SVG elements, coordinates, and explanations
 */
const getDiagramById = async (req, res, next) => {
  try {
    const id = req.params.id;

    // Support lookup by ObjectId or subjectCode (e.g. 'physics', 'biology', 'chemistry')
    let diagram = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      diagram = await Diagram.findById(id);
    }

    if (!diagram) {
      diagram = await Diagram.findOne({ subjectCode: id.toLowerCase() });
    }

    if (!diagram) {
      return res.status(404).json({ message: 'Diagram not found' });
    }

    res.status(200).json(diagram);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDiagrams,
  getDiagramById
};
