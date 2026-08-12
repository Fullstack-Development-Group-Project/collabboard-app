const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Protected tasks route",
    user: req.user,
  });
});

router.post("/", (req, res) => {
  res.status(201).json({
    message: "Protected task create route",
    user: req.user,
    body: req.body,
  });
});

router.put("/:id", (req, res) => {
  res.json({
    message: "Protected task update route",
    taskId: req.params.id,
    user: req.user,
    body: req.body,
  });
});

router.delete("/:id", (req, res) => {
  res.status(204).send();
});

module.exports = router;
