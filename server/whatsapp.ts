type OrderWithItems = {
  customerName: string;
  orderNumber: string;
  totalAmount: number | any;
  address: string;
  city: string;
  whatsapp: string;
  items: {
    quantity: number;
    price: number | any;
    product: { name: string };
  }[];
};

export function formatCurrency(amount: number | any): string {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `₨ ${Math.round(num).toLocaleString('en-PK')}`;
}

export async function sendOrderConfirmation(order: OrderWithItems): Promise<{ success: boolean; error?: string }> {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      console.log(`[WhatsApp Concierge] Info: WHATSAPP credentials not set in .env. Skipping external graph API dispatch.`);
      return { success: true };
    }

    const itemsSummary = order.items
      .map(item => `- ${item.quantity}x ${item.product.name} (${formatCurrency(item.price)})`)
      .join('\n');

    const message = `Hello ${order.customerName},\n\nThank you for your order from QITRA Haute Maison!\n\nOrder Number: ${order.orderNumber}\n\nOrder Details:\n${itemsSummary}\n\nTotal: ${formatCurrency(order.totalAmount)}\n\nDelivery Address:\n${order.address}, ${order.city}\n\nWe will contact you shortly when your order is out for delivery.`;

    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: order.whatsapp.replace(/\D/g, ''),
        type: 'text',
        text: {
          body: message,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('WhatsApp API Error:', errorData);
      return { success: false, error: 'Failed to send WhatsApp message' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
