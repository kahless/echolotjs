"use strict";

const In = require("./");

function getGlobal() {
  // eslint-disable-next-line no-new-func
  return Function("return this")();
}

const confObj = process.env.INTROVERSION_CONF;
const confFile = process.env.INTROVERSION_CONF_FILE;
const name = process.env.INTROVERSION_NAME;

if (confObj) {
  const conf = eval(`(${confObj})`);
  In.setDefaults(conf);
} else if (confFile) {
  // eslint-disable-next-line import/no-dynamic-require
  const conf = require(confFile);
  In.setDefaults(conf);
}

const global = getGlobal();
const _name = name ? name : "In";
global[_name] = In;
