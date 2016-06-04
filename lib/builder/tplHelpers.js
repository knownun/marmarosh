"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.include = include;
exports.includeSet = includeSet;
exports.includeMeta = includeMeta;
exports.includeBody = includeBody;
exports.includeCSS = includeCSS;
exports.includeJSOptions = includeJSOptions;
exports.includeServerHelper = includeServerHelper;
exports.getHtmlClass = getHtmlClass;
exports.getString = getString;
exports.getLink = getLink;
exports.getOption = getOption;
exports.getImageURL = getImageURL;
exports.IFNOT = IFNOT;
exports.IF = IF;
exports.ENDIF = ENDIF;
function include(component, widgetPath, widgetName) {
  return "{{include " + widgetPath + "}}\n";
}

function includeSet(component) {
  return "(includeSet)";
}

function includeMeta(component) {
  return "(includeMeta)";
}

function includeBody(component) {
  return "(includeBody)";
}

function includeCSS(component) {
  return "(includeCSS)";
}

function includeJSOptions(component) {
  return "(includeJSOptions)";
}

function includeServerHelper(component) {
  return "(includeServerHelper)";
}

function getHtmlClass(component) {
  return "(getHtmlClass)";
}

function getString(component) {
  return "(getString)";
}

function getLink(component) {
  return "(getLink)";
}

function getOption(component) {
  return "(getOption)";
}

function getImageURL(component) {
  return "(getImageURL)";
}

function IFNOT(component) {
  return "(IFNOT)";
}

function IF(component) {
  return "(IF)";
}

function ENDIF(component) {
  return "(ENDIF)";
}

exports.default = {
  include: include,
  includeSet: includeSet,
  includeMeta: includeMeta,
  includeBody: includeBody,
  includeCSS: includeCSS,
  includeJSOptions: includeJSOptions,
  includeServerHelper: includeServerHelper,
  getHtmlClass: getHtmlClass,
  getString: getString,
  getLink: getLink,
  getOption: getOption,
  getImageURL: getImageURL,
  IFNOT: IFNOT,
  IF: IF,
  ENDIF: ENDIF
};