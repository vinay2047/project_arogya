const mongoose = require('mongoose');

const patient_data_for_ai_Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dob: { type: Date },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    allergies: { type: String, default: '' },
    currentMedications: { type: String, default: '' },
    chronicConditions: { type: String, default: '' },
    patientID: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIData', patient_data_for_ai_Schema);