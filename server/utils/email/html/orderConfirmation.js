const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getSafeImageUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? escapeHtml(url.href) : "";
  } catch {
    return "";
  }
};

const getOrderConfirmationContent = (order) => {
  const orderId = escapeHtml(order._id);
  const customerName = escapeHtml(order.shippingAddress?.name || order.user?.name || "there");
  const address = order.shippingAddress || {};
  const addressLines = [
    address.street,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
    address.country,
    `Phone: ${address.phone || "Not provided"}`,
  ].filter(Boolean);
  const addressHtml = addressLines.map(escapeHtml).join("<br />");
  const addressText = addressLines.join("\n");
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  const itemRows = (order.items || []).map((item) => {
    const name = escapeHtml(item.name || "Product");
    const quantity = Number(item.quantity || 0);
    const price = Number(item.price || 0);
    const imageUrl = getSafeImageUrl(item.image);
    const imageHtml = imageUrl
      ? `<img src="${imageUrl}" alt="${name}" width="64" height="64" style="display:block;width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0;" />`
      : "";

    return {
      html: `<tr>
        <td style="padding:14px 8px;border-bottom:1px solid #e2e8f0;width:76px;">${imageHtml}</td>
        <td style="padding:14px 8px;border-bottom:1px solid #e2e8f0;color:#0f172a;">
          <strong>${name}</strong><br />
          <span style="color:#64748b;font-size:13px;">Qty ${quantity} × ${formatCurrency(price)}</span>
        </td>
        <td style="padding:14px 8px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;color:#0f172a;">${formatCurrency(price * quantity)}</td>
      </tr>`,
      text: `${item.name || "Product"} — Qty ${quantity} × ${formatCurrency(price)} = ${formatCurrency(price * quantity)}`,
    };
  });

  const totalRows = [
    ["Items subtotal", formatCurrency(order.subtotal)],
    ["Delivery", Number(order.shippingFee) === 0 ? "FREE" : formatCurrency(order.shippingFee)],
    ["Marketplace fee", formatCurrency(order.marketplaceFee)],
    ...(Number(order.codFee) > 0 ? [["Cash on delivery fee", formatCurrency(order.codFee)]] : []),
    ...(order.taxIncluded && Number(order.tax) > 0
      ? [["GST included in product prices", formatCurrency(order.tax)]]
      : []),
  ];
  const totalRowsHtml = totalRows
    .map(([label, value]) => `<tr><td style="padding:5px 0;color:#475569;">${escapeHtml(label)}</td><td style="padding:5px 0;text-align:right;color:#0f172a;">${escapeHtml(value)}</td></tr>`)
    .join("");
  const paymentLabel = order.paymentMethod === "COD" ? "Cash on delivery" : "Razorpay";
  const paymentText = `${paymentLabel} (${order.paymentStatus || "Pending"})`;

  const html = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>ShopSphere order ${orderId}</title></head>
  <body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:28px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
          <tr><td style="background:#111827;padding:24px 30px;color:#ffffff;font-size:22px;font-weight:bold;">ShopSphere</td></tr>
          <tr><td style="padding:30px;">
            <h1 style="margin:0 0 10px;font-size:25px;line-height:1.25;">Thanks for your order, ${customerName}!</h1>
            <p style="margin:0 0 22px;color:#475569;line-height:1.6;">${order.paymentMethod === "COD" ? "We received your order." : "Your payment was successful and your order is confirmed."}</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:22px;background:#f8fafc;border-radius:8px;">
              <tr><td style="padding:12px 14px;color:#475569;">Order ID</td><td style="padding:12px 14px;text-align:right;font-weight:bold;">${orderId}</td></tr>
              <tr><td style="padding:0 14px 12px;color:#475569;">Placed on</td><td style="padding:0 14px 12px;text-align:right;">${escapeHtml(orderDate)}</td></tr>
            </table>
            <h2 style="margin:25px 0 8px;font-size:17px;">Items in your order</h2>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              ${itemRows.map((row) => row.html).join("")}
            </table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;border-collapse:collapse;">
              ${totalRowsHtml}
              <tr><td colspan="2" style="padding-top:12px;border-top:1px solid #cbd5e1;"></td></tr>
              <tr><td style="padding:7px 0;font-size:18px;font-weight:bold;">Order total</td><td style="padding:7px 0;text-align:right;font-size:18px;font-weight:bold;">${formatCurrency(order.totalAmount)}</td></tr>
            </table>
            ${order.taxIncluded && Number(order.tax) > 0 ? '<p style="margin:8px 0 0;color:#64748b;font-size:12px;">GST is already included in the item prices and has not been added again at checkout.</p>' : ""}
            <h2 style="margin:28px 0 8px;font-size:17px;">Delivery address</h2>
            <p style="margin:0;color:#475569;line-height:1.7;">${addressHtml}</p>
            <p style="margin:18px 0 0;color:#475569;"><strong>Payment:</strong> ${escapeHtml(paymentText)}</p>
            <p style="margin:28px 0 0;color:#64748b;font-size:13px;line-height:1.6;">We’ll keep you updated as your order moves through delivery. Thank you for shopping with ShopSphere.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = [
    `Thanks for your order, ${customerName}!`,
    `Order ID: ${order._id}`,
    `Placed on: ${orderDate}`,
    "",
    "Items:",
    ...itemRows.map((row) => row.text),
    "",
    ...totalRows.map(([label, value]) => `${label}: ${value}`),
    `Order total: ${formatCurrency(order.totalAmount)}`,
    ...(order.taxIncluded && Number(order.tax) > 0
      ? ["GST is included in product prices; it was not added again at checkout."]
      : []),
    "",
    "Delivery address:",
    addressText,
    `Payment: ${paymentText}`,
  ].join("\n");

  return { html, text };
};

module.exports = { getOrderConfirmationContent };
