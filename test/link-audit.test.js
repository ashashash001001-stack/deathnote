const fs = require('fs');
const path = require('path');

console.log('Running Link Audit Tests...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch(e) {
    console.log(`✗ ${name}: ${e.message}`);
    failed++;
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`);
    },
    toBeGreaterThan(expected) {
      if (!(actual > expected)) throw new Error(`Expected ${actual} > ${expected}`);
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy, got ${actual}`);
    }
  };
}

test('Root pages use correct relative paths', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  expect(index.includes('href="./book/')).toBeTruthy();
  expect(index.includes('href="./shelf.html')).toBeTruthy();
  expect(index.includes('href="./my.html')).toBeTruthy();
});

test('Book pages use ../ relative paths', () => {
  const book = fs.readFileSync('book/death-note/index.html', 'utf8');
  expect(book.includes('href="../"')).toBeTruthy();
  expect(book.includes('href="../category/"')).toBeTruthy();
});

test('Chapter pages use ../../ relative paths', () => {
  const chapter = fs.readFileSync('book/death-note/ch-1/index.html', 'utf8');
  expect(chapter.includes('href="../../"')).toBeTruthy();
  expect(chapter.includes('href="../../book/"')).toBeTruthy();
});

test('No double-prefixed paths like /deathnote/deathnote/', () => {
  const files = [];
  function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
      const p = path.join(dir, f);
      try {
        if (fs.statSync(p).isDirectory()) walk(p);
        else if (f.endsWith('.html')) files.push(p);
      } catch(e) {}
    });
  }
  walk('.');
  
  let errors = 0;
  files.forEach(f => {
    const c = fs.readFileSync(f, 'utf8');
    if (c.includes('/deathnote/deathnote/') || c.includes('"./deathnote/')) {
      console.error('  Double-path error in:', f);
      errors++;
    }
  });
  expect(errors).toBe(0);
});

test('All generated HTML files exist', () => {
  const expected = ['index.html', 'shelf.html', 'my.html', '404.html'];
  expected.forEach(f => expect(fs.existsSync(f)).toBeTruthy());
});

test('Book directories created', () => {
  const bookDirs = fs.readdirSync('book').filter(d => 
    fs.statSync(path.join('book', d)).isDirectory() && !d.startsWith('.')
  );
  expect(bookDirs.length).toBeGreaterThan(0);
});

test('Category directories created', () => {
  const catDirs = fs.readdirSync('category').filter(d => 
    fs.statSync(path.join('category', d)).isDirectory() && !d.startsWith('.')
  );
  expect(catDirs.length).toBeGreaterThan(0);
});

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);