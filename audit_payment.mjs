import Razorpay from 'razorpay';
const razorpay = new Razorpay({
    key_id: 'rzp_live_SdI77DtoaiASCw',
    key_secret: 'cuJT42qJ8tfrBg7Q1hltdkmL'
});

const checkStatus = async () => {
    try {
        const paymentId = 'pay_SispDdg7mRdfjm';
        const payment = await razorpay.payments.fetch(paymentId);
        console.log("PAYMENT AUDIT RESULTS:");
        console.log("-----------------------");
        console.log("Status:", payment.status);
        console.log("Amount:", payment.amount / 100);
        console.log("Method:", payment.method);
        console.log("Error Code:", payment.error_code);
        console.log("Error Description:", payment.error_description);
        console.log("Order ID:", payment.order_id);
    } catch (err) {
        console.error("Error fetching payment:", err.message);
    }
};
checkStatus();
