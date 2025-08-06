#!/usr/bin/env node

// Quick test to verify the API is working
const API_URL = 'http://localhost:3000/api/assess';

async function quickTest() {
  const testCases = [
    {
      name: "High Risk Case",
      text: "Patient requesting early oxycodone refills, shows withdrawal symptoms, failed drug screen"
    },
    {
      name: "Low Risk Case", 
      text: "Post-surgery day 2, using ice therapy, planning to switch to ibuprofen soon"
    }
  ];

  console.log("🧪 Quick API Test\n");
  
  for (const test of testCases) {
    console.log(`Testing: ${test.name}`);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: test.text })
      });
      
      if (response.ok) {
        const text = await response.text();
        const hasRisk = text.toLowerCase().includes('high risk') || 
                       text.toLowerCase().includes('significant risk');
        console.log(`✅ Response received - Risk detected: ${hasRisk ? 'YES' : 'NO'}\n`);
      } else {
        console.log(`❌ Error: ${response.status}\n`);
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}\n`);
    }
  }
}

quickTest();