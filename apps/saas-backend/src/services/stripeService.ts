export async function createStripeCheckoutSession(priceId: string, successUrl?: string, cancelUrl?: string) {
  return {
    id: "cs_test_session_id",
    url: successUrl || "http://localhost:3000/success"
  };
}
