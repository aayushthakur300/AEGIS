const mongoose = require("mongoose");
const RuntimeSignature = require("../models/RuntimeSignature");
const connectDB = require("../config/db");
require("dotenv").config({ path: "../../.env" });

const silentLogicalErrors = [
  { pattern: "signed integer overflow", language: "C", fix: "Check integer bounds before arithmetic or use safe math libraries.", severity: "High" },
  { pattern: "sizeof.*pointer.*instead of array", language: "C", fix: "Use explicit length or dereference the array type when calculating size.", severity: "High" },
  { pattern: "assignment.*inside condition", language: "C", fix: "Verify if '==' was intended instead of '='.", severity: "Medium" },
  { pattern: "char signedness", language: "C", fix: "Explicitly use 'signed char' or 'unsigned char'.", severity: "Medium" },
  { pattern: "macro expansion.*precedence", language: "C", fix: "Wrap macro arguments in parentheses.", severity: "High" },
  { pattern: "object slicing", language: "C++", fix: "Pass objects by reference or pointer.", severity: "High" },
  { pattern: "virtual destructor omission", language: "C++", fix: "Declare the base class destructor as virtual.", severity: "High" },
  { pattern: "iterator invalidation", language: "C++", fix: "Do not use iterators after container modification.", severity: "High" },
  { pattern: "map.*operator\\[\\].*unintended", language: "C++", fix: "Use .find() or .at() before accessing keys.", severity: "Medium" },
  { pattern: "copy elision assumption", language: "C++", fix: "Do not rely on side effects in copy/move constructors.", severity: "Low" },
  { pattern: "autoboxing.*NullPointerException", language: "Java", fix: "Check for null before assigning wrapper to primitive.", severity: "High" },
  { pattern: "HashMap key mutation", language: "Java", fix: "Ensure objects used as keys are immutable.", severity: "High" },
  { pattern: "Integer caching.*==", language: "Java", fix: "Use .equals() for object comparison.", severity: "Medium" },
  { pattern: "Time API.*default timezone", language: "Java", fix: "Explicitly specify ZoneId.", severity: "Medium" },
  { pattern: "Stream short-circuit", language: "Java", fix: "Ensure filters/maps don't rely on skipped side-effects.", severity: "Medium" },
  { pattern: "compareTo inconsistent with equals", language: "Java", fix: "Override both methods consistentl.", severity: "Medium" },
  { pattern: "silent truncation.*numeric casting", language: "Java", fix: "Check ranges before casting.", severity: "High" },
  { pattern: "mutable default argument", language: "Python", fix: "Use 'None' as default and initialize inside function.", severity: "High" },
  { pattern: "floating-point equality", language: "Python", fix: "Use math.isclose() or epsilon comparison.", severity: "High" },
  { pattern: "dictionary iteration order", language: "Python", fix: "Do not rely on insertion order in old Python.", severity: "Medium" },
  { pattern: "shadowing built-in", language: "Python", fix: "Rename variables conflicting with built-ins.", severity: "Medium" },
  { pattern: "is used instead of ==", language: "Python", fix: "Use '==' for value equality.", severity: "High" },
  { pattern: "generator exhaustion", language: "Python", fix: "Generators iterate once; convert to list if needed.", severity: "Medium" },
  { pattern: "bare except", language: "Python", fix: "Catch specific exceptions.", severity: "High" },
  { pattern: "truthy falsy coercion", language: "JavaScript", fix: "Use strict checks (===).", severity: "Medium" },
  { pattern: "parseInt.*without radix", language: "JavaScript", fix: "Specify radix 10.", severity: "Medium" },
  { pattern: "floating-point precision.*currency", language: "JavaScript", fix: "Use integer-based currency math.", severity: "High" },
  { pattern: "object reference equality", language: "JavaScript", fix: "Use deep equality check.", severity: "High" },
  { pattern: "async function.*not awaited", language: "JavaScript", fix: "Await the function or return the promise.", severity: "High" },
  { pattern: "JSON stringify.*undefined", language: "JavaScript", fix: "Handle undefined fields manually.", severity: "Low" },
  { pattern: "structural typing.*invalid shape", language: "TypeScript", fix: "Use stricter interfaces/validation.", severity: "High" },
  { pattern: "any masking type", language: "TypeScript", fix: "Avoid 'any'; use 'unknown'.", severity: "High" },
  { pattern: "shadowed variable.*if block", language: "Go", fix: "Avoid redeclaring variables in if-scope.", severity: "Medium" },
  { pattern: "range loop variable reuse", language: "Go", fix: "Capture loop variable in closure.", severity: "High" },
  { pattern: "ignored error return", language: "Go", fix: "Always check error returns.", severity: "High" },
  { pattern: "map iteration order", language: "Go", fix: "Sort keys for deterministic order.", severity: "Medium" },
  { pattern: "zero-value struct", language: "Go", fix: "Validate struct fields.", severity: "Medium" },
  { pattern: "logic hidden.*unwrap", language: "Rust", fix: "Handle Result/Option safely.", severity: "High" },
  { pattern: "incorrect lifetime assumption", language: "Rust", fix: "Verify lifetime annotations.", severity: "High" },
  { pattern: "integer overflow.*release mode", language: "Rust", fix: "Use checking/wrapping arithmetic.", severity: "High" },
  { pattern: "clone.*instead of reference", language: "Rust", fix: "Pass by reference (&T).", severity: "Low" },
  { pattern: "pattern match wildcard", language: "Rust", fix: "Handle enum variants explicitly.", severity: "Medium" },
  { pattern: "integer division truncation", language: "C#", fix: "Cast to float/decimal before division.", severity: "High" },
  { pattern: "DateTime.Now vs UtcNow", language: "C#", fix: "Use DateTime.UtcNow.", severity: "Medium" },
  { pattern: "LINQ deferred execution", language: "C#", fix: "Materialize results with .ToList().", severity: "Medium" },
  { pattern: "floating comparison.*tolerance", language: "C#", fix: "Use epsilon comparison.", severity: "High" },
  { pattern: "Nullable value type misuse", language: "C#", fix: "Check .HasValue before accessing.", severity: "High" },
  { pattern: "loose comparison.*authentication", language: "PHP", fix: "Use strict equality (===).", severity: "Critical" },
  { pattern: "silent type juggling", language: "PHP", fix: "Enable strict_types=1.", severity: "High" },
  { pattern: "empty.*misinterpreting", language: "PHP", fix: "Check specific values (null/false).", severity: "Medium" },
  { pattern: "array auto-conversion", language: "PHP", fix: "Initialize arrays explicitly.", severity: "Low" },
  { pattern: "nil propagation", language: "Ruby", fix: "Use safe navigation (&.).", severity: "Medium" },
  { pattern: "symbol vs string hash key", language: "Ruby", fix: "Use consistent key types.", severity: "Medium" },
  { pattern: "block variable shadowing", language: "Ruby", fix: "Rename block parameters.", severity: "Medium" },
  { pattern: "truthiness.*empty collection", language: "Ruby", fix: "Use .empty? check.", severity: "Medium" },
  { pattern: "optional chaining skipping", language: "Swift", fix: "Handle nil results explicitly.", severity: "Medium" },
  { pattern: "value vs reference semantics", language: "Swift", fix: "Verify struct vs class usage.", severity: "High" },
  { pattern: "elvis operator masking", language: "Kotlin", fix: "Ensure default value covers logic.", severity: "Medium" },
  { pattern: "== vs ===", language: "Kotlin", fix: "Use == for structural equality.", severity: "Low" },
  { pattern: "default arguments hiding", language: "Kotlin", fix: "Pass arguments explicitly if needed.", severity: "Low" },
  { pattern: "partial function.*handling", language: "Scala", fix: "Handle all pattern match cases.", severity: "High" },
  { pattern: "implicit conversion altering", language: "Scala", fix: "Make conversions explicit.", severity: "Medium" },
  { pattern: "lazy val deferring", language: "Scala", fix: "Handle initialization exceptions.", severity: "Medium" },
  { pattern: "word splitting.*unquoted", language: "Bash", fix: "Quote variable expansions.", severity: "High" },
  { pattern: "set -e skipping cleanup", language: "Bash", fix: "Use trap for cleanup.", severity: "High" },
  { pattern: "exit code overwritten", language: "Bash", fix: "Check $PIPESTATUS.", severity: "Medium" },
  { pattern: "globbing expanding", language: "Bash", fix: "Disable globbing or quote wildcards.", severity: "Medium" },
  { pattern: "pipeline auto-enumeration", language: "PowerShell", fix: "Wrap in array to prevent unrolling.", severity: "Medium" },
  { pattern: "null comparison quirks", language: "PowerShell", fix: "Put $null on LHS.", severity: "Low" },
  { pattern: "object vs scalar", language: "PowerShell", fix: "Force array context @().", severity: "Medium" },
  { pattern: "vector recycling", language: "R", fix: "Ensure vector lengths match.", severity: "High" },
  { pattern: "NA propagation", language: "R", fix: "Use na.rm=TRUE.", severity: "Medium" },
  { pattern: "implicit matrix expansion", language: "MATLAB", fix: "Verify array dimensions.", severity: "High" },
  { pattern: "1-based indexing assumption", language: "MATLAB", fix: "Adjust for 1-based indexing.", severity: "High" },
  { pattern: "type instability", language: "Julia", fix: "Return consistent types.", severity: "Medium" },
  { pattern: "broadcasting operator misused", language: "Julia", fix: "Check dot syntax usage.", severity: "Medium" },
  { pattern: "context-sensitive return", language: "Perl", fix: "Force scalar/list context.", severity: "High" },
  { pattern: "regex greediness", language: "Perl", fix: "Use non-greedy quantifiers.", severity: "Medium" },
  { pattern: "table reference aliasing", language: "Lua", fix: "Use deep copy.", severity: "High" },
  { pattern: "nil removal.*shifting", language: "Lua", fix: "Use table.remove.", severity: "Medium" },
  { pattern: "integer truncation", language: "Solidity", fix: "Use SafeMath or 0.8+ checks.", severity: "Critical" },
  { pattern: "modifier order", language: "Solidity", fix: "Check modifier sequence.", severity: "High" },
  { pattern: "default visibility", language: "Solidity", fix: "Explicitly define visibility.", severity: "Critical" },
  { pattern: "async function returning before", language: "Dart", fix: "Await futures.", severity: "High" },
  { pattern: "late variable masking", language: "Dart", fix: "Initialize 'late' vars.", severity: "High" },
  { pattern: "lazy evaluation hiding", language: "Haskell", fix: "Force evaluation.", severity: "Medium" },
  { pattern: "partial function head", language: "Haskell", fix: "Use pattern matching.", severity: "Medium" },
  { pattern: "pattern match binds unintended", language: "Elixir", fix: "Pin existing variables (^var).", severity: "Medium" },
  { pattern: "immutability assumption", language: "Elixir", fix: "Reassign accumulators.", severity: "Medium" },
  { pattern: "message sent to nil", language: "Objective-C", fix: "Check for nil.", severity: "Low" },
  { pattern: "weak reference deallocated", language: "Objective-C", fix: "Capture strongly in blocks.", severity: "High" },
  { pattern: "implicit typing", language: "Fortran", fix: "Use 'implicit none'.", severity: "High" },
  { pattern: "array bounds unchecked", language: "Fortran", fix: "Enable bounds checking.", severity: "High" },
  { pattern: "packed decimal overflow", language: "COBOL", fix: "Handle ON SIZE ERROR.", severity: "Critical" },
  { pattern: "data truncation", language: "COBOL", fix: "Verify field sizes.", severity: "High" },
  { pattern: "silent integer overflow", language: "Zig", fix: "Use saturating ops.", severity: "High" },
  { pattern: "defer misordering", language: "Zig", fix: "Check defer order (LIFO).", severity: "Medium" },
  { pattern: "compile-time constant", language: "Nim", fix: "Distinguish const/let.", severity: "Medium" },
  { pattern: "range slicing off-by-one", language: "Nim", fix: "Check slice bounds.", severity: "Medium" },
  { pattern: "variable shadowing", language: "OCaml", fix: "Rename variables.", severity: "Low" },
  { pattern: "pattern match missing", language: "OCaml", fix: "Handle all cases.", severity: "High" },
  { pattern: "signal vs variable", language: "VHDL", fix: "Check assignment types.", severity: "High" },
  { pattern: "clock edge sensitivity", language: "VHDL", fix: "Check rising_edge().", severity: "High" },
  { pattern: "floating-point NaN", language: "Cross-language", fix: "Use isNaN().", severity: "High" },
  { pattern: "locale-dependent string", language: "Cross-language", fix: "Specify locale.", severity: "Medium" }
];

const seedSilent = async () => {
  try {
    await connectDB();
    console.log(`[Seeder] Adding ${silentLogicalErrors.length} silent logic signatures...`);
    await RuntimeSignature.insertMany(silentLogicalErrors);
    console.log("[Seeder] Silent logic signatures added successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Uncomment to run standalone
// seedSilent();

module.exports = silentLogicalErrors;