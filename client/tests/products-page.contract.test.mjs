import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("product search keeps an explicit error state and resets pagination before querying", async () => {
  const source = await readFile("src/pages/product/Products.jsx", "utf8");

  assert.match(source, /const \[error, setError\] = useState\(""\)/);
  assert.match(source, /setError\(requestError\.message/);
  assert.match(source, /setPage\(1\);\s*setSearch\(searchInput\.trim\(\)\)/);
  assert.doesNotMatch(source, /catch\(\(\) => setProducts\(\[\]\)\)/);
});
