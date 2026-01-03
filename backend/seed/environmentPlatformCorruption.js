const mongoose = require("mongoose");
const RuntimeSignature = require("../models/RuntimeSignature");
const connectDB = require("../config/db");
require("dotenv").config({ path: "../../.env" });

const environmentPlatformCorruption = [
  { pattern: "locale string compare", language: "OS", fix: "Ordinal compare.", severity: "Medium" },
  { pattern: "timezone misconfigured", language: "Ops", fix: "Set UTC.", severity: "Medium" },
  { pattern: "dst rule change", language: "Ops", fix: "Update tzdata.", severity: "Low" },
  { pattern: "libc behavior", language: "OS", fix: "Use container.", severity: "High" },
  { pattern: "kernel syscall", language: "OS", fix: "Compat check.", severity: "High" },
  { pattern: "word size mismatch", language: "Arch", fix: "Fixed types.", severity: "High" },
  { pattern: "memory ordering", language: "Arch", fix: "Atomics.", severity: "Critical" },
  { pattern: "endianness", language: "Arch", fix: "BOM.", severity: "High" },
  { pattern: "fpu mode", language: "HW", fix: "Control word.", severity: "Medium" },
  { pattern: "gpu driver regression", language: "Driver", fix: "Pin driver.", severity: "High" },
  { pattern: "browser divergence", language: "Web", fix: "Polyfill.", severity: "Medium" },
  { pattern: "node semantic change", language: "Node", fix: "Pin version.", severity: "High" },
  { pattern: "jvm vendor", language: "Java", fix: "Standardize.", severity: "Medium" },
  { pattern: "gc strategy", language: "Ops", fix: "Tune.", severity: "Medium" },
  { pattern: "tls update", language: "Sec", fix: "Check cipher.", severity: "High" },
  { pattern: "openssl config", language: "Sec", fix: "Check path.", severity: "High" },
  { pattern: "cert store", language: "Sec", fix: "Update root.", severity: "Critical" },
  { pattern: "proxy rewriting", language: "Net", fix: "Check header.", severity: "Medium" },
  { pattern: "lb timeout", language: "Ops", fix: "Increase.", severity: "Medium" },
  { pattern: "reverse proxy buf", language: "Ops", fix: "Adjust.", severity: "Low" },
  { pattern: "docker base update", language: "Docker", fix: "Pin tag.", severity: "High" },
  { pattern: "alpine glibc", language: "Docker", fix: "Compat test.", severity: "High" },
  { pattern: "container memory", language: "K8s", fix: "Set limit.", severity: "High" },
  { pattern: "cpu throttling", language: "K8s", fix: "Check quota.", severity: "Medium" },
  { pattern: "k8s eviction", language: "K8s", fix: "Priority.", severity: "High" },
  { pattern: "pod restart order", language: "K8s", fix: "Init container.", severity: "Medium" },
  { pattern: "configmap reload", language: "K8s", fix: "Watcher.", severity: "Medium" },
  { pattern: "secret rotation", language: "Sec", fix: "Automate.", severity: "High" },
  { pattern: "cloud latency", language: "Cloud", fix: "Retry.", severity: "Medium" },
  { pattern: "multi-region", language: "Cloud", fix: "Replicate.", severity: "High" },
  { pattern: "object eventual", language: "Cloud", fix: "Retry.", severity: "Medium" },
  { pattern: "ntp drift", language: "Ops", fix: "Run NTP.", severity: "High" },
  { pattern: "leap second", language: "Ops", fix: "Smear.", severity: "Low" },
  { pattern: "fs case sensitivity", language: "OS", fix: "Normalize.", severity: "Medium" },
  { pattern: "path separator", language: "OS", fix: "path.join.", severity: "Low" },
  { pattern: "crlf vs lf", language: "Code", fix: "Git config.", severity: "Low" },
  { pattern: "shell behavior", language: "Script", fix: "Bash strict.", severity: "Medium" },
  { pattern: "umask change", language: "OS", fix: "Set umask.", severity: "High" },
  { pattern: "file permission", language: "OS", fix: "chmod.", severity: "High" },
  { pattern: "selinux", language: "OS", fix: "Check audit.", severity: "High" },
  { pattern: "antivirus lock", language: "OS", fix: "Exclude.", severity: "Medium" },
  { pattern: "corp proxy", language: "Net", fix: "Add cert.", severity: "Medium" },
  { pattern: "dns hijack", language: "Net", fix: "DoH.", severity: "High" },
  { pattern: "ipv6 pref", language: "Net", fix: "Disable.", severity: "Medium" },
  { pattern: "mtu blackhole", language: "Net", fix: "MSS clamping.", severity: "High" },
  { pattern: "firewall timeout", language: "Net", fix: "Keepalive.", severity: "Medium" },
  { pattern: "nat exhaustion", language: "Net", fix: "Reuse.", severity: "High" },
  { pattern: "metadata change", language: "Cloud", fix: "Pin API.", severity: "Medium" },
  { pattern: "iam drift", language: "Cloud", fix: "IaC.", severity: "High" },
  { pattern: "iam propagation", language: "Cloud", fix: "Wait.", severity: "Medium" },
  { pattern: "flag skew", language: "Config", fix: "Sync.", severity: "Medium" },
  { pattern: "canary exposure", language: "Deploy", fix: "Monitor.", severity: "Medium" },
  { pattern: "blue-green mismatch", language: "Deploy", fix: "Compat.", severity: "Critical" },
  { pattern: "rolling restart", language: "Deploy", fix: "Graceful.", severity: "High" },
  { pattern: "hot reload loss", language: "Dev", fix: "Restart.", severity: "Low" },
  { pattern: "cold start", language: "Serverless", fix: "Warmup.", severity: "Medium" },
  { pattern: "memory tier", language: "Serverless", fix: "Profile.", severity: "Medium" },
  { pattern: "edge limit", language: "Edge", fix: "Polyfill.", severity: "High" },
  { pattern: "cdn compression", language: "Web", fix: "Config.", severity: "Low" },
  { pattern: "browser cache part", language: "Web", fix: "Check header.", severity: "Medium" },
  { pattern: "mobile kill", language: "Mobile", fix: "Save state.", severity: "High" },
  { pattern: "cpu sleep", language: "Power", fix: "Wakelock.", severity: "Medium" },
  { pattern: "thermal throttling", language: "HW", fix: "Cooling.", severity: "Low" },
  { pattern: "clock freq", language: "HW", fix: "Perf gov.", severity: "Low" },
  { pattern: "battery saver", language: "Mobile", fix: "Check API.", severity: "Medium" },
  { pattern: "accessibility", language: "UI", fix: "Scale.", severity: "Low" },
  { pattern: "font rendering", language: "UI", fix: "Webfont.", severity: "Low" },
  { pattern: "color profile", language: "UI", fix: "sRGB.", severity: "Low" },
  { pattern: "sample rate", language: "Audio", fix: "Resample.", severity: "Medium" },
  { pattern: "printer driver", language: "HW", fix: "Generic.", severity: "Low" },
  { pattern: "collation", language: "DB", fix: "Set collation.", severity: "Medium" },
  { pattern: "regex version", language: "Code", fix: "Test regex.", severity: "Medium" },
  { pattern: "icu update", language: "Lib", fix: "Check changelog.", severity: "Low" },
  { pattern: "math lib", language: "Lib", fix: "Unit test.", severity: "Medium" },
  { pattern: "rng seed", language: "Rand", fix: "Fixed seed.", severity: "Low" },
  { pattern: "entropy depletion", language: "Rand", fix: "Haveged.", severity: "Critical" },
  { pattern: "hw rng fail", language: "HW", fix: "Fallback.", severity: "High" },
  { pattern: "tpm firmware", language: "Sec", fix: "Update.", severity: "High" },
  { pattern: "bios patch", language: "HW", fix: "Update.", severity: "Medium" },
  { pattern: "hypervisor diff", language: "Virt", fix: "Standardize.", severity: "High" },
  { pattern: "nested virt", language: "Virt", fix: "Enable.", severity: "Medium" },
  { pattern: "snapshot anomaly", language: "Virt", fix: "Sync time.", severity: "High" },
  { pattern: "vm clock freeze", language: "Virt", fix: "NTP.", severity: "High" },
  { pattern: "write cache off", language: "Disk", fix: "Battery.", severity: "Medium" },
  { pattern: "ssd firmware", language: "Disk", fix: "Update.", severity: "Medium" },
  { pattern: "raid policy", language: "Disk", fix: "Write-back.", severity: "Medium" },
  { pattern: "power loss", language: "Disk", fix: "UPS.", severity: "Critical" },
  { pattern: "journaling mode", language: "FS", fix: "Ordered.", severity: "High" },
  { pattern: "mount option", language: "FS", fix: "Check options.", severity: "High" },
  { pattern: "driver offload", language: "Net", fix: "Disable TSO.", severity: "Medium" },
  { pattern: "tcp algo", language: "Net", fix: "Cubic/BBR.", severity: "Low" },
  { pattern: "http2 vs 1", language: "Web", fix: "Test.", severity: "Medium" },
  { pattern: "quic fallback", language: "Web", fix: "UDP.", severity: "Medium" },
  { pattern: "privacy block", language: "Web", fix: "Graceful.", severity: "Medium" },
  { pattern: "samesite", language: "Web", fix: "Lax.", severity: "High" },
  { pattern: "cors policy", language: "Web", fix: "Origin.", severity: "High" },
  { pattern: "csp enforcement", language: "Web", fix: "Nonce.", severity: "High" },
  { pattern: "api schema", language: "API", fix: "Validate.", severity: "High" },
  { pattern: "rate limit drift", language: "Ops", fix: "Redis.", severity: "Medium" },
  { pattern: "monitor overhead", language: "Ops", fix: "Sample.", severity: "Low" },
  { pattern: "trace sampler", language: "Ops", fix: "Rate.", severity: "Low" },
  { pattern: "log version", language: "Log", fix: "Parser.", severity: "Medium" },
  { pattern: "debug flag", language: "Build", fix: "Strip.", severity: "Medium" },
  { pattern: "build mismatch", language: "Build", fix: "Reproducible.", severity: "High" },
  { pattern: "env drift", language: "Ops", fix: "IaC.", severity: "High" }
];

const seedEnv = async () => {
  try {
    await connectDB();
    console.log(`[Seeder] Adding ${environmentPlatformCorruption.length} env signatures...`);
    await RuntimeSignature.insertMany(environmentPlatformCorruption);
    console.log("[Seeder] Env signatures added successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Uncomment to run standalone
// seedEnv();

module.exports = environmentPlatformCorruption;