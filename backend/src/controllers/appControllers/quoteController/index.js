const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Quote');

const sendMail = require('./sendMail');
const create = require('./create');
const update = require('./update');
const paginatedList = require('./paginatedList');
const convert = require('./convert');

methods.mail = sendMail;
methods.create = create;
methods.update = update;
methods.list = paginatedList;
methods.convert = convert;

module.exports = methods;
