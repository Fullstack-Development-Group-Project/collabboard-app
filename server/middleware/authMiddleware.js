// Temporary Auth Middleware to bypass real JWT verification while Group B builds Issue #7

const bypassAuth = (req, res, next) => {
  // Fake the authenticated user (Danindu) from our memoryStore
  req.user = {
    id: "user123",
    name: "Danindu",
    email: "danindu@example.com",
    jobTitle: "Software Developer"
  };
  next();
};

module.exports = { bypassAuth };
