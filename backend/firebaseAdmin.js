
const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = require("./firebase-service-account.json");

const app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount)
    });

const auth = getAuth(app);

module.exports = { auth };
