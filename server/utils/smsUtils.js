import axios from "axios";

/**
 * Sends OTP via Fast2SMS using route "otp" - cheapest available (₹0.45/SMS)
 * Quick SMS route "q" costs ₹5/SMS - avoid it.
 */
export const sendSMS_OTP = async (mobile, otp) => {
    const API_KEY = process.env.FAST2SMS_API_KEY;

    if (!API_KEY) {
        throw new Error("Fast2SMS API Key missing in server/.env");
    }

    const cleanMobile = mobile.replace("+91", "").trim();

    try {
        const response = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
            params: {
                authorization: API_KEY,
                route: "q",                              // ✅ Works without website verification
                message: `Your Shoraluxe OTP is ${otp}`,
                language: "english",
                flash: 0,
                numbers: cleanMobile
            }
        });

        console.log("Fast2SMS Response:", JSON.stringify(response.data));

        if (response.data.return === true) {
            return { success: true };
        } else {
            throw new Error(response.data.message || "SMS send failed");
        }

    } catch (error) {
        console.error("Fast2SMS Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "SMS delivery failed");
    }
};
