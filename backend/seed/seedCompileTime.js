// backend/seed/seedCompileTime.js
const mongoose = require("mongoose");
const RuntimeSignature = require("../models/RuntimeSignature");
require("dotenv").config({ path: "../../.env" }); // Adjust path if needed

const compileTimeSignatures = [
  // --- 1. TypeScript / JavaScript (Build & Lint) ---
  { pattern: "TS2322: Type .* is not assignable to type", language: "TypeScript", fix: "Type mismatch. Ensure the variable type matches the interface/type definition.", severity: "High" },
  { pattern: "TS2339: Property .* does not exist on type", language: "TypeScript", fix: "You are accessing a property that is not defined on the interface. Add it to the interface or check spelling.", severity: "High" },
  { pattern: "TS2304: Cannot find name", language: "TypeScript", fix: "Variable or type name is missing. Check imports or check for typos.", severity: "High" },
  { pattern: "TS2532: Object is possibly 'undefined'", language: "TypeScript", fix: "Strict null check failed. Use optional chaining (?.) or an if-check.", severity: "Medium" },
  { pattern: "SyntaxError: Unexpected token", language: "JavaScript", fix: "Code syntax error. Check for missing commas, brackets, or mismatched parentheses.", severity: "High" },
  { pattern: "ESLint: '.*' is assigned a value but never used", language: "JavaScript", fix: "Unused variable detected. Remove the variable or disable the lint rule.", severity: "Low" },
  { pattern: "Module not found: Error: Can't resolve", language: "JavaScript", fix: "Import path is incorrect or package is not installed.", severity: "High" },
  { pattern: "TS2420: Class .* incorrectly implements interface", language: "TypeScript", fix: "Class is missing properties required by the interface it implements.", severity: "High" },

  // --- 2. Python (Syntax & Indentation) ---
  { pattern: "SyntaxError: invalid syntax", language: "Python", fix: "General syntax error. Check for missing colons (:), mismatched parentheses, or incorrect keywords.", severity: "High" },
  { pattern: "IndentationError: unexpected indent", language: "Python", fix: "Indentation is inconsistent. Ensure you are not mixing tabs and spaces.", severity: "High" },
  { pattern: "SyntaxError: unexpected EOF while parsing", language: "Python", fix: "The file ends prematurely. You are likely missing a closing parenthesis or bracket.", severity: "High" },
  { pattern: "TabError: inconsistent use of tabs and spaces", language: "Python", fix: "Do not mix tabs and spaces in the same file. Convert all to spaces.", severity: "High" },
  { pattern: "SyntaxError: 'return' outside function", language: "Python", fix: "Return statement found in global scope. It must be inside a 'def' function block.", severity: "High" },

  // --- 3. Java (Compiler Javac) ---
  { pattern: "error: cannot find symbol", language: "Java", fix: "Compiler cannot find the variable, class, or method. Check imports and spelling.", severity: "High" },
  { pattern: "error: incompatible types", language: "Java", fix: "Type mismatch (e.g., assigning String to int). Cast the type or change the variable definition.", severity: "High" },
  { pattern: "error: \';\' expected", language: "Java", fix: "Missing semicolon at the end of the line.", severity: "High" },
  { pattern: "error: method .* in class .* cannot be applied", language: "Java", fix: "Method arguments do not match the definition. Check the number and type of parameters.", severity: "High" },
  { pattern: "error: unclosed string literal", language: "Java", fix: "String is missing a closing quote mark.", severity: "High" },
  { pattern: "error: reached end of file while parsing", language: "Java", fix: "Missing a closing curly brace '}' somewhere in the file.", severity: "High" },

  // --- 4. C / C++ (GCC/Clang) ---
  { pattern: "error: expected \';\' before", language: "C/C++", fix: "Missing semicolon on the previous line.", severity: "High" },
  { pattern: "error: .* was not declared in this scope", language: "C/C++", fix: "Variable used before declaration. Declare it or check header includes.", severity: "High" },
  { pattern: "fatal error: .*: No such file or directory", language: "C/C++", fix: "Header file missing. Check include path or install the library.", severity: "High" },
  { pattern: "error: unknown type name", language: "C/C++", fix: "Type is undefined. Did you forget to include a struct or class header?", severity: "High" },
  { pattern: "error: expected '}' at end of input", language: "C/C++", fix: "Mismatched curly braces. You are missing a closing '}'.", severity: "High" },
  { pattern: "undefined reference to `main'", language: "C/C++", fix: "Linker error. Your program is missing a 'main' function.", severity: "High" },

  // --- 5. Go (Golang Compiler) ---
  { pattern: "syntax error: unexpected .*, expecting", language: "Go", fix: "Go syntax error. Check for missing commas or braces.", severity: "High" },
  { pattern: "imported and not used: .*", language: "Go", fix: "Go forbids unused imports. Use the package or remove the import.", severity: "High" },
  { pattern: "undefined: .*", language: "Go", fix: "Variable or function is undefined in this package.", severity: "High" },
  { pattern: "declared and not used: .*", language: "Go", fix: "Unused variable detected. Use `_` to ignore or remove it.", severity: "High" },
  { pattern: "method .* has pointer receiver", language: "Go", fix: "Method defined on pointer receiver but called on value. Check your interface implementation.", severity: "Medium" },

  // --- 6. Rust (Cargo/Rustc) ---
  { pattern: "error[E0308]: mismatched types", language: "Rust", fix: "Type mismatch. Rust is strongly typed; ensure types align exactly.", severity: "High" },
  { pattern: "error: expected one of `.*`, found `.*`", language: "Rust", fix: "Syntax error. Compiler expected a different token.", severity: "High" },
  { pattern: "error[E0425]: cannot find value .* in this scope", language: "Rust", fix: "Variable not found. Did you forget to import it with `use`?", severity: "High" },
  { pattern: "error[E0382]: use of moved value", language: "Rust", fix: "Ownership error. Value was moved previously. Clone it or use a reference.", severity: "High" },
  { pattern: "error[E0597]: .* does not live long enough", language: "Rust", fix: "Lifetime issue. The reference outlives the data it points to.", severity: "High" },

  // --- 7. C# (.NET Build) ---
  { pattern: "error CS1002: ; expected", language: "C#", fix: "Missing semicolon.", severity: "High" },
  { pattern: "error CS0103: The name .* does not exist", language: "C#", fix: "Variable or class not found in current context.", severity: "High" },
  { pattern: "error CS0029: Cannot implicitly convert type", language: "C#", fix: "Type mismatch. Use an explicit cast.", severity: "High" },
  { pattern: "error CS0246: The type or namespace name .* could not be found", language: "C#", fix: "Missing `using` directive or assembly reference.", severity: "High" },
  { pattern: "error CS1513: } expected", language: "C#", fix: "Missing closing brace.", severity: "High" },

  // --- 8. PHP (Interpreter/Lint) ---
  { pattern: "PHP Parse error: syntax error, unexpected '}'", language: "PHP", fix: "Extra closing brace found or missing opening brace.", severity: "High" },
  { pattern: "PHP Fatal error: Class .* not found", language: "PHP", fix: "Class missing. Check autoloader or `require` paths.", severity: "High" },
  { pattern: "PHP Parse error: syntax error, unexpected end of file", language: "PHP", fix: "Missing closing brace or semicolon at end of file.", severity: "High" },
  { pattern: "PHP Fatal error: Cannot redeclare", language: "PHP", fix: "Function or class declared twice. Wrap in `if (!function_exists)` or check includes.", severity: "High" },

  // --- 9. Swift (Xcode Build) ---
  { pattern: "error: expected ',' separator", language: "Swift", fix: "Missing comma in list or array.", severity: "High" },
  { pattern: "error: use of unresolved identifier", language: "Swift", fix: "Variable name is unknown. Check spelling.", severity: "High" },
  { pattern: "error: value of type .* has no member", language: "Swift", fix: "Property missing on struct/class.", severity: "High" },
  { pattern: "error: cannot convert value of type", language: "Swift", fix: "Type mismatch.", severity: "High" },

  // --- 10. Kotlin (Gradle/Kotlinc) ---
  { pattern: "error: unresolved reference:", language: "Kotlin", fix: "Import missing or variable undefined.", severity: "High" },
  { pattern: "error: type mismatch:", language: "Kotlin", fix: "Expected a different type. Kotlin is statically typed.", severity: "High" },
  { pattern: "error: val cannot be reassigned", language: "Kotlin", fix: "You are trying to change a `val` (immutable). Change it to `var`.", severity: "Medium" },
  { pattern: "error: expecting a top level declaration", language: "Kotlin", fix: "Code placed outside of class/function where not allowed.", severity: "High" },

  // --- 11. SQL (Query Syntax) ---
  { pattern: "syntax error at or near", language: "SQL", fix: "Check your SQL keywords and ensure quotes are balanced.", severity: "High" },
  { pattern: "column .* does not exist", language: "SQL", fix: "Column name is wrong. Check schema definition.", severity: "High" },
  { pattern: "relation .* does not exist", language: "SQL", fix: "Table name is wrong.", severity: "High" },
  { pattern: "ambiguous column name", language: "SQL", fix: "Column exists in multiple joined tables. Use `Table.column` alias.", severity: "Medium" },

  // --- 12. Dart (Flutter Analysis) ---
  { pattern: "Error: Expected ';'", language: "Dart", fix: "Missing semicolon.", severity: "High" },
  { pattern: "Error: Undefined name", language: "Dart", fix: "Variable not defined.", severity: "High" },
  { pattern: "Error: The argument type .* can't be assigned to the parameter type", language: "Dart", fix: "Type mismatch in function call.", severity: "High" },
  { pattern: "Error: A value of type 'Null' can't be assigned", language: "Dart", fix: "Null safety error. Use `?` or `!`.", severity: "Medium" },

  // --- 13. Shell / Bash (Lint) ---
  { pattern: "syntax error: unexpected end of file", language: "Shell", fix: "Missing closing quote or `fi`/`done` keyword.", severity: "High" },
  { pattern: "syntax error near unexpected token `fi'", language: "Shell", fix: "Extra `fi` or missing `if`.", severity: "High" },
  { pattern: "command not found", language: "Shell", fix: "Command is not installed or not in PATH.", severity: "High" },
  
  // --- 14. R (Interpreter) ---
  { pattern: "Error: unexpected symbol in", language: "R", fix: "Syntax error. Check for missing commas or operators.", severity: "High" },
  { pattern: "Error: unexpected '}' in", language: "R", fix: "Unbalanced brackets.", severity: "High" },
  { pattern: "could not find function", language: "R", fix: "Library not loaded. Run `library(pkg_name)`.", severity: "High" },

  // --- 15. Scala (SBT/Scalac) ---
  { pattern: "error: not found: value", language: "Scala", fix: "Variable undefined.", severity: "High" },
  { pattern: "error: type mismatch;", language: "Scala", fix: "Type incompatibility.", severity: "High" },
  { pattern: "error: expected class or object definition", language: "Scala", fix: "File structure error.", severity: "High" },

  // --- 16. Perl (Syntax Check) ---
  { pattern: "syntax error at .* line", language: "Perl", fix: "General syntax error.", severity: "High" },
  { pattern: "Global symbol .* requires explicit package name", language: "Perl", fix: "Variable needs to be declared with `my`.", severity: "High" },
  { pattern: "Can't locate .* in @INC", language: "Perl", fix: "Module missing.", severity: "High" },

  // --- 17. Lua ---
  { pattern: "syntax error near", language: "Lua", fix: "Lua syntax error.", severity: "High" },
  { pattern: "'end' expected (to close 'function' at line", language: "Lua", fix: "Missing `end` keyword.", severity: "High" },
  
  // --- 18. Haskell (GHC) ---
  { pattern: "parse error on input", language: "Haskell", fix: "Indentation error or missing keyword.", severity: "High" },
  { pattern: "Variable not in scope:", language: "Haskell", fix: "Variable undefined.", severity: "High" },
  { pattern: "Couldn't match expected type", language: "Haskell", fix: "Type inference failed.", severity: "High" },

  // --- 19. Elixir (Mix) ---
  { pattern: "syntax error before:", language: "Elixir", fix: "Missing comma or `do` keyword.", severity: "High" },
  { pattern: "function .* is undefined", language: "Elixir", fix: "Function does not exist in module.", severity: "High" },
  
  // --- 20. Objective-C ---
  { pattern: "error: expected identifier or '('", language: "Objective-C", fix: "Syntax error.", severity: "High" },
  { pattern: "error: use of undeclared identifier", language: "Objective-C", fix: "Variable missing.", severity: "High" },

  // --- 21. Dockerfile ---
  { pattern: "Error parsing reference:", language: "Docker", fix: "Invalid image name format.", severity: "High" },
  { pattern: "unknown instruction:", language: "Docker", fix: "Typo in Dockerfile instruction (e.g., RUNN instead of RUN).", severity: "High" },

  // --- 22. Generic / Other ---
  { pattern: "Makefile:.*: *** missing separator", language: "Make", fix: "Indentation error in Makefile. Must use Tabs, not spaces.", severity: "High" },
  { pattern: "YAML Exception", language: "YAML", fix: "Indentation or formatting error in YAML file.", severity: "High" }
];

// If running standalone, we connect and seed
const connectDB = require("../config/db"); 
const seedCompileTime = async () => {
  try {
    await connectDB();
    console.log(`[Seeder] Adding ${compileTimeSignatures.length} compile-time signatures...`);
    
    // We use insertMany (without deleteMany) to append
    await RuntimeSignature.insertMany(compileTimeSignatures);
    
    console.log("[Seeder] Compile-time signatures added successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Uncomment to run standalone
// seedCompileTime();

module.exports = compileTimeSignatures;