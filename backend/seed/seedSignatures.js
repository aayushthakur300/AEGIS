const path = require('path');
const mongoose = require("mongoose");

// 1. Force load .env from root
const dotenvPath = path.resolve(__dirname, '../../.env'); 
const result = require("dotenv").config({ path: dotenvPath });

if (result.error) {
  console.error("\n[ERROR] Could not load .env file from:", dotenvPath);
  process.exit(1);
}

const RuntimeSignature = require("../models/RuntimeSignature");
const connectDB = require("../config/db"); 

// --- IMPORT EXTERNAL MODULES ---
const compileTimeSignatures = require('./seedCompileTime');
const silentErrors = require('./silentLogicalErrors');
const rareConditions = require('./rareEdgeCaseConditions');
const memoryCorruption = require('./memoryCorruptionUB');
const dataCorruption = require('./dataCorruption');
const envCorruption = require('./environmentPlatformCorruption');

// --- FOUNDATIONAL SIGNATURES (Original 1-21 + NEW SUPREME SILENT KILLERS) ---
const signatures = [
  // --- 1. JavaScript / Node.js (1-12) ---
  { pattern: "TypeError: .* is not a function", fix: "Check if the variable is defined and is actually a function. Use optional chaining (?.) if unsure." },
  { pattern: "ReferenceError: .* is not defined", fix: "Variable is missing. Check spelling or scope definition (let/const/var)." },
  { pattern: "Cannot read property .* of undefined", fix: "The parent object is undefined. Initialize it before accessing properties." },
  { pattern: "ERR_HTTP_HEADERS_SENT", fix: "You are trying to send a response (res.json/res.send) twice. Check for missing 'return' statements." },
  { pattern: "React.Children.only expected to receive a single React element child", fix: "A component expects a single child but received multiple. Wrap children in a <Fragment> or <div>." },
  { pattern: "Warning: Each child in a list should have a unique 'key' prop", fix: "Add a unique 'key={id}' prop to the top-level element inside your .map() loop." },
  { pattern: "SyntaxError: Unexpected token < in JSON at position 0", fix: "Your API returned HTML (likely an error page) instead of JSON. Check the network tab response." },
  { pattern: "UnhandledPromiseRejectionWarning", fix: "A Promise was rejected but no .catch() handler was attached. Add await or .catch()." },
  { pattern: "Vue warn: Property or method .* is not defined", fix: "Variable missing from 'data()', 'setup()', or 'props' in your Vue component." },
  { pattern: "Angular: Can't bind to .* since it isn't a known property", fix: "Missing module import. Add the component to the 'declarations' or 'imports' array in NgModule." },
  { pattern: "Access to fetch at .* from origin .* has been blocked by CORS policy", fix: "Enable CORS on your backend server (e.g., app.use(cors()) in Express)." },
  { pattern: "Module not found: Error: Can't resolve", fix: "Webpack/Vite cannot find a file. Check the import path and file extension." },

  // --- 2. Python (13-22) ---
  { pattern: "IndentationError: expected an indented block", fix: "Python relies on whitespace. Ensure your indentation (tabs vs spaces) is consistent." },
  { pattern: "KeyError: .*", fix: "The dictionary key does not exist. Use .get() or check 'if key in dict' before accessing." },
  { pattern: "ValueError: math domain error", fix: "Input to math function is invalid (e.g., sqrt(-1)). Check input validation." },
  { pattern: "ModuleNotFoundError: No module named .*", fix: "The library is missing. Run 'pip install <module_name>'." },
  { pattern: "TypeError: 'NoneType' object is not subscriptable", fix: "You are trying to access [index] or ['key'] on a variable that is None." },
  { pattern: "IndexError: list index out of range", fix: "You are trying to access an index larger than the list size. Check len(list)." },
  { pattern: "RecursionError: maximum recursion depth exceeded", fix: "Infinite recursion detected. Check your base case." },
  { pattern: "FileNotFoundError: \\[Errno 2\\] No such file or directory", fix: "File does not exist at the specified path. Check the file path and permissions." },
  { pattern: "ZeroDivisionError: division by zero", fix: "Attempted to divide by zero. Add a check for the denominator." },
  { pattern: "AttributeError: 'NoneType' object has no attribute", fix: "You are calling a method on a variable that is currently None." },

  // --- 3. Java (23-30) ---
  { pattern: "java.lang.NullPointerException", fix: "Attempted to access a method/field on a null object. Add null checks." },
  { pattern: "java.lang.ArrayIndexOutOfBoundsException", fix: "Array index is invalid. Check loop bounds and array size." },
  { pattern: "java.net.ConnectException: Connection refused", fix: "Target server is down or port is blocked/incorrect." },
  { pattern: "java.lang.ClassNotFoundException", fix: "Class is missing from the classpath. Check Maven/Gradle dependencies." },
  { pattern: "java.lang.OutOfMemoryError: Java heap space", fix: "JVM ran out of memory. Increase heap size (-Xmx) or check for memory leaks." },
  { pattern: "java.lang.StackOverflowError", fix: "Infinite recursion in Java code. Check loop/recursion logic." },
  { pattern: "java.lang.ClassCastException", fix: "Invalid type casting. Check if the object is actually an instance of the target class." },
  { pattern: "java.lang.IllegalArgumentException", fix: "Method passed an illegal or inappropriate argument." },

  // --- 4. C / C++ (31-36) ---
  { pattern: "Segmentation fault", fix: "Accessed memory not allocated to the program. Check pointers and array bounds." },
  { pattern: "double free or corruption", fix: "Memory was freed twice. Check logic in manual memory management (free/delete)." },
  { pattern: "undefined reference to .*", fix: "Linker error. You declared a function but didn't define it, or missed linking a library." },
  { pattern: "stack smashing detected", fix: "Buffer overflow. You wrote past the end of an array on the stack." },
  { pattern: "pure virtual method called", fix: "Called a virtual function that has no implementation. Check object inheritance." },
  { pattern: "std::out_of_range", fix: "Accessed a vector or string position that does not exist." },

  // --- 5. Go (Golang) (37-41) ---
  { pattern: "panic: runtime error: invalid memory address or nil pointer dereference", fix: "Dereferenced a nil pointer in Go. Initialize the struct/pointer before use." },
  { pattern: "fatal error: all goroutines are asleep - deadlock!", fix: "Concurrency deadlock. Check channel operations and sync.WaitGroups." },
  { pattern: "panic: assignment to entry in nil map", fix: "You must initialize a map using 'make(map[type]type)' before assigning values." },
  { pattern: "panic: runtime error: index out of range", fix: "Slice or array index is out of bounds." },
  { pattern: "interface conversion: interface is nil, not", fix: "Type assertion failed. Check the underlying type of the interface." },

  // --- 6. Rust (42-46) ---
  { pattern: "thread 'main' panicked at 'called `Option::unwrap()` on a `None` value'", fix: "Unsafe unwrap used on None. Use match or if let to handle Option safely." },
  { pattern: "borrow of moved value", fix: "Rust ownership error. Variable was moved. Use .clone() or references (&)." },
  { pattern: "cannot borrow .* as mutable more than once at a time", fix: "You cannot have two mutable references to the same data simultaneously." },
  { pattern: "recursion limit reached while expanding macro", fix: "Macro expansion caused an infinite loop. Check macro logic." },
  { pattern: "expected type `.*`, found type `.*`", fix: "Type mismatch. Rust is statically typed; ensure types align perfectly." },

  // --- 7. PHP (47-51) ---
  { pattern: "PHP Fatal error:  Uncaught TypeError", fix: "Type mismatch in function argument or return. Check strict_types settings." },
  { pattern: "PHP Parse error: syntax error, unexpected", fix: "Missing semicolon or parenthesis. Check the line number indicated." },
  { pattern: "PDOException: SQLSTATE\\[HY000\\] \\[2002\\] Connection refused", fix: "Database connection failed. Check credentials and host." },
  { pattern: "PHP Fatal error: Allowed memory size of .* bytes exhausted", fix: "Script used too much RAM. Increase memory_limit in php.ini." },
  { pattern: "PHP Warning: Undefined array key", fix: "Accessing an array key that does not exist. Use isset() or ??" },

  // --- 8. C# / .NET (52-56) ---
  { pattern: "System.NullReferenceException", fix: "Object reference not set to an instance of an object. Check for nulls." },
  { pattern: "System.IndexOutOfRangeException", fix: "Attempted to access an array element outside its bounds." },
  { pattern: "System.InvalidCastException", fix: "Failed to cast object to target type. Check type compatibility." },
  { pattern: "System.IO.FileNotFoundException", fix: "File missing. Check path or build output directory." },
  { pattern: "System.Data.SqlClient.SqlException", fix: "SQL Server error. Check query syntax or connection string." },

  // --- 9. Ruby (57-60) ---
  { pattern: "NoMethodError: undefined method .* for nil:NilClass", fix: "You called a method on a nil object. Check prior assignments." },
  { pattern: "LoadError: cannot load such file", fix: "Gem or file is missing. Run 'bundle install' or check paths." },
  { pattern: "ArgumentError: wrong number of arguments", fix: "Function called with incorrect number of parameters." },
  { pattern: "NameError: uninitialized constant", fix: "Class or Module name is typoed or not required/included." },

  // --- 10. Swift (61-64) ---
  { pattern: "Fatal error: Unexpectedly found nil while unwrapping an Optional value", fix: "Force unwrapped a nil optional (!). Use 'if let' or 'guard let' instead." },
  { pattern: "EXC_BAD_ACCESS", fix: "Memory access error. Often caused by accessing a deallocated object." },
  { pattern: "Signal SIGABRT", fix: "App crashed due to an unhandled exception or UI consistency error." },
  { pattern: "Value of type .* has no member", fix: "Method or property does not exist on this type." },

  // --- 11. Kotlin (65-68) ---
  { pattern: "kotlin.KotlinNullPointerException", fix: "Null safety violation. Check variables marked as non-nullable (!!)." },
  { pattern: "android.view.WindowManager$BadTokenException", fix: "Tried to show a dialog on a finished Activity. Check context validity." },
  { pattern: "UninitializedPropertyAccessException", fix: "Accessing 'lateinit' property before it has been initialized." },
  { pattern: "android.content.ActivityNotFoundException", fix: "Intent failed because no app can handle the request." },

  // --- 12. SQL / Database (69-74) ---
  { pattern: "syntax error at or near", fix: "SQL Syntax error. Check keywords and quoting." },
  { pattern: "duplicate key value violates unique constraint", fix: "Attempted to insert a record with a primary key or unique field that already exists." },
  { pattern: "relation .* does not exist", fix: "Table name is wrong or does not exist in the current schema." },
  { pattern: "column .* does not exist", fix: "Column name is invalid or typoed." },
  { pattern: "deadlock detected", fix: "Two transactions are blocking each other. Review transaction locking order." },
  { pattern: "Too many connections", fix: "Database connection pool is full. Increase limit or close unused connections." },

  // --- 13. Dart / Flutter (75-78) ---
  { pattern: "RenderFlex overflowed by .* pixels", fix: "UI Layout error. Wrap the widget in a Generic, Expanded, or SingleChildScrollView." },
  { pattern: "NoSuchMethodError: The method .* was called on null", fix: "Attempted to call a method on a null object." },
  { pattern: "RangeError (index): Invalid value: Not in inclusive range", fix: "List index is out of bounds." },
  { pattern: "LateInitializationError: Field .* has not been initialized", fix: "Accessed a 'late' variable before assignment." },

  // --- 14. Shell / Bash (79-82) ---
  { pattern: "command not found", fix: "Tool is not installed or not in your PATH." },
  { pattern: "permission denied", fix: "Lack of execution rights. Run with 'sudo' or use 'chmod +x'." },
  { pattern: "syntax error near unexpected token", fix: "Bash script syntax error. Check matching quotes or parentheses." },
  { pattern: "No such file or directory", fix: "Path is incorrect or file is missing." },

  // --- 15. R Language (83-85) ---
  { pattern: "Error in .* : could not find function", fix: "Library not loaded. Use library(name) before calling the function." },
  { pattern: "Error in if .* : missing value where TRUE/FALSE needed", fix: "Condition check (NA) failed. Handle missing values." },
  { pattern: "subscript out of bounds", fix: "Matrix or vector index is invalid." },

  // --- 16. Scala (86-88) ---
  { pattern: "scala.MatchError", fix: "Pattern matching failed. Add a default case (case _ => ...)." },
  { pattern: "java.util.NoSuchElementException: None.get", fix: "Called .get on a None Option. Use .getOrElse or pattern matching." },
  { pattern: "type mismatch; found : .*, required : .*", fix: "Incompatible types detected by the compiler." },

  // --- 17. Perl (89-91) ---
  { pattern: "Can't locate .* in @INC", fix: "Missing module. Install via CPAN or check include paths." },
  { pattern: "Global symbol .* requires explicit package name", fix: "Variable not declared with 'my' while using strict mode." },
  { pattern: "Use of uninitialized value", fix: "Warning: using undefined variable (undef) in string or operation." },

  // --- 18. Lua (92-93) ---
  { pattern: "attempt to index a nil value", fix: "Table is nil. Initialize table before accessing keys." },
  { pattern: "attempt to call a nil value", fix: "Function does not exist or was not assigned." },

  // --- 19. Haskell (94-95) ---
  { pattern: "Non-exhaustive patterns in function", fix: "Function does not handle all possible inputs. Add more pattern matches." },
  { pattern: "Couldn't match expected type", fix: "Type mismatch. Check function signatures and type inference." },

  // --- 20. Elixir (96-97) ---
  { pattern: "no function clause matching in", fix: "Function called with arguments that match no defined clause." },
  { pattern: "argument error", fix: "Function called with invalid arguments." },

  // --- 21. Docker / Cloud / K8s (98-102) ---
  { pattern: "CrashLoopBackOff", fix: "Container starts and immediately crashes. Check application logs (kubectl logs)." },
  { pattern: "OOMKilled", fix: "Container exceeded memory limit. Increase resources or fix memory leaks." },
  { pattern: "ImagePullBackOff", fix: "Cannot pull image. Check image name, tag, and registry credentials." },
  { pattern: "dial tcp: lookup .*: no such host", fix: "DNS lookup failed. Check service name or network settings." },
  { pattern: "AccessDenied: User .* is not authorized to perform", fix: "AWS/Cloud permission error. Update IAM policy." },

  // --- 22. SUPREME SILENT KILLERS & SECURITY THREATS (FORCEFULLY CRITICAL) ---
  // 1. Memory & Resource Silent Killers
  { pattern: "memory leak suspected", fix: "Memory usage grows over time. Profile heap snapshots for leaked references, detached DOM nodes, or retained closures.", severity: "Critical" },
  { pattern: "MaxListenersExceededWarning", fix: "EventEmitter listener leak. Remove unused listeners or use .once() to prevent accumulation.", severity: "Critical" },
  { pattern: "EMFILE: too many open files", fix: "File descriptor exhaustion due to unclosed files or sockets. Ensure proper cleanup and use pooling.", severity: "Critical" },
  { pattern: "Metaspace memory leak", fix: "Classloader leak due to dynamic class loading. Common in frameworks using reflection or hot reload.", severity: "Critical" },
  { pattern: "Unclosed file handles", fix: "Files or streams opened without closing, leading to gradual resource exhaustion.", severity: "Critical" },
  { pattern: "Connection pool exhaustion", fix: "Connections not returned to pool. Always release in finally blocks.", severity: "Critical" },
  { pattern: "Unbounded cache growth", fix: "Cache without eviction policy leads to memory exhaustion. Use TTL or LRU eviction.", severity: "Critical" },
  { pattern: "Unbounded queues", fix: "Producer outpaces consumer causing memory pressure. Apply backpressure or size limits.", severity: "Critical" },

  // 2. Concurrency & Threading Silent Killers
  { pattern: "race condition detected", fix: "Concurrent read/write without synchronization causes data corruption. Use locks, atomics, or transactions.", severity: "Critical" },
  { pattern: "Thread starvation", fix: "Long-running or high-priority threads block others. Adjust thread pools and priorities.", severity: "Critical" },
  { pattern: "Deadlock under load", fix: "Circular lock dependency appears only at scale. Enforce consistent lock ordering.", severity: "Critical" },
  { pattern: "Shared mutable state", fix: "Multiple threads modify shared objects without coordination. Prefer immutability.", severity: "Critical" },
  { pattern: "Improper async/await usage", fix: "Fire-and-forget async tasks hide failures. Always await or track tasks.", severity: "Critical" },
  { pattern: "Background thread swallowing exceptions", fix: "Exceptions caught and ignored in background threads hide system failure.", severity: "Critical" },
  { pattern: "Atomicity violation", fix: "Operations assumed atomic but are not. Use atomic primitives or locks.", severity: "Critical" },

  // 3. Performance & Latency Time Bombs
  { pattern: "N\\+1 query problem", fix: "ORM executes one query per entity. Use eager loading or batch queries.", severity: "Critical" },
  { pattern: "ReDoS: catastrophic backtracking", fix: "Regex with nested quantifiers causes exponential time. Rewrite regex defensively.", severity: "Critical" },
  { pattern: "process.nextTick starvation", fix: "Recursive nextTick blocks event loop. Yield using setImmediate or async breaks.", severity: "Critical" },
  { pattern: "Blocking calls in async code", fix: "Synchronous I/O inside async path blocks threads. Use non-blocking APIs.", severity: "Critical" },
  { pattern: "Inefficient algorithm masked by small data", fix: "O(n²) logic appears fine in tests but collapses at scale.", severity: "Critical" },
  { pattern: "Silent retry storms", fix: "Unbounded retries amplify failures. Implement exponential backoff and circuit breakers.", severity: "Critical" },
  { pattern: "Stale cache data", fix: "Cache invalidation bugs cause incorrect responses without errors.", severity: "Critical" },

  // 4. Data Integrity Silent Killers
  { pattern: "Floating point precision error", fix: "Never use floating point for money. Use decimal or BigDecimal types.", severity: "Critical" },
  { pattern: "Integer overflow", fix: "Values wrap silently. Check bounds or use larger numeric types.", severity: "Critical" },
  { pattern: "Timezone misalignment", fix: "UTC vs local time mismatch causes incorrect ordering and expiry logic.", severity: "Critical" },
  { pattern: "Lost updates", fix: "Last-write-wins overwrites concurrent changes. Use optimistic locking.", severity: "Critical" },
  { pattern: "Duplicate records due to missing constraints", fix: "No unique index allows silent data duplication.", severity: "Critical" },
  { pattern: "Partial writes without rollback", fix: "Multi-step operations fail mid-way without compensating rollback.", severity: "Critical" },
  { pattern: "Incorrect default values", fix: "Defaults mask missing data and create hidden logic errors.", severity: "Critical" },
  { pattern: "Schema evolution data loss", fix: "Field removal or rename causes silent data drops.", severity: "Critical" },

  // 5. Architecture & Configuration Silent Killers
  { pattern: "Feature flags never removed", fix: "Dead code paths accumulate and cause inconsistent behavior.", severity: "Critical" },
  { pattern: "Configuration drift", fix: "Different configs across environments cause non-reproducible bugs.", severity: "Critical" },
  { pattern: "Magic numbers", fix: "Hardcoded values obscure intent and cause incorrect assumptions.", severity: "Critical" },
  { pattern: "Ignoring return values", fix: "APIs signal failure via return codes that are silently ignored.", severity: "Critical" },
  { pattern: "Fallback logic hiding failures", fix: "Fallbacks mask real outages and delay detection.", severity: "Critical" },
  { pattern: "Partial deployments", fix: "Mixed versions across nodes cause undefined behavior.", severity: "Critical" },

  // 6. Security Time Bombs (TRUE Silent Killers)
  { pattern: "Hardcoded secrets", fix: "Secrets in source control lead to long-term credential leaks. Use vaults or env vars.", severity: "Critical" },
  { pattern: "Logging sensitive data", fix: "Passwords, tokens, or PII logged and later exfiltrated.", severity: "Critical" },
  { pattern: "JWT without expiration", fix: "Tokens never expire, enabling long-term abuse.", severity: "Critical" },
  { pattern: "Weak password hashing", fix: "Using MD5/SHA1 allows offline cracking. Use bcrypt/argon2.", severity: "Critical" },
  { pattern: "Missing authorization checks", fix: "Authenticated users gain unintended access due to missing role validation.", severity: "Critical" },
  { pattern: "Trusting client-side validation", fix: "Client checks bypassed silently. Always validate server-side.", severity: "Critical" },
  { pattern: "Improper CORS with credentials", fix: "Wildcard origins with credentials leak authenticated data.", severity: "Critical" },
  { pattern: "Expired certificate", fix: "Certificate expires without monitoring, breaking trust silently until users complain.", severity: "Critical" }
];

