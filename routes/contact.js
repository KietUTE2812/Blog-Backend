const express = require('express');

const router = express.Router();

const { createContact, getContacts, deleteContact, getContactById, updateContact } = require('../controller/contactController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/', createContact);
router.get('/', auth, adminAuth, getContacts);
router.get('/:id', auth, adminAuth, getContactById);
router.delete('/:id', auth, adminAuth, deleteContact);
router.put('/:id', auth, adminAuth, updateContact);

module.exports = router;