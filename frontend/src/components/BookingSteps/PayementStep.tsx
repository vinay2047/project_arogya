import React, { useEffect, useState } from "react";
import { httpService } from "@/service/httpService";
import { userAuthStore } from "@/store/authStore";
import { Separator } from "../ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, CreditCard, Loader2, Shield, XCircle } from "lucide-react";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentStepInterface {
  selectedDate: Date | undefined;
  selectedSlot: string;
  consultationType: string;
  doctorName: string;
  slotDuration: number;
  consultationFee: number;
  isProcessing: boolean;
  onBack: () => void;
  onConfirm: () => void;
  onPaymentSuccess?: (appointment: any) => void;
  loading: boolean;
  appointmentId?: string;
  patientName?: string;
}

const PaymentForm = ({
  appointmentId,
  doctorName,
  patientName,
  onPaymentSuccess,
  onConfirm,
  setPaymentStatus,
  setError,
  paymentStatus,
}: any) => {
  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async () => {
    // if (!stripe || !elements || !appointmentId) return;

    try {
      setPaymentStatus("processing");
      setError("");
      console.log(appointmentId);

      const res = await httpService.postWithAuth("/payment/create-order", {
        appointmentId,
      });
      

      if (!res.success) throw new Error(res.message);

      const { clientSecret } = res.data;

      const result = await stripe?.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: { name: patientName },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      } else if (result.paymentIntent?.status === "succeeded") {
        const verifyRes = await httpService.postWithAuth("/payment/verify-payment", {
          appointmentId,
          paymentIntentId: result.paymentIntent.id,
        });

        if (verifyRes.success) {
          setPaymentStatus("success");
          onPaymentSuccess?.(verifyRes.data);
        } else {
          throw new Error(verifyRes.message);
        }
      }
    } catch (err: any) {
      setError(err.message);
      setPaymentStatus("failed");
    }
  };

  return (
    <div className="space-y-4">
      <CardElement className="p-4 border rounded-md bg-white" />
      <Button
        onClick={handlePayment}
        className="w-full bg-green-600 hover:bg-green-700"
        // disabled={!stripe || !elements || !appointmentId || paymentStatus === 'processing'}
      >
        {paymentStatus === 'processing' ? 'Processing...' : 'Pay & Confirm'}
      </Button>
    </div>
  );
};

const PayementStep = ({
  selectedDate,
  selectedSlot,
  consultationType,
  doctorName,
  slotDuration,
  consultationFee,
  isProcessing,
  onBack,
  onConfirm,
  onPaymentSuccess,
  loading,
  appointmentId,
  patientName,
}: PaymentStepInterface) => {
  const { user } = userAuthStore();
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");
  const [error, setError] = useState<string>("");
  const platformFees = Math.round(consultationFee * 0.1);
  const totalAmount = consultationFee + platformFees;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Payment & Confirmation
        </h3>
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h4 className="font-semibold text-gray-900 mb-4">Booking Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time</span>
              <span className="font-medium">
                {selectedDate?.toLocaleDateString()} at {selectedSlot}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Consultation Type</span>
              <span className="font-medium">{consultationType}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Doctor</span>
              <span className="font-medium">{doctorName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Duration</span>
              <span className="font-medium">{slotDuration} minutes</span>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-gray-600">Consultation Fee</span>
              <span className="font-medium">₹{consultationFee}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee</span>
              <span className="font-medium">₹{platformFees}</span>
            </div>

            <Separator />

            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total Amount</span>
              <span className="font-bold text-green-600">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {paymentStatus === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-teal-600 animate-spin" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Processing Payment...
              </h4>
              <p className="text-gray-600 mb-4">Please wait while we confirm your payment</p>
              <Progress value={50} className="w-full" />
            </motion.div>
          )}

          {paymentStatus === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h4 className="text-lg font-semibold text-green-800 mb-2">
                Payment Successful!
              </h4>
              <p className="text-gray-600 mb-4">
                Your appointment has been confirmed
              </p>
            </motion.div>
          )}

          {paymentStatus === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
              <h4 className="text-lg font-semibold text-red-800 mb-2">
                Payment failed!
              </h4>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                onClick={() => {
                  setPaymentStatus("idle");
                  setError("");
                }}
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {paymentStatus === "idle" && (
          <Elements stripe={stripePromise}>
            <PaymentForm
              appointmentId={appointmentId}
              doctorName={doctorName}
              patientName={patientName}
              onPaymentSuccess={onPaymentSuccess}
              onConfirm={onConfirm}
              setPaymentStatus={setPaymentStatus}
              setError={setError}
              paymentStatus={paymentStatus}
            />
          </Elements>
        )}

        <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg mb-8">
          <Shield className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-medium text-green-800">Secure Payment</p>
            <p>Your payment is protected by Stripe’s encrypted processing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayementStep;
