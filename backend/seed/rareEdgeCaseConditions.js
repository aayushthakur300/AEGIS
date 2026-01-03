const mongoose = require("mongoose");
const RuntimeSignature = require("../models/RuntimeSignature");
const connectDB = require("../config/db");
require("dotenv").config({ path: "../../.env" });

const rareEdgeCaseConditions = [
  { pattern: "undefined behavior.*-O3", language: "C", fix: "Review UB code.", severity: "High" },
  { pattern: "stack overflow.*recursive", language: "C", fix: "Limit recursion depth.", severity: "High" },
  { pattern: "signal handler.*non-reentrant", language: "C", fix: "Use async-safe functions.", severity: "Critical" },
  { pattern: "STL behavior.*libstdc\\+\\+", language: "C++", fix: "Ensure consistent libs.", severity: "Medium" },
  { pattern: "ABI mismatch", language: "C++", fix: "Recompile dependencies.", severity: "Critical" },
  { pattern: "JVM JIT mis-optimizing", language: "Java", fix: "Simplify hot path.", severity: "Low" },
  { pattern: "HashMap infinite loop", language: "Java", fix: "Use ConcurrentHashMap.", severity: "Critical" },
  { pattern: "ClassLoader leak", language: "Java", fix: "Clean static refs.", severity: "High" },
  { pattern: "DST transition breaking", language: "Java", fix: "Use UTC internally.", severity: "Medium" },
  { pattern: "GIL contention", language: "Python", fix: "Use multiprocessing.", severity: "Medium" },
  { pattern: "Unicode surrogate pairs", language: "Python", fix: "Handle encoding.", severity: "Medium" },
  { pattern: "recursion limit reached", language: "Python", fix: "Increase recursion limit.", severity: "High" },
  { pattern: "event-loop starvation", language: "JavaScript", fix: "Use setImmediate.", severity: "High" },
  { pattern: "DOM timing race", language: "JavaScript", fix: "Use MutationObserver.", severity: "Medium" },
  { pattern: "floating precision infinite loop", language: "JavaScript", fix: "Use epsilon check.", severity: "High" },
  { pattern: "transpilation target semantics", language: "TypeScript", fix: "Check target version.", severity: "Medium" },
  { pattern: "goroutine leak", language: "Go", fix: "Cancel context.", severity: "High" },
  { pattern: "scheduler starvation", language: "Go", fix: "Yield explicitly.", severity: "Medium" },
  { pattern: "select fairness", language: "Go", fix: "Don't rely on order.", severity: "Medium" },
  { pattern: "monomorphization explosion", language: "Rust", fix: "Use dynamic dispatch.", severity: "Low" },
  { pattern: "recursive trait bounds", language: "Rust", fix: "Simplify traits.", severity: "Medium" },
  { pattern: "ThreadPool exhaustion", language: "C#", fix: "Use async/await.", severity: "Critical" },
  { pattern: "async void exception", language: "C#", fix: "Return Task.", severity: "High" },
  { pattern: "GC pause real-time", language: "C#", fix: "Reduce allocations.", severity: "High" },
  { pattern: "max execution time", language: "PHP", fix: "Increase limit.", severity: "Medium" },
  { pattern: "opcode cache invalidation", language: "PHP", fix: "Clear OPcache.", severity: "Medium" },
  { pattern: "GIL blocking native", language: "Ruby", fix: "Use JRuby/IO.", severity: "Medium" },
  { pattern: "fiber scheduling", language: "Ruby", fix: "Use fiber-aware libs.", severity: "Medium" },
  { pattern: "ARC cycle", language: "Swift", fix: "Use weak/unowned.", severity: "High" },
  { pattern: "background thread UI", language: "Swift", fix: "Dispatch to main.", severity: "High" },
  { pattern: "coroutine cancellation", language: "Kotlin", fix: "Check isActive.", severity: "Medium" },
  { pattern: "stack overflow implicits", language: "Scala", fix: "Reduce complexity.", severity: "Medium" },
  { pattern: "type inference timeout", language: "Scala", fix: "Add annotations.", severity: "Low" },
  { pattern: "filename newline", language: "Bash", fix: "Use null delimiter.", severity: "Medium" },
  { pattern: "signal subshell", language: "Bash", fix: "Propagate signals.", severity: "Medium" },
  { pattern: "serialization truncation", language: "PowerShell", fix: "Increase MaxEnvelope.", severity: "Medium" },
  { pattern: "culture-specific parsing", language: "PowerShell", fix: "Use InvariantCulture.", severity: "Medium" },
  { pattern: "numerical instability", language: "R", fix: "Use stable algos.", severity: "High" },
  { pattern: "factor level mismatch", language: "R", fix: "Align factors.", severity: "High" },
  { pattern: "solver convergence", language: "MATLAB", fix: "Adjust tolerance.", severity: "Medium" },
  { pattern: "JIT latency", language: "Julia", fix: "Precompile.", severity: "Low" },
  { pattern: "regex catastrophic backtracking", language: "Perl", fix: "Optimize regex.", severity: "High" },
  { pattern: "recursive metatables", language: "Lua", fix: "Guard recursion.", severity: "High" },
  { pattern: "gas limit reached", language: "Solidity", fix: "Optimize loops.", severity: "High" },
  { pattern: "block timestamp manipulation", language: "Solidity", fix: "Don't rely on time.", severity: "High" },
  { pattern: "isolate deadlock", language: "Dart", fix: "Check ports.", severity: "High" },
  { pattern: "web vs vm divergence", language: "Dart", fix: "Test platforms.", severity: "Medium" },
  { pattern: "space leak laziness", language: "Haskell", fix: "Use strictness.", severity: "High" },
  { pattern: "thunk buildup", language: "Haskell", fix: "Force evaluation.", severity: "High" },
  { pattern: "mailbox growth", language: "Elixir", fix: "Handle messages.", severity: "High" },
  { pattern: "scheduler imbalance", language: "Elixir", fix: "Break CPU tasks.", severity: "Medium" },
  { pattern: "runloop mode mismatch", language: "Objective-C", fix: "Use CommonModes.", severity: "Medium" },
  { pattern: "autorelease pool overflow", language: "Objective-C", fix: "Use @autoreleasepool.", severity: "High" },
  { pattern: "numerical instability denormals", language: "Fortran", fix: "Flush to zero.", severity: "Medium" },
  { pattern: "file lock contention", language: "COBOL", fix: "Retry logic.", severity: "High" },
  { pattern: "stack size debug release", language: "Zig", fix: "Adjust limits.", severity: "Low" },
  { pattern: "gc pause large graph", language: "Nim", fix: "Tune GC.", severity: "Medium" },
  { pattern: "tail recursion optimization", language: "OCaml", fix: "Make tail-recursive.", severity: "Medium" },
  { pattern: "metastability", language: "VHDL", fix: "Use synchronizers.", severity: "Critical" },
  { pattern: "query plan change", language: "SQL", fix: "Update stats.", severity: "Medium" },
  { pattern: "eventual consistency race", language: "NoSQL", fix: "Consistent reads.", severity: "High" },
  { pattern: "optimization regression", language: "JVM", fix: "Update JVM.", severity: "Low" },
  { pattern: "host-call boundary latency", language: "WASM", fix: "Batch calls.", severity: "Medium" },
  { pattern: "low-memory os kill", language: "Mobile", fix: "Save state.", severity: "High" },
  { pattern: "interrupt storm", language: "Embedded", fix: "Mask interrupts.", severity: "Critical" },
  { pattern: "warp divergence", language: "CUDA", fix: "Align branches.", severity: "High" },
  { pattern: "false sharing", language: "OpenMP", fix: "Pad structs.", severity: "High" },
  { pattern: "MPI deadlock", language: "MPI", fix: "Match tags.", severity: "Critical" },
  { pattern: "timing closure failure", language: "FPGA", fix: "Optimize timing.", severity: "High" },
  { pattern: "handle leak", language: "Windows", fix: "Close handles.", severity: "High" },
  { pattern: "epoll edge-trigger", language: "Linux", fix: "Drain FD.", severity: "High" },
  { pattern: "case-insensitive fs", language: "MacOS", fix: "Check casing.", severity: "Medium" },
  { pattern: "pid namespace exhaustion", language: "Docker", fix: "Increase limit.", severity: "High" },
  { pattern: "pod eviction", language: "Kubernetes", fix: "Set limits.", severity: "High" },
  { pattern: "cold-start timeout", language: "Serverless", fix: "Optimize init.", severity: "Medium" },
  { pattern: "safari-only js bug", language: "Browser", fix: "Polyfill.", severity: "Medium" },
  { pattern: "certificate expiry leap second", language: "TLS", fix: "Sync NTP.", severity: "Critical" },
  { pattern: "leap-second miscalculation", language: "Timezones", fix: "Use TAI.", severity: "Low" },
  { pattern: "decimal separator", language: "Locale", fix: "Standardize.", severity: "Medium" },
  { pattern: "utf-16 vs utf-8 boundary", language: "Encoding", fix: "Check bytes.", severity: "High" },
  { pattern: "inode exhaustion", language: "Filesystem", fix: "Delete files.", severity: "Critical" },
  { pattern: "mtu blackhole", language: "Network", fix: "Adjust MTU.", severity: "High" },
  { pattern: "chunked transfer edge", language: "HTTP", fix: "Fix encoding.", severity: "High" },
  { pattern: "lru eviction", language: "Cache", fix: "Resize cache.", severity: "Medium" },
  { pattern: "stale cache poisoning", language: "CDN", fix: "Invalidate.", severity: "High" },
  { pattern: "non-deterministic inference", language: "AI", fix: "Seed RNG.", severity: "Medium" },
  { pattern: "denormal flush-to-zero", language: "Floating", fix: "Check precision.", severity: "Low" },
  { pattern: "alignment fault", language: "SIMD", fix: "Align data.", severity: "Critical" },
  { pattern: "weak memory ordering", language: "ARM", fix: "Use barriers.", severity: "Critical" },
  { pattern: "speculative execution", language: "x86", fix: "Mitigate.", severity: "Critical" },
  { pattern: "driver-specific shader", language: "GPU", fix: "Test vendors.", severity: "High" },
  { pattern: "clock drift", language: "IoT", fix: "Sync NTP.", severity: "Medium" },
  { pattern: "floating noise threshold", language: "Sensors", fix: "Use hysteresis.", severity: "Medium" },
  { pattern: "rng entropy starvation", language: "Cryptography", fix: "Use HW RNG.", severity: "Critical" },
  { pattern: "rare data expansion", language: "Compression", fix: "Check size.", severity: "Low" },
  { pattern: "log rotation race", language: "Logging", fix: "Use copytruncate.", severity: "Medium" },
  { pattern: "sampling bias", language: "Monitoring", fix: "Fix sampling.", severity: "Low" },
  { pattern: "incremental build inconsistency", language: "Build", fix: "Clean build.", severity: "Medium" },
  { pattern: "dependency resolution edge", language: "Package", fix: "Use lockfile.", severity: "High" },
  { pattern: "feature disabled silently", language: "Licensing", fix: "Log checks.", severity: "Medium" },
  { pattern: "partial rollout", language: "FeatureFlags", fix: "Hash user ID.", severity: "Medium" },
  { pattern: "split-brain", language: "BlueGreen", fix: "Sync state.", severity: "Critical" },
  { pattern: "recovery ordering", language: "Chaos", fix: "Set order.", severity: "High" },
  { pattern: "sticky session", language: "LoadBalancer", fix: "Configure stickiness.", severity: "Medium" },
  { pattern: "distributed clock skew", language: "Distributed", fix: "Use logical clocks.", severity: "High" }
];

const seedRare = async () => {
  try {
    await connectDB();
    console.log(`[Seeder] Adding ${rareEdgeCaseConditions.length} rare signatures...`);
    await RuntimeSignature.insertMany(rareEdgeCaseConditions);
    console.log("[Seeder] Rare signatures added successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Uncomment to run standalone
// seedRare();

module.exports = rareEdgeCaseConditions;