const mongoose = require("mongoose");
const RuntimeSignature = require("../models/RuntimeSignature");
const connectDB = require("../config/db");
require("dotenv").config({ path: "../../.env" });

const memoryCorruptionUB = [
  { pattern: "use-after-free", language: "C", fix: "Set pointer to NULL.", severity: "Critical" },
  { pattern: "double free", language: "C", fix: "Check ownership.", severity: "Critical" },
  { pattern: "stack buffer overflow", language: "C", fix: "Use strncpy.", severity: "Critical" },
  { pattern: "heap overflow", language: "C", fix: "Validate size.", severity: "Critical" },
  { pattern: "dangling reference temporary", language: "C++", fix: "Extend scope.", severity: "High" },
  { pattern: "incorrect move semantics", language: "C++", fix: "Valid state.", severity: "High" },
  { pattern: "custom allocator mismatch", language: "C++", fix: "Match alloc.", severity: "High" },
  { pattern: "delete vs delete\\[\\]", language: "C++", fix: "Use delete[].", severity: "Critical" },
  { pattern: "JNI native buffer overrun", language: "Java", fix: "Check bounds.", severity: "Critical" },
  { pattern: "DirectByteBuffer leak", language: "Java", fix: "Clean buffer.", severity: "High" },
  { pattern: "reference count imbalance", language: "Python", fix: "Fix refcount.", severity: "Critical" },
  { pattern: "buffer protocol misuse", language: "Python", fix: "Release buffer.", severity: "High" },
  { pattern: "WASM memory out-of-bounds", language: "JavaScript", fix: "Check bounds.", severity: "Critical" },
  { pattern: "unsafe pointer arithmetic", language: "Go", fix: "Use safe ptr.", severity: "High" },
  { pattern: "CGo lifetime", language: "Go", fix: "Pin pointer.", severity: "Critical" },
  { pattern: "unsafe block aliasing", language: "Rust", fix: "Check alias.", severity: "Critical" },
  { pattern: "mem::forget leak", language: "Rust", fix: "Manage resource.", severity: "Medium" },
  { pattern: "P/Invoke layout", language: "C#", fix: "Match layout.", severity: "High" },
  { pattern: "fixed buffer overflow", language: "C#", fix: "Check bounds.", severity: "Critical" },
  { pattern: "extension memory misalignment", language: "PHP", fix: "Align memory.", severity: "High" },
  { pattern: "native gem segfault", language: "Ruby", fix: "Debug C ext.", severity: "Critical" },
  { pattern: "unsafe pointer escaping", language: "Swift", fix: "Scope ptr.", severity: "Critical" },
  { pattern: "native interop pointer", language: "Kotlin", fix: "Manage lifecycle.", severity: "High" },
  { pattern: "GC root mis-tracking", language: "Scala", fix: "Register root.", severity: "Critical" },
  { pattern: "stack smash recursive", language: "Bash", fix: "Stop recursion.", severity: "High" },
  { pattern: "COM object leak", language: "PowerShell", fix: "Release COM.", severity: "Medium" },
  { pattern: "C-level vector overflow", language: "R", fix: "Check index.", severity: "Critical" },
  { pattern: "MEX file heap corruption", language: "MATLAB", fix: "Use mxMalloc.", severity: "Critical" },
  { pattern: "unsafe_wrap misuse", language: "Julia", fix: "Manage memory.", severity: "High" },
  { pattern: "XS module overwrite", language: "Perl", fix: "Check XS.", severity: "Critical" },
  { pattern: "C API stack", language: "Lua", fix: "Balance stack.", severity: "High" },
  { pattern: "storage slot collision", language: "Solidity", fix: "Fix layout.", severity: "Critical" },
  { pattern: "FFI pointer misuse", language: "Dart", fix: "Type pointer.", severity: "High" },
  { pattern: "foreign pointer double free", language: "Haskell", fix: "Use finalizer.", severity: "Critical" },
  { pattern: "NIF dirty scheduler", language: "Elixir", fix: "Schedule dirty.", severity: "High" },
  { pattern: "dangling assign property", language: "Objective-C", fix: "Use weak.", severity: "High" },
  { pattern: "array bounds unchecked write", language: "Fortran", fix: "Check bounds.", severity: "Critical" },
  { pattern: "pointer arithmetic corruption", language: "COBOL", fix: "Check pointer.", severity: "High" },
  { pattern: "manual allocator misuse", language: "Zig", fix: "Free once.", severity: "Critical" },
  { pattern: "unsafe cast aliasing", language: "Nim", fix: "Avoid cast.", severity: "High" },
  { pattern: "C stub lifetime", language: "OCaml", fix: "Match lifetime.", severity: "High" },
  { pattern: "simulation memory corruption", language: "VHDL", fix: "Check testbench.", severity: "Medium" },
  { pattern: "out-of-bounds shared memory", language: "GPU", fix: "Check index.", severity: "Critical" },
  { pattern: "kernel local overwrite", language: "OpenCL", fix: "Check bounds.", severity: "Critical" },
  { pattern: "linear memory aliasing", language: "WASM", fix: "Verify offset.", severity: "High" },
  { pattern: "buffer detachment", language: "Browser", fix: "Check state.", severity: "High" },
  { pattern: "driver DMA overwrite", language: "Kernel", fix: "Verify DMA.", severity: "Critical" },
  { pattern: "stack overflow ISR", language: "Embedded", fix: "Reduce stack.", severity: "Critical" },
  { pattern: "memory pool fragmentation", language: "RTOS", fix: "Fixed blocks.", severity: "Medium" },
  { pattern: "heap corruption", language: "FPGA", fix: "Check controller.", severity: "Critical" },
  { pattern: "global ref leak", language: "JNI", fix: "DeleteGlobalRef.", severity: "High" },
  { pattern: "unsafe off-heap write", language: "JVM", fix: "Check Unsafe.", severity: "Critical" },
  { pattern: "native addon segfault", language: "Node.js", fix: "Debug addon.", severity: "Critical" },
  { pattern: "memoryview slice misuse", language: "Python", fix: "Keep alive.", severity: "High" },
  { pattern: "slice reallocation", language: "Go", fix: "Update ptr.", severity: "High" },
  { pattern: "incorrect repr(C)", language: "Rust", fix: "Match fields.", severity: "High" },
  { pattern: "ARC over-release", language: "Swift", fix: "Balance retain.", severity: "Critical" },
  { pattern: "freeze misuse", language: "Kotlin", fix: "Don't mutate.", severity: "High" },
  { pattern: "zval refcount", language: "PHP", fix: "Debug ref.", severity: "Critical" },
  { pattern: "ObjectSpace misuse", language: "Ruby", fix: "Safe manip.", severity: "High" },
  { pattern: "trace compiler bug", language: "LuaJIT", fix: "Update lib.", severity: "Low" },
  { pattern: "native buffer overflow", language: "SQL", fix: "Check UDF.", severity: "Critical" },
  { pattern: "ECS memory stomp", language: "Game", fix: "Check access.", severity: "High" },
  { pattern: "collision buffer", language: "Physics", fix: "Resize buffer.", severity: "High" },
  { pattern: "circular buffer wrap", language: "Audio", fix: "Fix logic.", severity: "High" },
  { pattern: "stride miscalculation", language: "Image", fix: "Fix stride.", severity: "High" },
  { pattern: "frame buffer overflow", language: "Video", fix: "Check res.", severity: "High" },
  { pattern: "dictionary overflow", language: "Compression", fix: "Limit size.", severity: "High" },
  { pattern: "side-channel buffer", language: "Crypto", fix: "Constant time.", severity: "High" },
  { pattern: "tensor shape mismatch", language: "AI", fix: "Check dims.", severity: "High" },
  { pattern: "misaligned load", language: "SIMD", fix: "Align data.", severity: "Critical" },
  { pattern: "lane overflow", language: "ARM", fix: "Check SIMD.", severity: "High" },
  { pattern: "masked write bug", language: "x86", fix: "Check mask.", severity: "High" },
  { pattern: "allocator race", language: "Multithreaded", fix: "Use lock.", severity: "Critical" },
  { pattern: "ABA problem", language: "Lock-free", fix: "Versioning.", severity: "High" },
  { pattern: "double release", language: "Pool", fix: "Track state.", severity: "Critical" },
  { pattern: "root miscount", language: "GC", fix: "Register root.", severity: "Critical" },
  { pattern: "reference cycle", language: "Leak", fix: "Break cycle.", severity: "Medium" },
  { pattern: "finalizer resurrect", language: "GC", fix: "Don't res.", severity: "Medium" },
  { pattern: "unwinding corruption", language: "Stack", fix: "Check ABI.", severity: "Critical" },
  { pattern: "clobbering stack", language: "Signal", fix: "Altstack.", severity: "Critical" },
  { pattern: "tls corruption", language: "Thread", fix: "Check TLS.", severity: "High" },
  { pattern: "invalid code", language: "JIT", fix: "Debug JIT.", severity: "Critical" },
  { pattern: "self-modifying code", language: "ASM", fix: "Flush cache.", severity: "Critical" },
  { pattern: "hot reload patch", language: "Runtime", fix: "Verify layout.", severity: "High" },
  { pattern: "ABI mismatch plugin", language: "Plugin", fix: "Check version.", severity: "Critical" },
  { pattern: "boundary overwrite", language: "Driver", fix: "Validate.", severity: "Critical" },
  { pattern: "page aliasing", language: "MMU", fix: "Flush TLB.", severity: "High" },
  { pattern: "cache coherency", language: "DMA", fix: "Flush cache.", severity: "Critical" },
  { pattern: "locality corruption", language: "NUMA", fix: "Check node.", severity: "Medium" },
  { pattern: "segment overwrite", language: "SharedMem", fix: "Sync access.", severity: "High" },
  { pattern: "ring buffer overflow", language: "IPC", fix: "Check tail.", severity: "High" },
  { pattern: "mmap race", language: "File", fix: "Lock file.", severity: "High" },
  { pattern: "atomic alignment", language: "Atomic", fix: "Align var.", severity: "Critical" },
  { pattern: "pointer tagging", language: "Pointer", fix: "Mask tag.", severity: "High" },
  { pattern: "bounds-check elision", language: "Compiler", fix: "Validate.", severity: "High" },
  { pattern: "speculative clobber", language: "CPU", fix: "Mitigate.", severity: "Critical" },
  { pattern: "sanitizer false neg", language: "Test", fix: "Manual check.", severity: "Medium" },
  { pattern: "heap spray", language: "Security", fix: "Randomize.", severity: "Critical" },
  { pattern: "use-after-scope", language: "C++", fix: "Check scope.", severity: "High" },
  { pattern: "shadow stack", language: "Security", fix: "Protect.", severity: "High" },
  { pattern: "stack canary", language: "Security", fix: "Check canary.", severity: "Critical" },
  { pattern: "guard page", language: "OS", fix: "Configure.", severity: "High" },
  { pattern: "watchdog stomp", language: "Embedded", fix: "Pet watchdog.", severity: "High" },
  { pattern: "bootloader overwrite", language: "Boot", fix: "Check addr.", severity: "Critical" }
];

const seedMemory = async () => {
  try {
    await connectDB();
    console.log(`[Seeder] Adding ${memoryCorruptionUB.length} memory signatures...`);
    await RuntimeSignature.insertMany(memoryCorruptionUB);
    console.log("[Seeder] Memory signatures added successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Uncomment to run standalone
// seedMemory();

module.exports = memoryCorruptionUB;