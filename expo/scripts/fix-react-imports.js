/**
 * One-off codemod for the Expo SDK 58 upgrade:
 * with `jsx: react-jsx` the default React import is no longer required,
 * so TS6133 flags `import React` in files that never reference React.
 * - `import React, { a, b } from 'react'`  ->  `import { a, b } from 'react'`
 * - `import React from 'react'`            ->  line removed
 * Only rewrites files listed on stdin (one path per line, relative to cwd).
 */
const fs = require('fs');
const path = require('path');

const files = fs.readFileSync(0, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean);

let changed = 0;
for (const rel of files) {
  const abs = path.resolve(rel);
  if (!fs.existsSync(abs)) continue;
  const src = fs.readFileSync(abs, 'utf8');
  let out = src;
  out = out.replace(/^import React, \{([^}]*)\} from 'react';$/m, "import {$1} from 'react';");
  out = out.replace(/^import React from 'react';\r?\n/m, '');
  if (out !== src) {
    fs.writeFileSync(abs, out);
    changed += 1;
    console.log('fixed', rel);
  }
}
console.log(`done: ${changed}/${files.length} files updated`);
