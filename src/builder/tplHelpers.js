export function include(component, widgetPath, widgetName) {
  return `{{include ${widgetPath}}}\n`;
}

export function includeSet(component) {
  return "(includeSet)";
}

export function includeMeta(component) {
  return "(includeMeta)";
}

export function includeBody(component) {
  return "(includeBody)";
}

export function includeCSS(component) {
  return "(includeCSS)";
}

export function includeJSOptions(component) {
  return "(includeJSOptions)";
}

export function includeServerHelper(component) {
  return "(includeServerHelper)";
}

export function getHtmlClass(component) {
  return "(getHtmlClass)";
}

export function getString(component) {
  return "(getString)";
}

export function getLink(component) {
  return "(getLink)";
}

export function getOption(component) {
  return "(getOption)";
}

export function getImageURL(component) {
  return "(getImageURL)";
}

export function IFNOT(component) {
  return "(IFNOT)";
}

export function IF(component) {
  return "(IF)";
}

export function ENDIF(component) {
  return "(ENDIF)";
}

export default {
  include,
  includeSet,
  includeMeta,
  includeBody,
  includeCSS,
  includeJSOptions,
  includeServerHelper,
  getHtmlClass,
  getString,
  getLink,
  getOption,
  getImageURL,
  IFNOT,
  IF,
  ENDIF
};
