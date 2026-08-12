const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Protected boards route",
    user: req.user,
  });
});

router.get("/:id", (req, res) => {
  res.json({
    message: "Protected board details route",
    boardId: req.params.id,
    user: req.user,
  });
});

router.post("/", (req, res) => {
  res.status(201).json({
    message: "Protected board create route",
    user: req.user,
    body: req.body,
  });
});

module.exports = router;
