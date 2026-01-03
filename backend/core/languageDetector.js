// // languageDetector.js
// const languagePatterns = {
//   python: [/Traceback \(most recent call last\)/, /File ".*", line \d+/, /NameError:/, /IndentationError:/, /ImportError:/],
//   java: [/Exception in thread ".*"/, /at .*\(.*\.java:\d+\)/, /Caused by:/, /NullPointerException/, /ArrayIndexOutOfBoundsException/],
//   javascript: [/ReferenceError:/, /TypeError:/, /at .* \(.*:\d+:\d+\)/, /undefined is not/, /console\.log/],
//   c_cpp: [/Segmentation fault/, /core dumped/, /Stack trace:/, /malloc\.c/, /#\d+  0x/],
//   csharp: [/System\.NullReferenceException/, /at .* in .*line \d+/, /System\.IO/, /Unhandled Exception:/],
//   go: [/panic:/, /goroutine \d+ \[running\]:/, /main\.main\(\)/, /runtime\/asm_/],
//   rust: [/thread 'main' panicked at/, /src\/main\.rs:\d+/, /unwrap\(\)/, /borrow checker/],
//   php: [/PHP Fatal error:/, /PHP Warning:/, /Stack trace:/, /Uncaught Error:/],
//   ruby: [/from .*\.rb:\d+:in/, /NameError:/, /NoMethodError:/],
//   swift: [/fatal error:/, /unexpectedly found nil/, /0x[0-9a-f]+/, /Swift\./],
//   kotlin: [/kotlin\.KotlinNullPointerException/, /at .*\.kt:\d+/, /SuspensionPoint/],
//   scala: [/scala\.MatchError/, /at .*\.scala:\d+/, /scala\.collection/],
//   typescript: [/TS\d+:/, /TypeError:/, /interface/, /public static/], // Often overlaps with JS
//   perl: [/Trace begin/, /via package/, /at .*\.pl line \d+/],
//   lua: [/lua:\d+:/, /stack traceback:/, /attempt to index/],
//   haskell: [/Prelude\./, / Exception:/, /callStack/],
//   shell: [/bash: .*: command not found/, /syntax error near unexpected token/, /\.sh: line \d+:/],
//   r: [/Error in/, /Traceback:/, /could not find function/],
//   dart: [/Unhandled exception:/, /#\d+/, /package:.*\.dart/],
//   sql: [/ORA-\d+/, /syntax error at or near/, /Relation .* does not exist/, /PL\/SQL/],
//   objective_c: [/NSInvalidArgumentException/, /reason:/, /\[.* .*\]/],
// };

// function detectLanguage(log) {
//   console.log("---------------------------------------------------");
//   console.log("[LanguageDetector] Starting detection for log snippet...");
//   console.log(`[LanguageDetector] Log preview: ${log.substring(0, 50)}...`);

//   let maxScore = 0;
//   let detectedLang = 'unknown';

//   for (const [lang, patterns] of Object.entries(languagePatterns)) {
//     let score = 0;
//     patterns.forEach(pattern => {
//       if (pattern.test(log)) {
//         score++;
//       }
//     });

//     if (score > 0) {
//         console.log(`[LanguageDetector] Language candidate: ${lang} (Score: ${score})`);
//     }

//     if (score > maxScore) {
//       maxScore = score;
//       detectedLang = lang;
//     }
//   }

//   console.log(`[LanguageDetector] Final Detection: ${detectedLang.toUpperCase()}`);
//   console.log("---------------------------------------------------");
//   return detectedLang;
// }

// module.exports = { detectLanguage };

// languageDetector.js

