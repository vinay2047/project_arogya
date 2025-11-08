const mongoose = require('mongoose');
const KnowledgeGraph = require('./models/KnowledgeGraph');

const testGraph = {
  userId: new mongoose.Types.ObjectId('6730cc40a17e3a394d889fa1'),
  graphId: 'graph_1731125000_demo01',
  summary:
    'This knowledge graph represents a patient with a mild heart condition diagnosed by a cardiologist and treated with medication.',

  nodes: [
    {
      nodeId: 'n1',
      label: 'Patient',
      properties: { name: 'John Doe', age: 47, gender: 'Male' },
      infoId: 'i1',
    },
    {
      nodeId: 'n2',
      label: 'Condition',
      properties: { name: 'Mitral Valve Prolapse', severity: 'Mild' },
      infoId: 'i2',
    },
    {
      nodeId: 'n3',
      label: 'Doctor',
      properties: { name: 'Dr. Priya Sharma', specialization: 'Cardiology' },
      infoId: 'i3',
    },
    {
      nodeId: 'n4',
      label: 'Medication',
      properties: {
        name: 'Metoprolol',
        dosage: '25mg',
        frequency: 'Twice daily',
      },
      infoId: 'i4',
    },
  ],

  edges: [
    {
      edgeId: 'e1',
      source: 'n1',
      target: 'n2',
      relation: 'diagnosed_with',
      properties: { confidence: 0.96 },
      infoId: 'i6',
    },
    {
      edgeId: 'e2',
      source: 'n3',
      target: 'n2',
      relation: 'treats',
      properties: { since: '2024-11-06' },
      infoId: 'i7',
    },
    {
      edgeId: 'e3',
      source: 'n3',
      target: 'n4',
      relation: 'prescribes',
      properties: { confidence: 0.9 },
      infoId: 'i8',
    },
  ],

  info: [
    {
      infoId: 'i1',
      summary: 'Node representing patient John Doe.',
      metadata: {},
      embeddings: [],
      source: 'test_data',
    },
    {
      infoId: 'i2',
      summary: 'Node representing condition MVP.',
      metadata: {},
      embeddings: [],
      source: 'test_data',
    },
    {
      infoId: 'i3',
      summary: 'Doctor node representing Dr. Priya Sharma.',
      metadata: {},
      embeddings: [],
      source: 'test_data',
    },
  ],

  createdAt: new Date(),
  updatedAt: new Date(),
};

async function seed() {
  await mongoose.connect(
    'mongodb+srv://gargmishti9_db_user:2fGn3xf8mPig0Ybq@cluster0.jfobjiu.mongodb.net/'
  );
  await KnowledgeGraph.deleteMany({}); // optional cleanup
  await KnowledgeGraph.create(testGraph);
  console.log('✅ Test knowledge graph inserted');
  await mongoose.disconnect();
}

seed();
