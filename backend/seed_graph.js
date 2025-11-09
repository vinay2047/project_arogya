const mongoose = require('mongoose');
const KnowledgeGraph = require('./models/KnowledgeGraph');

// Create one massive, richly detailed test knowledge graph
const testGraph = {
  userId: new mongoose.Types.ObjectId('6730cc40a17e3a394d889fa1'),
  graphId: 'graph_1731125000_demo_full',
  summary:
    'Comprehensive healthcare knowledge graph interlinking multiple patients, doctors, diseases, medications, tests, hospitals, and lifestyle factors for AI-driven patient analytics.',

  nodes: [
    // === PATIENTS ===
    {
      nodeId: 'n1',
      label: 'Patient',
      properties: { name: 'John Doe', age: 47, gender: 'Male' },
      infoId: 'i1',
    },
    {
      nodeId: 'n2',
      label: 'Patient',
      properties: { name: 'Asha Patel', age: 62, gender: 'Female' },
      infoId: 'i2',
    },
    {
      nodeId: 'n3',
      label: 'Patient',
      properties: { name: 'Ravi Kumar', age: 35, gender: 'Male' },
      infoId: 'i3',
    },

    // === CONDITIONS ===
    {
      nodeId: 'n4',
      label: 'Condition',
      properties: { name: 'Mitral Valve Prolapse', severity: 'Mild' },
      infoId: 'i4',
    },
    {
      nodeId: 'n5',
      label: 'Condition',
      properties: { name: 'Type 2 Diabetes', severity: 'Moderate' },
      infoId: 'i5',
    },
    {
      nodeId: 'n6',
      label: 'Condition',
      properties: { name: 'Hypertension', severity: 'High' },
      infoId: 'i6',
    },
    {
      nodeId: 'n7',
      label: 'Condition',
      properties: { name: 'Asthma', severity: 'Low' },
      infoId: 'i7',
    },

    // === DOCTORS ===
    {
      nodeId: 'n8',
      label: 'Doctor',
      properties: { name: 'Dr. Priya Sharma', specialization: 'Cardiology' },
      infoId: 'i8',
    },
    {
      nodeId: 'n9',
      label: 'Doctor',
      properties: { name: 'Dr. Manish Verma', specialization: 'Endocrinology' },
      infoId: 'i9',
    },
    {
      nodeId: 'n10',
      label: 'Doctor',
      properties: { name: 'Dr. Reena Nair', specialization: 'Pulmonology' },
      infoId: 'i10',
    },

    // === MEDICATIONS ===
    {
      nodeId: 'n11',
      label: 'Medication',
      properties: {
        name: 'Metoprolol',
        dosage: '25mg',
        frequency: 'Twice daily',
      },
      infoId: 'i11',
    },
    {
      nodeId: 'n12',
      label: 'Medication',
      properties: {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Once daily',
      },
      infoId: 'i12',
    },
    {
      nodeId: 'n13',
      label: 'Medication',
      properties: {
        name: 'Losartan',
        dosage: '50mg',
        frequency: 'Once daily',
      },
      infoId: 'i13',
    },
    {
      nodeId: 'n14',
      label: 'Medication',
      properties: {
        name: 'Salbutamol Inhaler',
        dosage: '2 puffs',
        frequency: 'As needed',
      },
      infoId: 'i14',
    },

    // === TESTS ===
    {
      nodeId: 'n15',
      label: 'Test',
      properties: { name: 'Echocardiogram', result: 'Mild MVP detected' },
      infoId: 'i15',
    },
    {
      nodeId: 'n16',
      label: 'Test',
      properties: { name: 'Blood Sugar (HbA1c)', result: '7.8%' },
      infoId: 'i16',
    },
    {
      nodeId: 'n17',
      label: 'Test',
      properties: { name: 'Blood Pressure', result: '150/95 mmHg' },
      infoId: 'i17',
    },
    {
      nodeId: 'n18',
      label: 'Test',
      properties: { name: 'Pulmonary Function Test', result: 'Normal' },
      infoId: 'i18',
    },

    // === HOSPITALS ===
    {
      nodeId: 'n19',
      label: 'Hospital',
      properties: {
        name: 'Global Heart Institute',
        city: 'Delhi',
        accreditation: 'NABH',
      },
      infoId: 'i19',
    },
    {
      nodeId: 'n20',
      label: 'Hospital',
      properties: {
        name: 'Metro Diabetes Center',
        city: 'Mumbai',
        accreditation: 'ISO 9001',
      },
      infoId: 'i20',
    },

    // === LIFESTYLE FACTORS ===
    {
      nodeId: 'n21',
      label: 'Lifestyle',
      properties: {
        factor: 'Smoking',
        status: 'Occasional',
        years: 10,
      },
      infoId: 'i21',
    },
    {
      nodeId: 'n22',
      label: 'Lifestyle',
      properties: {
        factor: 'Exercise',
        frequency: '3 days/week',
        type: 'Cardio',
      },
      infoId: 'i22',
    },
  ],

  edges: [
    // --- Relations between patients and conditions ---
    {
      edgeId: 'e1',
      source: 'n1',
      target: 'n4',
      relation: 'diagnosed_with',
      properties: { confidence: 0.96, date: '2024-11-01' },
      infoId: 'i23',
    },
    {
      edgeId: 'e2',
      source: 'n2',
      target: 'n5',
      relation: 'diagnosed_with',
      properties: { confidence: 0.92, date: '2024-10-20' },
      infoId: 'i24',
    },
    {
      edgeId: 'e3',
      source: 'n3',
      target: 'n6',
      relation: 'diagnosed_with',
      properties: { confidence: 0.88, date: '2024-09-10' },
      infoId: 'i25',
    },
    {
      edgeId: 'e4',
      source: 'n3',
      target: 'n7',
      relation: 'diagnosed_with',
      properties: { confidence: 0.75, date: '2023-05-14' },
      infoId: 'i26',
    },

    // --- Doctors treating patients ---
    {
      edgeId: 'e5',
      source: 'n8',
      target: 'n1',
      relation: 'treats',
      properties: { since: '2024-11-06' },
      infoId: 'i27',
    },
    {
      edgeId: 'e6',
      source: 'n9',
      target: 'n2',
      relation: 'treats',
      properties: { since: '2024-10-25' },
      infoId: 'i28',
    },
    {
      edgeId: 'e7',
      source: 'n10',
      target: 'n3',
      relation: 'treats',
      properties: { since: '2024-08-18' },
      infoId: 'i29',
    },

    // --- Doctors prescribing medications ---
    {
      edgeId: 'e8',
      source: 'n8',
      target: 'n11',
      relation: 'prescribes',
      properties: { dosage: '25mg', duration: '6 months' },
      infoId: 'i30',
    },
    {
      edgeId: 'e9',
      source: 'n9',
      target: 'n12',
      relation: 'prescribes',
      properties: { dosage: '500mg', duration: '12 months' },
      infoId: 'i31',
    },
    {
      edgeId: 'e10',
      source: 'n10',
      target: 'n14',
      relation: 'prescribes',
      properties: { usage: 'As needed' },
      infoId: 'i32',
    },

    // --- Patients undergoing tests ---
    {
      edgeId: 'e11',
      source: 'n1',
      target: 'n15',
      relation: 'underwent_test',
      properties: { date: '2024-11-02' },
      infoId: 'i33',
    },
    {
      edgeId: 'e12',
      source: 'n2',
      target: 'n16',
      relation: 'underwent_test',
      properties: { date: '2024-10-25' },
      infoId: 'i34',
    },
    {
      edgeId: 'e13',
      source: 'n3',
      target: 'n18',
      relation: 'underwent_test',
      properties: { date: '2024-09-12' },
      infoId: 'i35',
    },

    // --- Hospital affiliations ---
    {
      edgeId: 'e14',
      source: 'n8',
      target: 'n19',
      relation: 'affiliated_with',
      properties: { since: '2020' },
      infoId: 'i36',
    },
    {
      edgeId: 'e15',
      source: 'n9',
      target: 'n20',
      relation: 'affiliated_with',
      properties: { since: '2019' },
      infoId: 'i37',
    },

    // --- Lifestyle factors impacting patients ---
    {
      edgeId: 'e16',
      source: 'n1',
      target: 'n21',
      relation: 'has_lifestyle_factor',
      properties: { impact: 'Negative' },
      infoId: 'i38',
    },
    {
      edgeId: 'e17',
      source: 'n2',
      target: 'n22',
      relation: 'has_lifestyle_factor',
      properties: { impact: 'Positive' },
      infoId: 'i39',
    },
  ],

  info: Array.from({ length: 39 }, (_, i) => ({
    infoId: `i${i + 1}`,
    summary: `Information node ${i + 1} of the healthcare graph.`,
    metadata: { source: 'test_data', createdBy: 'seed_script' },
    embeddings: [],
    source: 'synthetic_data',
  })),

  createdAt: new Date(),
  updatedAt: new Date(),
};

async function seed() {
  await mongoose.connect(
    'mongodb+srv://gargmishti9_db_user:2fGn3xf8mPig0Ybq@cluster0.jfobjiu.mongodb.net/'
  );
  await KnowledgeGraph.deleteMany({});
  await KnowledgeGraph.create(testGraph);
  console.log('✅ Massive test knowledge graph inserted successfully');
  await mongoose.disconnect();
}

seed();
