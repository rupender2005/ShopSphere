import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("product details confirm an add without redirecting to the cart", async () => {
  const source = await readFile("src/pages/product/ProductDetail.jsx", "utf8");

  assert.doesNotMatch(source, /navigate\(["']\/cart["']\)/);
  assert.match(source, /Added to cart/);
  assert.match(source, /View cart/i);
});

test("product cards confirm an add and offer a cart link", async () => {
  const source = await readFile("src/components/product/ProductCard.jsx", "utf8");

  assert.match(source, /Added to cart/);
  assert.match(source, /View cart/i);
});
