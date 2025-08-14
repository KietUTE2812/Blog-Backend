const Contact = require('../models/Contact');
const { handleAsync } = require('../middleware/validation');
const { sendEmail } = require('../service/mailService');
const response = require('../config/response');

const createContact = handleAsync(async (req, res) => {
    const { name, email, message } = req.body;

    await Contact.create({ name, email, message });

    await sendEmail(process.env.EMAIL_USER, 'Contact Form Submission', message); // Send email to admin
    return response(res, 201, 'Contact created successfully');
});

const getContacts = handleAsync(async (req, res) => {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    const skip = (page - 1) * limit;
    const contacts = await Contact.find()
        .sort({ [sort]: order === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit);
    return response(res, 200, 'Contacts fetched successfully', contacts);
});

const deleteContact = handleAsync(async (req, res) => {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    return response(res, 200, 'Contact deleted successfully');
});

const getContactById = handleAsync(async (req, res) => {
    const { id } = req.params;
    const contact = await Contact.findById(id);
    return response(res, 200, 'Contact fetched successfully', contact);
});

const updateContact = handleAsync(async (req, res) => {
    const { id } = req.params;
    const { name, email, message } = req.body;
    await Contact.findByIdAndUpdate(id, { name, email, message });
    return response(res, 200, 'Contact updated successfully');
});

module.exports = {
    createContact,
    getContacts,
    deleteContact,
    getContactById,
    updateContact
}