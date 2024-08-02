const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../middleware/auth'); // ensure authentication
const User = require('../models/User'); // user model
const Transaction = require('../models/Transaction'); // transaction model
const bcrypt = require('bcryptjs');

// provide path to html
const publicDir = path.join(__dirname, '../public');

// render add fund page
router.get('/top-up-account', auth, (req, res) => {
    res.sendFile(path.join(publicDir, 'topUpAccount.html'));
});

// render transfer page
router.get('/transfer-money', auth, (req, res) => {
    res.sendFile(path.join(publicDir, 'transferMoney.html'));
});

// handle req to add fund
router.post('/top-up', auth, async (req, res) => {
    const { amount, transactionPassword } = req.body;

    try {
        const user = req.session.user;
        if (!user) {
            return res.status(401).send('User not authenticated');
        }

        // get authentication pw
        const isMatch = await bcrypt.compare(transactionPassword, user.transactionPassword);
        if (!isMatch) {
            return res.status(400).send('Invalid transaction password');
        }

        // update user balance
        user.balance += parseFloat(amount);
        await user.save();

        // create transaction
        await Transaction.create({ userId: user.id, type: 'top-up', amount });

        res.redirect('/welcome');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// process transfer req
router.post('/transfer', auth, async (req, res) => {
    const { amount, receiverId, transactionPassword } = req.body;

    try {
        const user = req.session.user;
        if (!user) {
            return res.status(401).send('User not authenticated');
        }

        // authentication pw
        const isMatch = await bcrypt.compare(transactionPassword, user.transactionPassword);
        if (!isMatch) {
            return res.status(400).send('Invalid transaction password');
        }

        // ensure user exist
        const receiver = await User.findByPk(receiverId);
        if (!receiver) {
            return res.status(404).send('Receiver not found');
        }

        // update balance
        if (user.balance < amount) {
            return res.status(400).send('Insufficient balance');
        }
        user.balance -= parseFloat(amount);
        await user.save();

        // update receiver balance
        receiver.balance += parseFloat(amount);
        await receiver.save();

        // create transaction record
        await Transaction.create({ userId: user.id, type: 'transfer', amount, receiverId: receiver.id });

        res.redirect('/welcome');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
