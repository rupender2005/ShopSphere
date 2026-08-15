client/
├── public/
│ └── favicon.ico
│
├── src/
│ │
│ ├── assets/
│ │ ├── images/
│ │ ├── icons/
│ │ └── logo/
│ │
│ ├── components/
│ │ ├── ui/ # shadcn/ui
│ │ │
│ │ ├── common/
│ │ │ ├── Navbar.jsx
│ │ │ ├── Footer.jsx
│ │ │ ├── Loader.jsx
│ │ │ ├── ErrorMessage.jsx
│ │ │ ├── ConfirmDialog.jsx
│ │ │ ├── EmptyState.jsx
│ │ │ ├── ProtectedRoute.jsx
│ │ │ └── AdminRoute.jsx
│ │ │
│ │ ├── product/
│ │ │ ├── ProductCard.jsx
│ │ │ ├── ProductGrid.jsx
│ │ │ ├── ProductFilters.jsx
│ │ │ ├── ProductSort.jsx
│ │ │ ├── ProductSearch.jsx
│ │ │ ├── ProductImageGallery.jsx
│ │ │ ├── ProductInfo.jsx
│ │ │ ├── ProductQuantity.jsx
│ │ │ └── ProductReviews.jsx
│ │ │
│ │ ├── category/
│ │ │ ├── CategoryCard.jsx
│ │ │ └── CategoryList.jsx
│ │ │
│ │ ├── cart/
│ │ │ ├── CartItem.jsx
│ │ │ ├── CartList.jsx
│ │ │ ├── CartSummary.jsx
│ │ │ └── CartDrawer.jsx
│ │ │
│ │ ├── checkout/
│ │ │ ├── AddressForm.jsx
│ │ │ ├── OrderSummary.jsx
│ │ │ ├── PaymentMethod.jsx
│ │ │ └── PaymentButton.jsx
│ │ │
│ │ ├── auth/
│ │ │ ├── LoginForm.jsx
│ │ │ ├── SignupForm.jsx
│ │ │ ├── ForgotPasswordForm.jsx
│ │ │ └── ResetPasswordForm.jsx
│ │ │
│ │ ├── order/
│ │ │ ├── OrderCard.jsx
│ │ │ ├── OrderList.jsx
│ │ │ ├── OrderItems.jsx
│ │ │ ├── OrderStatus.jsx
│ │ │ └── OrderSummary.jsx
│ │ │
│ │ ├── review/
│ │ │ ├── ReviewForm.jsx
│ │ │ ├── ReviewCard.jsx
│ │ │ ├── ReviewList.jsx
│ │ │ └── RatingStars.jsx
│ │ │
│ │ └── admin/
│ │ ├── AdminSidebar.jsx
│ │ ├── AdminNavbar.jsx
│ │ ├── AdminStatsCard.jsx
│ │ ├── AdminProductTable.jsx
│ │ ├── AdminOrderTable.jsx
│ │ ├── AdminUserTable.jsx
│ │ ├── ProductForm.jsx
│ │ ├── CategoryForm.jsx
│ │ └── OrderStatusForm.jsx
│ │
│ ├── layouts/
│ │ ├── MainLayout.jsx
│ │ ├── AdminLayout.jsx
│ │ └── AuthLayout.jsx
│ │
│ ├── pages/
│ │ ├── Home.jsx
│ │ │
│ │ ├── product/
│ │ │ ├── Products.jsx
│ │ │ └── ProductDetail.jsx
│ │ │
│ │ ├── category/
│ │ │ └── CategoryProducts.jsx
│ │ │
│ │ ├── cart/
│ │ │ └── Cart.jsx
│ │ │
│ │ ├── checkout/
│ │ │ ├── Checkout.jsx
│ │ │ └── OrderSuccess.jsx
│ │ │
│ │ ├── auth/
│ │ │ ├── Login.jsx
│ │ │ ├── Signup.jsx
│ │ │ ├── ForgotPassword.jsx
│ │ │ └── ResetPassword.jsx
│ │ │
│ │ ├── account/
│ │ │ ├── Profile.jsx
│ │ │ ├── OrderHistory.jsx
│ │ │ └── OrderDetail.jsx
│ │ │
│ │ ├── admin/
│ │ │ ├── Dashboard.jsx
│ │ │ ├── Products.jsx
│ │ │ ├── Categories.jsx
│ │ │ ├── Orders.jsx
│ │ │ ├── Users.jsx
│ │ │ └── Reviews.jsx
│ │ │
│ │ └── NotFound.jsx
│ │
│ ├── store/
│ │ ├── authStore.js
│ │ └── cartStore.js
│ │
│ ├── services/
│ │ ├── api.js
│ │ ├── authService.js
│ │ ├── userService.js
│ │ ├── productService.js
│ │ ├── categoryService.js
│ │ ├── cartService.js
│ │ ├── orderService.js
│ │ ├── paymentService.js
│ │ ├── reviewService.js
│ │ └── adminService.js
│ │
│ ├── hooks/
│ │ ├── useAuth.js
│ │ ├── useCart.js
│ │ ├── useDebounce.js
│ │ └── usePagination.js
│ │
│ ├── utils/
│ │ ├── formatCurrency.js
│ │ ├── formatDate.js
│ │ ├── validators.js
│ │ ├── constants.js
│ │ └── errorHandler.js
│ │
│ ├── config/
│ │ └── env.js
│ │
│ ├── lib/
│ │ └── utils.js
│ │
│ ├── App.jsx
│ ├── main.jsx
│ └── index.css
│
├── .env
├── .env.example
├── .gitignore
├── index.html
├── vite.config.js
├── tailwind.config.js
├── components.json
└── package.json
