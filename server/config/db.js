const admin = require('firebase-admin');

// CONNECT TO DATABASE
const serviceAccount = require("./admin_test.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://net-monitor-thdl.firebaseio.com"
});

const db = admin.firestore();

module.exports = db;