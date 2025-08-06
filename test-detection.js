#!/usr/bin/env node

/**
 * Test Script for StopOpioids Detection System
 * Tests the API with 10 mock medical scenarios (5 positive, 5 negative)
 */

const API_URL = 'http://localhost:3000/api/assess';

// Test cases with expected outcomes
const testCases = [
  // POSITIVE CASES (High risk indicators)
  {
    id: 1,
    type: 'POSITIVE',
    description: 'Clear opioid dependency case',
    input: `Patient: John Doe, 45 years old
    Chief Complaint: Requesting early refill of oxycodone prescription
    History: Patient has been on oxycodone 30mg QID for the past 8 months following back surgery. 
    Reports losing prescription twice in past 3 months. Has visited 3 different doctors in past 2 months.
    Shows signs of withdrawal when medication runs out including sweating, anxiety, and tremors.
    Failed two random urine drug screens showing non-prescribed benzodiazepines.`
  },
  
  {
    id: 2,
    type: 'POSITIVE',
    description: 'Escalating tolerance and doctor shopping',
    input: `Medical Record Review: Sarah Johnson, 38 years old
    Current Medications: Fentanyl patches 75mcg, Percocet 10mg Q4H PRN
    Notes: Patient initially prescribed hydrocodone 5mg post dental surgery 18 months ago.
    Dose escalation noted: hydrocodone -> oxycodone -> current regimen over 12 months.
    Pharmacy records show fills at 4 different pharmacies. 
    Emergency department visits x6 in past 3 months for "severe pain".
    Patient defensive when discussing medication reduction.`
  },
  
  {
    id: 3,
    type: 'POSITIVE',
    description: 'Behavioral red flags with prescription history',
    input: `Consultation Note: Michael Chen, 52 years old
    Referred for pain management evaluation
    History: Chronic lower back pain, multiple surgeries
    Current: Morphine ER 60mg BID, oxycodone 15mg Q6H breakthrough
    Concerning behaviors: Frequently calls for early refills citing various reasons
    Reports medications "not working as well anymore"
    Missed 3 scheduled appointments but shows up for prescription renewals
    Spouse reports patient is isolated, mood changes, sleeping during day
    Previous addiction history with alcohol (10 years sober)`
  },
  
  {
    id: 4,
    type: 'POSITIVE',
    description: 'Post-surgical dependency development',
    input: `Follow-up Visit: Emily Rodriguez, 29 years old
    Post-op Week 16 from ACL reconstruction
    Still requesting oxycodone 10mg despite expected healing timeframe
    Reports 10/10 pain without medication, 6/10 with medication
    Physical therapy notes indicate good progress but patient reports inability to participate without pain meds
    Has obtained prescriptions from urgent care twice when regular doctor unavailable
    Family history significant for substance use disorders (father - alcohol, brother - heroin)
    Patient admits taking "extra doses" when pain is bad`
  },
  
  {
    id: 5,
    type: 'POSITIVE',
    description: 'Multiple risk factors and aberrant behaviors',
    input: `Psychiatric Evaluation: David Thompson, 41 years old
    Chief complaint: Depression and chronic pain
    Medical history: Motor vehicle accident 2 years ago, multiple fractures
    Current meds: OxyContin 40mg BID, Xanax 2mg TID, Soma 350mg QID
    Social: Unemployed since accident, going through divorce
    Substance use: Admits to drinking "occasionally" while on medications
    Behavior: Has been to ER 8 times in 6 months
    Failed pill count at last visit (short by 12 pills)
    Positive cocaine on last UDS, patient claims it was "just once at a party"
    Requests specific medications by name, refuses alternatives`
  },
  
  // NEGATIVE CASES (Low risk indicators)
  {
    id: 6,
    type: 'NEGATIVE',
    description: 'Appropriate post-operative pain management',
    input: `Post-Operative Day 3: Jennifer Martinez, 34 years old
    Procedure: Total hip replacement
    Pain management: Oxycodone 5mg Q6H PRN
    Patient taking medication as prescribed, using ice and elevation
    Plans to transition to NSAIDs by end of week per surgeon's protocol
    No history of substance use, first surgery
    Good family support system, following all post-op instructions
    Patient asking about non-opioid alternatives for next week`
  },
  
  {
    id: 7,
    type: 'NEGATIVE',
    description: 'Acute injury with appropriate response',
    input: `Emergency Department Visit: Robert Taylor, 27 years old
    Chief Complaint: Fractured radius from fall while hiking
    Pain: 7/10 at presentation, improved to 4/10 with immobilization
    Given: Percocet 5mg x10 tablets for acute pain
    Patient expressed concerns about taking opioids due to family history
    Plans to use acetaminophen and ibuprofen primarily
    Will use opioid only for severe pain at night
    No previous opioid prescriptions in medical record`
  },
  
  {
    id: 8,
    type: 'NEGATIVE',
    description: 'Cancer patient with legitimate pain needs',
    input: `Oncology Follow-up: Margaret Wilson, 68 years old
    Diagnosis: Stage IIIB lung cancer, currently on chemotherapy
    Pain Management: Morphine ER 15mg BID, morphine IR 5mg Q4H PRN breakthrough
    Patient uses medication log, typical use 1-2 breakthrough doses daily
    Compliant with all appointments, brings spouse to visits
    Participates in cancer support group
    Using complementary therapies: meditation, gentle yoga
    No aberrant behaviors noted, appropriate affect`
  },
  
  {
    id: 9,
    type: 'NEGATIVE',
    description: 'Chronic pain with good management practices',
    input: `Rheumatology Visit: Barbara Anderson, 55 years old
    Diagnosis: Rheumatoid arthritis, fibromyalgia
    Current regimen: Tramadol 50mg BID, primarily uses NSAIDs
    Has tried and failed multiple non-opioid options
    Attends pain management program, uses CBT techniques
    Physical therapy 2x weekly, aqua therapy 1x weekly
    Medication agreement in place, never requested early refills
    Random drug screens all appropriate x2 years
    Functional improvement noted with current regimen`
  },
  
  {
    id: 10,
    type: 'NEGATIVE',
    description: 'Elderly patient with appropriate palliative care',
    input: `Home Health Visit: George Patterson, 82 years old
    Diagnosis: Severe osteoarthritis, spinal stenosis, CHF
    Current: Hydrocodone 5mg BID for severe pain days only
    Uses about 20 tablets per month (prescribed 60)
    Medications managed by daughter who is a nurse
    Also using: Acetaminophen scheduled, topical lidocaine, heat therapy
    Goal is comfort and maintaining independence
    No cognitive impairment, no signs of misuse
    Regular follow-ups with primary care physician`
  }
];

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Function to call the API
async function testCase(testCase) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}Test Case #${testCase.id}: ${testCase.description}${colors.reset}`);
  console.log(`${colors.blue}Expected: ${testCase.type === 'POSITIVE' ? '⚠️  HIGH RISK' : '✅ LOW RISK'}${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: testCase.input }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    
    process.stdout.write(`${colors.yellow}AI Assessment:${colors.reset}\n`);
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      fullResponse += chunk;
      process.stdout.write(chunk);
    }
    
    // Simple detection of risk level from response
    const hasHighRisk = 
      fullResponse.toLowerCase().includes('high risk') ||
      fullResponse.toLowerCase().includes('significant risk') ||
      fullResponse.toLowerCase().includes('concerning pattern') ||
      fullResponse.toLowerCase().includes('multiple risk factors') ||
      fullResponse.toLowerCase().includes('red flags');
    
    const detected = hasHighRisk ? 'POSITIVE' : 'NEGATIVE';
    const correct = detected === testCase.type;
    
    console.log(`\n\n${colors.bright}Result: ${
      correct 
        ? `${colors.green}✅ CORRECT DETECTION${colors.reset}` 
        : `${colors.red}❌ INCORRECT DETECTION${colors.reset}`
    }${colors.reset}`);
    
    return { testCase: testCase.id, expected: testCase.type, detected, correct };
    
  } catch (error) {
    console.error(`${colors.red}Error testing case ${testCase.id}:${colors.reset}`, error.message);
    return { testCase: testCase.id, expected: testCase.type, detected: 'ERROR', correct: false };
  }
}

// Main test runner
async function runTests() {
  console.log(`${colors.bright}${colors.blue}╔════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}║     StopOpioids Detection System - Test Suite         ║${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}║          Testing 10 Mock Medical Scenarios            ║${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  // Check if server is running
  try {
    await fetch('http://localhost:3000');
  } catch (error) {
    console.error(`${colors.red}${colors.bright}ERROR: Server is not running!${colors.reset}`);
    console.log(`${colors.yellow}Please start the server with: npm run dev${colors.reset}`);
    process.exit(1);
  }
  
  const results = [];
  
  // Run tests sequentially
  for (const tc of testCases) {
    const result = await testCase(tc);
    results.push(result);
    
    // Small delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Print summary
  console.log(`\n${colors.bright}${colors.cyan}════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}                    TEST SUMMARY                        ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}════════════════════════════════════════════════════════${colors.reset}\n`);
  
  const correct = results.filter(r => r.correct).length;
  const incorrect = results.filter(r => !r.correct).length;
  const accuracy = (correct / results.length * 100).toFixed(1);
  
  console.log(`${colors.bright}Total Tests: ${results.length}${colors.reset}`);
  console.log(`${colors.green}Correct: ${correct}${colors.reset}`);
  console.log(`${colors.red}Incorrect: ${incorrect}${colors.reset}`);
  console.log(`${colors.bright}Accuracy: ${accuracy}%${colors.reset}\n`);
  
  // Detailed results table
  console.log(`${colors.bright}Detailed Results:${colors.reset}`);
  console.log('┌──────┬──────────┬──────────┬───────────┐');
  console.log('│ Test │ Expected │ Detected │  Result   │');
  console.log('├──────┼──────────┼──────────┼───────────┤');
  
  results.forEach(r => {
    const resultSymbol = r.correct ? `${colors.green}✅ Pass${colors.reset}` : `${colors.red}❌ Fail${colors.reset}`;
    console.log(`│  ${String(r.testCase).padEnd(3)} │ ${r.expected.padEnd(8)} │ ${r.detected.padEnd(8)} │ ${resultSymbol}    │`);
  });
  
  console.log('└──────┴──────────┴──────────┴───────────┘');
  
  // Final verdict
  console.log(`\n${colors.bright}${colors.cyan}════════════════════════════════════════════════════════${colors.reset}`);
  if (accuracy >= 80) {
    console.log(`${colors.green}${colors.bright}✅ SYSTEM PERFORMING WELL (${accuracy}% accuracy)${colors.reset}`);
  } else if (accuracy >= 60) {
    console.log(`${colors.yellow}${colors.bright}⚠️  SYSTEM NEEDS IMPROVEMENT (${accuracy}% accuracy)${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bright}❌ SYSTEM PERFORMING POORLY (${accuracy}% accuracy)${colors.reset}`);
  }
  console.log(`${colors.bright}${colors.cyan}════════════════════════════════════════════════════════${colors.reset}\n`);
}

// Run the tests
runTests().catch(console.error);