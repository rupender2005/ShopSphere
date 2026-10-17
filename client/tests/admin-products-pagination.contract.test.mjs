import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("admin products fetches each page and exposes navigation through the full result count", async () => {
  const source = await readFile("src/pages/admin/Products.jsx", "utf8");

  assert.match(source, /productService\.getProducts\(\{\s*page,\s*limit: 15\s*\}\)/);
  assert.match(source, /const nextTotalPages = Math\.max\(\s*1,\s*productsResponse\.data\?\.totalPages \|\| 1,\s*\);\s*setTotalPages\(nextTotalPages\)/);
  assert.match(source, /<Pagination[\s\S]*?count=\{totalPages\}[\s\S]*?page=\{page\}/);
});
