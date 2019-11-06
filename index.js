const express = require("express");
const app = require("./src/app")(express());
app.listen(process.env['PORT'] || 8000);