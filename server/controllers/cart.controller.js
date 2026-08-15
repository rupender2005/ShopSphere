const { Cart } = require("../models/cart.model");
const { Product } = require("../models/product.model");
const { ResponseHandler } = require("../utils/responseHandler");

// Recalculate Cart
const recalculateCart = async (cart) => {
  const productIds = cart.items.map((item) => item.product);

  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  });

  const productMap = new Map(
    products.map((product) => [product._id.toString(), product]),
  );

  const validItems = [];
  let totalItems = 0;
  let totalPrice = 0;

  for (const item of cart.items) {
    const product = productMap.get(item.product.toString());

    if (!product) {
      continue;
    }

    const quantity = Math.min(item.quantity, product.stock);

    if (quantity <= 0) {
      continue;
    }

    const price =
      product.discountPrice !== null && product.discountPrice !== undefined
        ? product.discountPrice
        : product.price;

    item.quantity = quantity;

    validItems.push(item);
    totalItems += quantity;
    totalPrice += price * quantity;
  }

  cart.items = validItems;
  cart.totalItems = totalItems;
  cart.totalPrice = totalPrice;

  return cart;
};

// Get Cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return ResponseHandler(res, 200, true, "Cart is empty", {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
    }

    cart = await recalculateCart(cart);

    await cart.save();

    await cart.populate("items.product");

    return ResponseHandler(res, 200, true, "Cart fetched successfully", cart);
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > cart > recalculate",
    );
  }
};

// Add To Cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return ResponseHandler(
        res,
        400,
        false,
        "Product ID and quantity are required",
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return ResponseHandler(
        res,
        400,
        false,
        "Quantity must be a positive whole number",
      );
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return ResponseHandler(res, 404, false, "Product not found");
    }

    if (product.stock === 0) {
      return ResponseHandler(res, 400, false, "Product is out of stock");
    }

    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (item) {
      const newQuantity = item.quantity + quantity;

      if (newQuantity > product.stock) {
        return ResponseHandler(
          res,
          400,
          false,
          `Only ${product.stock} items available in stock`,
        );
      }

      item.quantity = newQuantity;
    } else {
      if (quantity > product.stock) {
        return ResponseHandler(
          res,
          400,
          false,
          `Only ${product.stock} items available in stock`,
        );
      }

      cart.items.push({
        product: productId,
        quantity,
      });
    }

    cart = await recalculateCart(cart);

    await cart.save();

    await cart.populate("items.product");

    return ResponseHandler(res, 200, true, "Item added to cart", cart);
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > cart> addTocart",
    );
  }
};

// Update Cart
const updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return ResponseHandler(
        res,
        400,
        false,
        "Product ID and quantity are required",
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return ResponseHandler(
        res,
        400,
        false,
        "Quantity must be a positive whole number",
      );
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return ResponseHandler(res, 404, false, "Cart not found");
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (!item) {
      return ResponseHandler(res, 404, false, "Item not found in cart");
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return ResponseHandler(res, 404, false, "Product not found");
    }

    if (quantity > product.stock) {
      return ResponseHandler(
        res,
        400,
        false,
        `Only ${product.stock} items available in stock`,
      );
    }

    item.quantity = quantity;

    await recalculateCart(cart);

    await cart.save();

    await cart.populate("items.product");

    return ResponseHandler(res, 200, true, "Cart updated successfully", cart);
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > cart > updateCart",
    );
  }
};

// Remove From Cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return ResponseHandler(res, 400, false, "Product ID is required");
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return ResponseHandler(res, 404, false, "Cart not found");
    }

    const itemExists = cart.items.some(
      (item) => item.product.toString() === productId,
    );

    if (!itemExists) {
      return ResponseHandler(res, 404, false, "Item not found in cart");
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );

    await recalculateCart(cart);

    await cart.save();

    await cart.populate("items.product");

    return ResponseHandler(res, 200, true, "Item removed from cart", cart);
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > cart > removeCart",
    );
  }
};

// Clear Cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return ResponseHandler(res, 404, false, "Cart not found");
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;

    await cart.save();

    return ResponseHandler(res, 200, true, "Cart cleared successfully", cart);
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > cart >clearcart",
    );
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
};
