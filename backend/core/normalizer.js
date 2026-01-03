module.exports = function normalize(log) {
  const e = log.toLowerCase();
  if (e.includes("segmentation")) return "SEGMENTATION_FAULT";
  if (e.includes("nullpointer")) return "NULL_POINTER";
  if (e.includes("out of memory") || e.includes("oom")) return "OUT_OF_MEMORY";
  if (e.includes("stack overflow")) return "STACK_OVERFLOW";
  if (e.includes("deadlock")) return "DEADLOCK";
  return "UNKNOWN_RUNTIME_FAILURE";
};
