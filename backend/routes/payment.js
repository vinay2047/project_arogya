const express = require("express");
const Stripe = require("stripe");
const { authenticate, requireRole } = require("../middleware/auth");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const Appointment = require("../modal/Appointment");

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent
router.post(
  "/create-order",
  authenticate,
  requireRole("patient"),
  [
    body("appointmentId")
      .isMongoId()
      .withMessage("Valid appointment ID is required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { appointmentId } = req.body;

      // find appointment
      const appointment = await Appointment.findById(appointmentId)
        .populate("doctorId", "name specialization")
        .populate("patientId", "name email phone");

      if (!appointment) return res.notFound("Appointment not found");
      if (appointment.patientId._id.toString() !== req.auth.id)
        return res.forbidden("Access denied");

      if (appointment.paymentStatus === "Paid")
        return res.badRequest("Payment already completed");

      // Create a PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: appointment.totalAmount * 100, // amount in paise
        currency: "inr",
        description: `Appointment with Dr. ${appointment.doctorId.name}`,
        metadata: {
          appointmentId: appointmentId,
          doctorName: appointment.doctorId.name,
          patientName: appointment.patientId.name,
          consultationType: appointment.consultationType,
          date: appointment.date,
          slotStart: appointment.slotStartIso,
          slotEnd: appointment.slotEndIso,
        },
      });
      console.log(paymentIntent);

      res.ok(
        {
          clientSecret: paymentIntent.client_secret,
          amount: appointment.totalAmount,
          currency: "INR",
          key: process.env.STRIPE_PUBLISHABLE_KEY, // frontend uses this key
        },
        "Payment intent created successfully"
      );
    } catch (error) {
      res.serverError("Failed to create payment intent", [error.message]);
    }
  }
);

// Verify Payment (via webhook or confirmation route)
router.post(
  "/verify-payment",
  authenticate,
  requireRole("patient"),
  [
    body("appointmentId")
      .isMongoId()
      .withMessage("Valid appointment ID is required"),
    body("paymentIntentId")
      .isString()
      .withMessage("Stripe PaymentIntent ID is required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { appointmentId, paymentIntentId } = req.body;

      // find appointment
      const appointment = await Appointment.findById(appointmentId)
        .populate("doctorId", "name specialization")
        .populate("patientId", "name email phone");

      if (!appointment) return res.notFound("Appointment not found");
      if (appointment.patientId._id.toString() !== req.auth.id)
        return res.forbidden("Access denied");

      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== "succeeded")
        return res.badRequest("Payment not completed or failed");

      // Update appointment payment details
      appointment.paymentStatus = "Paid";
      appointment.paymentMethod = "Stripe";
      appointment.stripePaymentIntentId = paymentIntent.id;
      appointment.paymentDate = new Date();

      await appointment.save();

      await appointment.populate(
        "doctorId",
        "name specialization fees hospitalInfo profileImage"
      );
      await appointment.populate("patientId", "name email phone profileImage");

      res.ok(
        appointment,
        "Payment verified and appointment confirmed successfully"
      );
    } catch (error) {
      res.serverError("Failed to verify payment", [error.message]);
    }
  }
);

module.exports = router;
