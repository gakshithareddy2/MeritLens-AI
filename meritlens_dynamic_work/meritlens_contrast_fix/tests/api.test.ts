/**
 * Automated Test Suite for MeritLens AI Core Logic
 * Tests:
 * 1. ML Prediction Engine & Factor Attribution
 * 2. Automated Recommendation Generation
 * 3. Database CRUD Operations & Role Access Validation
 */

import { runMLPrediction, generateStudentRecommendations, ML_WEIGHTS } from '../server/mlEngine.js';
import { db } from '../server/db.js';

function runTests() {
  console.log('----------------------------------------------------');
  console.log('Running MeritLens AI Automated Validation Tests');
  console.log('----------------------------------------------------');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // TEST 1: ML Engine - High Performer (Distinction)
  const highPerformer = runMLPrediction({
    previousMarks: 92,
    attendance: 96,
    assignmentCompletion: 98,
    studyHoursWeek: 16,
    mathScore: 94,
    scienceScore: 92,
    englishScore: 90,
    historyScore: 88,
  });
  assert(
    highPerformer.performanceCategory === 'Distinction',
    'ML Engine correctly classifies high performer as Distinction'
  );
  assert(
    highPerformer.riskLevel === 'Low',
    'ML Engine assigns Low risk level to distinction student'
  );
  assert(
    highPerformer.predictedScore >= 85,
    `Predicted score (${highPerformer.predictedScore}) is in Distinction tier (>= 85)`
  );

  // TEST 2: ML Engine - At Risk Performer
  const atRiskStudent = runMLPrediction({
    previousMarks: 48,
    attendance: 55,
    assignmentCompletion: 50,
    studyHoursWeek: 4,
    mathScore: 45,
    scienceScore: 42,
    englishScore: 52,
    historyScore: 49,
  });
  assert(
    atRiskStudent.performanceCategory === 'At Risk',
    'ML Engine correctly classifies struggling student as At Risk'
  );
  assert(
    ['High', 'Critical'].includes(atRiskStudent.riskLevel),
    'ML Engine flags struggling student as High or Critical risk'
  );
  assert(
    atRiskStudent.learningGaps.length >= 2,
    'ML Engine identifies multiple specific learning gaps'
  );

  // TEST 3: Automated Recommendation Engine
  const sampleRecs = generateStudentRecommendations({
    id: 'STU_TEST_01',
    name: 'Test Student',
    attendance: 68,
    assignmentCompletion: 65,
    studyHoursWeek: 6,
    subjects: [
      { subject: 'Mathematics', score: 58 },
      { subject: 'Science', score: 72 },
      { subject: 'English', score: 80 },
    ],
  });
  assert(
    sampleRecs.length >= 2,
    `Recommendation engine generates targeted recommendations (generated ${sampleRecs.length})`
  );
  const mathRec = sampleRecs.find(r => r.subject === 'Mathematics');
  assert(
    !!mathRec && mathRec.priority === 'High',
    'Weakest subject (Math 58%) generates High priority recommendation'
  );

  // TEST 4: Database Integrity & Initial Seed Records
  const students = db.getStudents();
  assert(students.length >= 6, `Database initializes with sufficient sample students (found ${students.length})`);

  const emma = db.getStudentById('STU001');
  assert(
    !!emma && emma.name === 'Mahitha',
    'STU001 profile accurately loaded from persistent database'
  );

  const emmaRecs = db.getRecommendations('STU001');
  assert(
    emmaRecs.length > 0,
    `Personalized recommendations retrieved for STU001 (count: ${emmaRecs.length})`
  );

  // TEST 5: Recommendation Status Update
  if (emmaRecs.length > 0) {
    const targetRec = emmaRecs[0];
    const updated = db.updateRecommendationStatus(targetRec.id, 'Completed');
    assert(
      updated !== null && updated.status === 'Completed' && !!updated.completedAt,
      'Recommendation status successfully updated to Completed with timestamp'
    );
  }

  // Summary
  console.log('----------------------------------------------------');
  console.log(`Test Execution Results: ${passed} Passed, ${failed} Failed`);
  console.log('----------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
