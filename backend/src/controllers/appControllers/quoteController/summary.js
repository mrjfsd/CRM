const mongoose = require('mongoose');

const Model = mongoose.model('Quote');

const summary = async (req, res) => {
  // Aggregate total monetary value of all non-removed quotes
  const result = await Model.aggregate([
    {
      $match: {
        removed: false,
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        total: { $sum: '$total' },
      },
    },
    {
      $project: {
        _id: 0,
        count: 1,
        total: 1,
      },
    },
  ]);

  return res.status(200).json({
    success: true,
    result: result.length > 0 ? result[0] : { count: 0, total: 0 },
    message: 'Successfully fetched the summary of all quotes',
  });
};

module.exports = summary;
