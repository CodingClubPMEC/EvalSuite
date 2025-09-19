// Test script to verify API connection and saveJuryEvaluation function
const http = require('http');

function testAPI() {
  console.log('🧪 Testing API connection...\n');
  
  // Test 1: Check if server is running
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/events/active',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ API Connection Test Results:');
      console.log('Status Code:', res.statusCode);
      
      if (res.statusCode === 200) {
        try {
          const response = JSON.parse(data);
          console.log('✅ Server is responding correctly');
          console.log('✅ Active event found:', response.success);
          
          if (response.data) {
            console.log('📊 Event Details:');
            console.log('   Title:', response.data.title);
            console.log('   Year:', response.data.year);
            console.log('   Juries:', response.data.juries.length);
            console.log('   Status:', response.data.status);
          }
          
          // Test 2: Test jury evaluation endpoint
          testJuryEvaluation();
          
        } catch (parseError) {
          console.error('❌ Failed to parse response:', parseError.message);
          console.log('Raw response:', data);
        }
      } else {
        console.error('❌ Server returned error status:', res.statusCode);
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Connection failed:', err.message);
    console.log('💡 Make sure the server is running on port 5000');
    console.log('💡 Run: npm start (in the server directory)');
  });

  req.end();
}

function testJuryEvaluation() {
  console.log('\n🧪 Testing Jury Evaluation Endpoint...\n');
  
  const testScores = {
    '1': {
      'Innovation': 20,
      'Feasibility': 15,
      'Presentation': 12,
      'Impact': 18,
      'Technical Quality': 16
    },
    '2': {
      'Innovation': 22,
      'Feasibility': 18,
      'Presentation': 14,
      'Impact': 19,
      'Technical Quality': 17
    }
  };
  
  const postData = JSON.stringify({
    scores: testScores,
    autoSave: false
  });
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/evaluations/jury/1',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Jury Evaluation Test Results:');
      console.log('Status Code:', res.statusCode);
      
      if (res.statusCode === 200) {
        try {
          const response = JSON.parse(data);
          console.log('✅ Jury evaluation saved successfully');
          console.log('Response:', JSON.stringify(response, null, 2));
        } catch (parseError) {
          console.error('❌ Failed to parse evaluation response:', parseError.message);
          console.log('Raw response:', data);
        }
      } else {
        console.error('❌ Evaluation failed with status:', res.statusCode);
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Evaluation request failed:', err.message);
  });

  req.write(postData);
  req.end();
}

// Run the test
testAPI();
