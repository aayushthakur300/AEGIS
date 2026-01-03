module.exports = function severity(code) {
  if (["SEGMENTATION_FAULT", "OUT_OF_MEMORY"].includes(code)) return "CRITICAL";
  if (["STACK_OVERFLOW", "DEADLOCK"].includes(code)) return "HIGH";
  return "MEDIUM";
};
