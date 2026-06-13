const mongoose = require('mongoose');

const Model = mongoose.model('Quote');
const { calculate } = require('@/helpers');
const { increaseBySettingKey } = require('@/middlewares/settings');
const schema = require('./schemaValidate');

const create = async (req, res) => {
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

  const { items = [], taxRate = 0, discount = 0 } = value;

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
  body['createdBy'] = req.admin._id;

  const result = await new Model(body).save();
  const fileId = 'quote-' + result._id + '.pdf';
  const updateResult = await Model.findOneAndUpdate(
    { _id: result._id },
    { pdf: fileId },
    { new: true }
  ).exec();

  increaseBySettingKey({ settingKey: 'last_quote_number' });

  return res.status(200).json({
    success: true,
    result: updateResult,
    message: 'Quote created successfully',
  });
};

module.exports = create;
