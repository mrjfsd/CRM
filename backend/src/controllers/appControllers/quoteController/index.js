const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Quote');

const sendMail = require('./sendMail');
const create = require('./create');
const update = require('./update');
const paginatedList = require('./paginatedList');
const convert = require('./convert');
const summary = require('./summary');

methods.mail = sendMail;
methods.create = create;
methods.update = update;
methods.list = paginatedList;
methods.convert = convert;
methods.summary = summary;

module.exports = methods;
