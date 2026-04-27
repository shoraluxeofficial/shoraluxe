import fetch from 'node-fetch';

let cachedToken = null;
let tokenExpiry = null;

const getShiprocketToken = async () => {
    // Return cached token if valid
    if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
        return cachedToken;
    }

    try {
        const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: process.env.SHIPROCKET_EMAIL,
                password: process.env.SHIPROCKET_PASSWORD
            })
        });

        const data = await res.json();
        if (data.token) {
            cachedToken = data.token;
            // Token is usually valid for 10 days, we refresh every 24 hours to be safe
            tokenExpiry = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); 
            return cachedToken;
        } else {
            console.error('Shiprocket Auth Error:', data);
            throw new Error('Failed to authenticate with Shiprocket');
        }
    } catch (err) {
        console.error('Shiprocket Login Exception:', err);
        throw err;
    }
};

export const calculateShippingRate = async (deliveryPincode) => {
    try {
        const token = await getShiprocketToken();
        const pickupPincode = '500072'; // The one we fetched
        
        // Shiprocket Serviceability API
        const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=0.5&cod=0`;
        
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (data.status === 200 && data.data && data.data.available_courier_companies.length > 0) {
            // Find the cheapest courier
            const couriers = data.data.available_courier_companies;
            let lowestRate = Number.MAX_VALUE;
            for (let c of couriers) {
                if (c.rate < lowestRate) {
                    lowestRate = c.rate;
                }
            }
            return {
                success: true,
                rate: Math.ceil(lowestRate)
            };
        } else {
            // If no couriers available or invalid pincode
            return {
                success: false,
                message: 'Pincode unserviceable'
            };
        }
    } catch (err) {
        console.error('Shiprocket Calculate Rate Error:', err);
        return { success: false, message: 'API Error' };
    }
};

export const pushOrderToShiprocket = async (orderPayload) => {
    try {
        const token = await getShiprocketToken();
        
        // Format date string to "Y-m-d H:i"
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const mi = String(now.getMinutes()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd} ${hh}:${mi}`;

        // Transform our internal payload to Shiprocket Custom Order payload
        const shiprocketPayload = {
            order_id: `SHORA_${orderPayload.orderId}`,
            order_date: formattedDate,
            pickup_location: "Shora",
            billing_customer_name: orderPayload.firstName,
            billing_last_name: orderPayload.lastName || "Customer",
            billing_address: orderPayload.address1,
            billing_address_2: orderPayload.flatNo || "",
            billing_city: orderPayload.city,
            billing_pincode: orderPayload.pincode,
            billing_state: orderPayload.state,
            billing_country: "India",
            billing_email: orderPayload.email,
            billing_phone: orderPayload.phone,
            shipping_is_billing: true,
            order_items: orderPayload.items.map(item => ({
                name: item.title,
                sku: `SKU-${item.id}`,
                units: item.quantity,
                selling_price: item.price
            })),
            payment_method: orderPayload.paymentMethod === 'razorpay' ? 'Prepaid' : 'COD',
            sub_total: orderPayload.amount,
            length: 15,
            breadth: 15,
            height: 10,
            weight: 0.5 // default 500g
        };

        console.log('Pushing to Shiprocket...', shiprocketPayload.order_id);

        const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(shiprocketPayload)
        });

        const data = await res.json();
        
        if (res.ok && data.status_code === 1) {
            console.log('Shiprocket order created successfully:', data.order_id);
            return { success: true, shiprocket_order_id: data.order_id, shipment_id: data.shipment_id };
        } else {
            console.error('Shiprocket Create Order failed:', data);
            return { success: false, error: data.message || 'Shiprocket order creation failed' };
        }
    } catch (err) {
        console.error('Push Order to Shiprocket Error:', err);
        return { success: false, error: err.message };
    }
};
