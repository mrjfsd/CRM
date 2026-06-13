const mongoose = require('mongoose');

const Model = mongoose.model('Quote');
const { calculate } = require('@/helpers');
const schema = require('./schemaValidate');

const update = async (req, res) => {
  let body = req.body;

  const { error, value } = schema.validate(body);
  if (error) {
    const { details } = error;
    return res.status(400).json({
      success: false,
      result: null,
      message: details[0]?.message,
    });
  }

  const { items = [], taxRate = 0, discount = 0 } = req.body;

  if (items.length === 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Items cannot be empty',
    });
  }

  let subTotal = 0;
  let taxTotal = 0;
  let total = 0;

  items.map((item) => {
    let itemTotal = calculate.multiply(item['quantity'], item['price']);
    subTotal = calculate.add(subTotal, itemTotal);
    item['total'] = itemTotal;
  });

  taxTotal = calculate.multiply(subTotal, taxRate / 100);
  total = calculate.sub(calculate.add(subTotal, taxTotal), discount);

  body['subTotal'] = subTotal;
  body['taxTotal'] = taxTotal;
  body['total'] = total;
  body['items'] = items;
  body['pdf'] = 'quote-' + req.params.id + '.pdf';

  if (body.hasOwnProperty('currency')) {
    delete body.currency;
  }

  const result = await Model.findOneAndUpdate({ _id: req.params.id, removed: false }, body, {
    new: true,
  }).exec();

  return res.status(200).json({
    success: true,
    result,
    message: 'Quote updated successfully',
  });
};

module.exports = update;
