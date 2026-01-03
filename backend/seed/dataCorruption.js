const mongoose = require("mongoose");
const RuntimeSignature = require("../models/RuntimeSignature");
const connectDB = require("../config/db");
require("dotenv").config({ path: "../../.env" });

const dataCorruption = [
  { pattern: "serialization truncation", language: "General", fix: "Check buffer size.", severity: "High" },
  { pattern: "wrong endianness", language: "General", fix: "Swap bytes.", severity: "High" },
  { pattern: "partial transaction", language: "Database", fix: "Use rollback.", severity: "Critical" },
  { pattern: "floating-point drift", language: "General", fix: "Use Decimal.", severity: "Medium" },
  { pattern: "csv column shift", language: "Data", fix: "Escape quotes.", severity: "High" },
  { pattern: "json number precision", language: "JSON", fix: "Use strings.", severity: "Medium" },
  { pattern: "xml namespace collision", language: "XML", fix: "Use prefix.", severity: "Medium" },
  { pattern: "schema migration mismatch", language: "Database", fix: "Sync schema.", severity: "High" },
  { pattern: "orm lazy write", language: "ORM", fix: "Flush write.", severity: "Medium" },
  { pattern: "cache write-back fail", language: "Cache", fix: "Log error.", severity: "High" },
  { pattern: "replication lag", language: "Database", fix: "Check lag.", severity: "Medium" },
  { pattern: "event replay duplication", language: "Event", fix: "Idempotency.", severity: "High" },
  { pattern: "idempotency key collision", language: "API", fix: "Unique key.", severity: "High" },
  { pattern: "timezone conversion drift", language: "Time", fix: "Use UTC.", severity: "Medium" },
  { pattern: "encoding mismatch", language: "Text", fix: "Use UTF-8.", severity: "High" },
  { pattern: "compression corruption", language: "Data", fix: "Checksum.", severity: "Critical" },
  { pattern: "log compaction", language: "Log", fix: "Keep latest.", severity: "Medium" },
  { pattern: "checksum not validated", language: "Security", fix: "Verify hash.", severity: "High" },
  { pattern: "hash collision overwrite", language: "Hash", fix: "Handle collision.", severity: "High" },
  { pattern: "bloom filter false positive", language: "Data", fix: "No delete.", severity: "High" },
  { pattern: "deduplication loss", language: "Storage", fix: "Verify content.", severity: "High" },
  { pattern: "snapshot restore", language: "Backup", fix: "Test restore.", severity: "Critical" },
  { pattern: "backup partial", language: "Backup", fix: "Verify job.", severity: "Critical" },
  { pattern: "index rebuild", language: "Database", fix: "Monitor.", severity: "High" },
  { pattern: "floating nan prop", language: "Math", fix: "Check NaN.", severity: "Medium" },
  { pattern: "null sentinel", language: "Data", fix: "Use types.", severity: "Medium" },
  { pattern: "sentinel overlap", language: "Data", fix: "Separate band.", severity: "High" },
  { pattern: "default value overwrite", language: "Config", fix: "Merge properly.", severity: "Medium" },
  { pattern: "field reordering", language: "Serialization", fix: "Use tags.", severity: "High" },
  { pattern: "version skew", language: "Deploy", fix: "Back-compat.", severity: "High" },
  { pattern: "schema-less drift", language: "NoSQL", fix: "Validate.", severity: "Medium" },
  { pattern: "column type widening", language: "Database", fix: "Check prec.", severity: "Medium" },
  { pattern: "decimal to float", language: "Math", fix: "Use Decimal.", severity: "High" },
  { pattern: "pagination drift", language: "API", fix: "Use cursor.", severity: "Medium" },
  { pattern: "cursor invalidation", language: "UI", fix: "Refresh.", severity: "Low" },
  { pattern: "cdc stream reorder", language: "Data", fix: "Sequence.", severity: "High" },
  { pattern: "eventual consistency", language: "NoSQL", fix: "Design.", severity: "Medium" },
  { pattern: "vector clock merge", language: "Distributed", fix: "Resolve.", severity: "High" },
  { pattern: "conflict resolution", language: "Sync", fix: "Define rule.", severity: "High" },
  { pattern: "whitespace loss", language: "Merge", fix: "Preserve.", severity: "Low" },
  { pattern: "text normalization", language: "Text", fix: "Normalize.", severity: "Medium" },
  { pattern: "case-folding", language: "Text", fix: "Locale.", severity: "Medium" },
  { pattern: "locale sort", language: "UI", fix: "Set locale.", severity: "Low" },
  { pattern: "unicode grapheme", language: "Text", fix: "Cluster.", severity: "Medium" },
  { pattern: "surrogate pair loss", language: "Text", fix: "UTF-16.", severity: "High" },
  { pattern: "time-series rollover", language: "Data", fix: "Handle max.", severity: "High" },
  { pattern: "window aggregation", language: "Analytics", fix: "Boundary.", severity: "Medium" },
  { pattern: "rolling average", language: "Math", fix: "Reset.", severity: "Low" },
  { pattern: "sampling bias skew", language: "Analytics", fix: "Randomize.", severity: "Low" },
  { pattern: "feature flag partial", language: "Config", fix: "Propagate.", severity: "Medium" },
  { pattern: "ab test leak", language: "Analytics", fix: "Isolate.", severity: "Medium" },
  { pattern: "ml label drift", language: "AI", fix: "Retrain.", severity: "Medium" },
  { pattern: "training data contamination", language: "AI", fix: "Separate.", severity: "High" },
  { pattern: "model serialization", language: "AI", fix: "Version.", severity: "High" },
  { pattern: "tensor quantization", language: "AI", fix: "Validate.", severity: "Medium" },
  { pattern: "audio aliasing", language: "Audio", fix: "Filter.", severity: "Low" },
  { pattern: "color space", language: "Image", fix: "Convert.", severity: "Medium" },
  { pattern: "gamma correction", language: "Image", fix: "Apply.", severity: "Low" },
  { pattern: "frame reorder", language: "Video", fix: "Use PTS.", severity: "High" },
  { pattern: "calibration drift", language: "Sensor", fix: "Calibrate.", severity: "Medium" },
  { pattern: "unit conversion", language: "Math", fix: "Check unit.", severity: "Critical" },
  { pattern: "currency precision", language: "Finance", fix: "Use int.", severity: "Critical" },
  { pattern: "tax rounding", language: "Finance", fix: "Round.", severity: "High" },
  { pattern: "ledger imbalance", language: "Finance", fix: "Audit.", severity: "Critical" },
  { pattern: "audit log reorder", language: "Security", fix: "Time sync.", severity: "High" },
  { pattern: "immutable log mutation", language: "Security", fix: "WORM.", severity: "Critical" },
  { pattern: "append-only truncation", language: "File", fix: "Atomic.", severity: "High" },
  { pattern: "journal replay", language: "FS", fix: "Fsck.", severity: "Critical" },
  { pattern: "raid parity", language: "Storage", fix: "Scrub.", severity: "Critical" },
  { pattern: "object overwrite", language: "Storage", fix: "Versioning.", severity: "High" },
  { pattern: "cdn stale", language: "Web", fix: "Purge.", severity: "Medium" },
  { pattern: "cache key collision", language: "Cache", fix: "Namespace.", severity: "High" },
  { pattern: "url canonicalization", language: "Web", fix: "Normalize.", severity: "Medium" },
  { pattern: "query param reorder", language: "Web", fix: "Sort.", severity: "Low" },
  { pattern: "header normalization", language: "Web", fix: "Lowercase.", severity: "Medium" },
  { pattern: "cookie path", language: "Web", fix: "Set path.", severity: "Medium" },
  { pattern: "session fixation", language: "Security", fix: "New ID.", severity: "High" },
  { pattern: "iv reuse", language: "Crypto", fix: "Unique IV.", severity: "Critical" },
  { pattern: "key rotation", language: "Crypto", fix: "Rotate.", severity: "High" },
  { pattern: "decryption padding", language: "Crypto", fix: "Check pad.", severity: "High" },
  { pattern: "hmac skipped", language: "Crypto", fix: "Verify.", severity: "Critical" },
  { pattern: "protocol version", language: "Net", fix: "Negotiate.", severity: "High" },
  { pattern: "message framing", language: "Net", fix: "Prefix len.", severity: "High" },
  { pattern: "stream reassembly", language: "Net", fix: "Order.", severity: "High" },
  { pattern: "packet duplication", language: "Net", fix: "Dedup.", severity: "Medium" },
  { pattern: "timestamp reorder", language: "Time", fix: "Monotonic.", severity: "High" },
  { pattern: "monotonic reset", language: "Time", fix: "Handle boot.", severity: "Medium" },
  { pattern: "uuid collision", language: "Data", fix: "CSPRNG.", severity: "Critical" },
  { pattern: "snowflake wrap", language: "Data", fix: "Monitor.", severity: "High" },
  { pattern: "sequence reset", language: "DB", fix: "Sync seq.", severity: "High" },
  { pattern: "counter overflow", language: "Code", fix: "Use 64bit.", severity: "High" },
  { pattern: "sparse index", language: "DB", fix: "Rebuild.", severity: "Medium" },
  { pattern: "bitmap compression", language: "Data", fix: "Lossless.", severity: "Medium" },
  { pattern: "trie overwrite", language: "Struct", fix: "Check logic.", severity: "High" },
  { pattern: "index stale", language: "Search", fix: "Commit.", severity: "Medium" },
  { pattern: "recommendation poison", language: "AI", fix: "Filter.", severity: "Medium" },
  { pattern: "ranking drift", language: "AI", fix: "Monitor.", severity: "Low" },
  { pattern: "analytics double", language: "Data", fix: "Dedup.", severity: "Low" },
  { pattern: "etl drop", language: "Data", fix: "DLQ.", severity: "High" },
  { pattern: "batch window", language: "Data", fix: "Late arrival.", severity: "Medium" },
  { pattern: "datalake schema", language: "Data", fix: "Registry.", severity: "High" },
  { pattern: "parquet metadata", language: "Data", fix: "Footer.", severity: "High" },
  { pattern: "null bitmap", language: "Data", fix: "Alignment.", severity: "High" },
  { pattern: "anonymization", language: "Privacy", fix: "Hash.", severity: "Critical" },
  { pattern: "redaction regex", language: "Privacy", fix: "Test regex.", severity: "High" }
];

const seedData = async () => {
  try {
    await connectDB();
    console.log(`[Seeder] Adding ${dataCorruption.length} data corruption signatures...`);
    await RuntimeSignature.insertMany(dataCorruption);
    console.log("[Seeder] Data signatures added successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Uncomment to run standalone
// seedData();

module.exports = dataCorruption;