const languagePatterns = {
  // --- INFRASTRUCTURE (New) ---
  docker: [/Docker/, /FROM\s+/, /RUN\s+/, /CMD\s+/, /ENTRYPOINT/, /docker-compose/, /image not found/, /layer does not exist/],
  kubernetes: [/kubectl/, /Kind: Pod/, /Kind: Service/, /CrashLoopBackOff/, /ImagePullBackOff/, /kubelet/, /namespace/],
  aws: [/AccessDenied/, /AWS::/, /s3:/, /lambda/, /ARN/, /botocore/],

  // --- CORE LANGUAGES ---
  python: [/Traceback \(most recent call last\)/, /File ".*", line \d+/, /NameError:/, /IndentationError:/, /ImportError:/, /ModuleNotFoundError/, /KeyError:/, /ValueError:/],
  java: [/Exception in thread ".*"/, /at .*\(.*\.java:\d+\)/, /Caused by:/, /NullPointerException/, /ArrayIndexOutOfBoundsException/, /ClassNotFoundException/, /java\.lang\./, /spring-boot/],
  javascript: [/ReferenceError:/, /TypeError:/, /at .* \(.*:\d+:\d+\)/, /undefined is not/, /console\.log/, /\[object Object\]/, /NaN/, /Promise\.reject/],
  typescript: [/TS\d+:/, /TypeError:/, /interface/, /public static/, /<string>/, /<any>/, /\.ts:\d+:/], 
  c_cpp: [/Segmentation fault/, /core dumped/, /Stack trace:/, /malloc\.c/, /#\d+  0x/, /std::/, /glibc detected/, /assertion failed/],
  csharp: [/System\.NullReferenceException/, /at .* in .*line \d+/, /System\.IO/, /Unhandled Exception:/, /System\.Data/, /Microsoft\.AspNetCore/],
  
  // --- SYSTEMS & BACKEND ---
  go: [/panic:/, /goroutine \d+ \[running\]:/, /main\.main\(\)/, /runtime\/asm_/, /\.go:\d+/, /invalid memory address or nil pointer/],
  rust: [/thread 'main' panicked at/, /src\/main\.rs:\d+/, /unwrap\(\)/, /borrow checker/, /Option::unwrap/, /Result::unwrap/],
  php: [/PHP Fatal error:/, /PHP Warning:/, /Stack trace:/, /Uncaught Error:/, /Illuminate\\/, /composer/, /\.php:\d+/],
  ruby: [/from .*\.rb:\d+:in/, /NameError:/, /NoMethodError:/, /Gem::/, /bundler/, /rails/],
  
  // --- MOBILE ---
  swift: [/fatal error:/, /unexpectedly found nil/, /0x[0-9a-f]+/, /Swift\./, /EXC_BAD_ACCESS/],
  kotlin: [/kotlin\.KotlinNullPointerException/, /at .*\.kt:\d+/, /SuspensionPoint/, /AndroidRuntime/, /lateinit property/],
  objective_c: [/NSInvalidArgumentException/, /reason:/, /\[.* .*\]/, /SIGABRT/, /CFRelease/],
  dart: [/Unhandled exception:/, /#\d+/, /package:.*\.dart/, /flutter/, /Dart Error:/],

  // --- FUNCTIONAL & SCRIPTING ---
  scala: [/scala\.MatchError/, /at .*\.scala:\d+/, /scala\.collection/, /akka\./],
  perl: [/Trace begin/, /via package/, /at .*\.pl line \d+/, /Can't locate .* in @INC/],
  lua: [/lua:\d+:/, /stack traceback:/, /attempt to index/, /attempt to call/],
  haskell: [/Prelude\./, / Exception:/, /callStack/, /Non-exhaustive patterns/],
  shell: [/bash: .*: command not found/, /syntax error near unexpected token/, /\.sh: line \d+:/, /permission denied/, /command substitution/],
  r: [/Error in/, /Traceback:/, /could not find function/, /object .* not found/],
  sql: [/ORA-\d+/, /syntax error at or near/, /Relation .* does not exist/, /PL\/SQL/, /SQLSTATE/, /pg_query/],
};

function detectLanguage(log) {
  console.log("---------------------------------------------------");
  console.log("[LanguageDetector] Starting detection for log snippet...");
  console.log(`[LanguageDetector] Log preview: ${log.substring(0, 50)}...`);

  let maxScore = 0;
  let detectedLang = 'unknown';

  for (const [lang, patterns] of Object.entries(languagePatterns)) {
    let score = 0;
    patterns.forEach(pattern => {
      if (pattern.test(log)) {
        score++;
      }
    });

    if (score > 0) {
        console.log(`[LanguageDetector] Language candidate: ${lang} (Score: ${score})`);
    }

    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  }

  // Fallback heuristics if score is tied or low
  if (detectedLang === 'javascript' && /TS\d+/.test(log)) detectedLang = 'typescript';
  if (detectedLang === 'unknown' && /docker/i.test(log)) detectedLang = 'docker';

  console.log(`[LanguageDetector] Final Detection: ${detectedLang.toUpperCase()}`);
  console.log("---------------------------------------------------");
  return detectedLang;
}

module.exports = { detectLanguage };