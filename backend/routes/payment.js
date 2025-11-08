const express = require('express');
const Stripe = require('stripe');
const { authenticate, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const Appointment = require('../models/Appointment');

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe webhook handler
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await handlePaymentFailure(event.data.object);
          break;
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Webhook Error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

async function handlePaymentSuccess(paymentIntent) {
  try {
    const appointmentId = paymentIntent.metadata.appointmentId;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) return;

    appointment.paymentStatus = 'Paid';
    appointment.stripePaymentStatus = 'succeeded';
    appointment.paymentMethod = 'Stripe';
    appointment.stripePaymentIntentId = paymentIntent.id;
    appointment.paymentDate = new Date();

    await appointment.save();
  } catch (error) {
    console.error('Payment success handler error:', error);
  }
}

async function handlePaymentFailure(paymentIntent) {
  try {
    const appointmentId = paymentIntent.metadata.appointmentId;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) return;

    appointment.paymentStatus = 'Failed';
    appointment.stripePaymentStatus = 'failed';
    appointment.lastPaymentError = paymentIntent.last_payment_error?.message;

    await appointment.save();
  } catch (error) {
    console.error('Payment failure handler error:', error);
  }
}

// Create Payment Intent
router.post(
  '/create-order',
  authenticate,
  requireRole('patient'),
  [
    body('appointmentId')
      .isMongoId()
      .withMessage('Valid appointment ID is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { appointmentId } = req.body;

      // find appointment
      const appointment = await Appointment.findById(appointmentId)
        .populate('doctorId', 'name specialization')
        .populate('patientId', 'name email phone');

      if (!appointment) return res.notFound('Appointment not found');
      if (appointment.patientId._id.toString() !== req.auth.id)
        return res.forbidden('Access denied');

      if (appointment.paymentStatus === 'Paid')
        return res.badRequest('Payment already completed');

      // Create a PaymentIntent
      const amount = Math.round(appointment.totalAmount * 100); // Convert to smallest currency unit

      // Create a PaymentIntent with additional security measures
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'inr',
        description: `Appointment with Dr. ${appointment.doctorId.name}`,
        metadata: {
          appointmentId: appointmentId,
          doctorName: appointment.doctorId.name,
          patientName: appointment.patientId.name,
          consultationType: appointment.consultationType,
          date: appointment.date.toISOString(),
          slotStart: appointment.slotStartIso,
          slotEnd: appointment.slotEndIso,
        },
        receipt_email: appointment.patientId.email,
        setup_future_usage: 'off_session',
        statement_descriptor: 'HEALTHCARE MGMT', // Maximum 22 characters
        statement_descriptor_suffix: 'APPOINTMENT',
        automatic_payment_methods: {
          enabled: false,
        },
      });
      console.log(paymentIntent);

      res.ok(
        {
          clientSecret: paymentIntent.client_secret,
          amount: appointment.totalAmount,
          currency: 'INR',
          key: process.env.STRIPE_PUBLISHABLE_KEY, // frontend uses this key
        },
        'Payment intent created successfully'
      );
    } catch (error) {
      res.serverError('Failed to create payment intent', [error.message]);
    }
  }
);

// Verify Payment (via webhook or confirmation route)
router.post(
  '/verify-payment',
  authenticate,
  requireRole('patient'),
  [
    body('appointmentId')
      .isMongoId()
      .withMessage('Valid appointment ID is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { appointmentId } = req.body;

      // find appointment
      const appointment = await Appointment.findById(appointmentId)
        .populate('doctorId', 'name specialization')
        .populate('patientId', 'name email phone');

      if (!appointment) return res.notFound('Appointment not found');
      if (appointment.patientId._id.toString() !== req.auth.id)
        return res.forbidden('Access denied');

      // Instantly mark as paid and booked
      appointment.paymentStatus = 'Paid';
      appointment.paymentMethod = 'Manual';
      appointment.paymentDate = new Date();
      await appointment.save();

      await appointment.populate(
        'doctorId',
        'name specialization fees hospitalInfo profileImage'
      );
      await appointment.populate('patientId', 'name email phone profileImage');

      res.ok(
        appointment,
        'Appointment booked and payment marked as verified (no payment processed)'
      );
    } catch (error) {
      res.serverError('Failed to verify payment', [error.message]);
    }
  }
);

module.exports = router;
