const logModel = require("./models/log");

async function logAction(email, action) {
    try {
        const newLog = new logModel({
            email: email,
            action: action,
        });
        await newLog.save();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = logAction;