async function seed() {
  console.log("---------------------------------------------------");
  console.log("[Seeder] Starting Database Seeding Process...");

  try {
    // 1. Connect to Database
    await connectDB(); 

    // 2. Combine All Data Sets
    // (Foundational + New Silent Killers + 525 Advanced Runtime = Total)
    const allSignatures = [
        ...signatures, // Foundational + New Silent Killers
        ...compileTimeSignatures, // Compile-Time
        ...silentErrors, // Part 1
        ...rareConditions, // Part 2
        ...memoryCorruption, // Part 3
        ...dataCorruption, // Part 4
        ...envCorruption // Part 5
    ];

    console.log(`[Seeder] Preparing to seed ${allSignatures.length} total signatures...`);

    // 3. Clear existing
    await RuntimeSignature.deleteMany({});
    console.log("[Seeder] Cleared existing signatures.");

    // 4. Insert new combined list
    await RuntimeSignature.insertMany(allSignatures);
    
    console.log(`✅ [Seeder] Successfully seeded all ${allSignatures.length} signatures!`);
    console.log("[Seeder] Database is now ready for full-spectrum polyglot analysis.");
  } catch (err) {
    console.error("[Seeder] Error seeding database:", err);
    process.exit(1);
  } finally {
    console.log("---------------------------------------------------");
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();