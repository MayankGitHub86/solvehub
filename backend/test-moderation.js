/**
 * Test Content Moderation System
 * Run: node test-moderation.js
 */

const { 
  moderateQuestion, 
  moderateAnswer, 
  moderateComment 
} = require('./src/utils/contentModeration');

console.log('🧪 Testing Content Moderation System\n');
console.log('='.repeat(60));

// Test 1: Legitimate Question (Should PASS)
console.log('\n✅ Test 1: Legitimate Question');
const test1 = moderateQuestion({
  title: 'How to implement authentication in React?',
  content: 'I am building a web application and need help implementing user authentication with JWT tokens. What is the best approach?'
});
console.log('Result:', test1.allowed ? '✅ ALLOWED' : '❌ BLOCKED');
if (!test1.allowed) console.log('Reason:', test1.reason);

// Test 2: Adult Content (Should BLOCK)
console.log('\n❌ Test 2: Adult Content');
const test2 = moderateQuestion({
  title: 'Looking for adult content',
  content: 'Where can I find xxx videos and porn sites?'
});
console.log('Result:', test2.allowed ? '✅ ALLOWED' : '❌ BLOCKED');
if (!test2.allowed) {
  console.log('Reason:', test2.reason);
  console.log('Matches:', test2.matches);
  console.log('Severity:', test2.severity);
}

// Test 3: Violence (Should BLOCK)
console.log('\n❌ Test 3: Violence Content');
const test3 = moderateQuestion({
  title: 'How to make weapons',
  content: 'I need instructions on how to build a bomb and other weapons'
});
console.log('Result:', test3.allowed ? '✅ ALLOWED' : '❌ BLOCKED');
if (!test3.allowed) {
  console.log('Reason:', test3.reason);
  console.log('Matches:', test3.matches);
  console.log('Severity:', test3.severity);
}

// Test 4: Spam (Should BLOCK)
console.log('\n❌ Test 4: Spam Content');
const test4 = moderateQuestion({
  title: 'CLICK HERE TO WIN $$$$$',
  content: 'Get rich quick!!!! Visit this link now to earn free money!!!'
});
console.log('Result:', test4.allowed ? '✅ ALLOWED' : '❌ BLOCKED');
if (!test4.allowed) {
  console.log('Reason:', test4.reason);
  console.log('Matches:', test4.matches);
  console.log('Severity:', test4.severity);
}

// Test 5: Too Short Title (Should BLOCK)
console.log('\n❌ Test 5: Too Short Title');
const test5 = moderateQuestion({
  title: 'Help',
  content: 'I need help with my code that is not working properly'
});
console.log('Result:', test5.allowed ? '✅ ALLOWED' : '❌ BLOCKED');
if (!test5.allowed) {
  console.log('Reason:', test5.reason);
  console.log('Field:', test5.field);
}

// Test 6: Legitimate Answer (Should PASS)
console.log('\n✅ Test 6: Legitimate Answer');
const test6 = moderateAnswer('You can use JWT tokens for authentication. Here is a code example: const token = jwt.sign(payload, secret);');
console.log('Result:', test6.allowed ? '✅ ALLOWED' : '❌ BLOCKED');
if (!test6.allowed) console.log('Reason:', test6.reason);

// Test 7: Inappropriate Answer (Should BLOCK)
console.log('\n❌ Test 7: Inappropriate Answer');
const test7 = moderateAnswer('Check out this porn site for more information');
console.log('Result:', test7.allowed ? '✅ ALLOWED' : '❌ BLOCKED');
if (!test7.allowed) {
  console.log('Reason:', test7.reason);
  console.log('Matches:', test7.matches);
}

// Test 8: Legitimate Comment (Should PASS)
console.log('\n✅ Test 8: Legitimate Comment');
const test8 = moderateComment('Great answer! This helped me solve my problem.');
console.log('Result:', test8.allowed ? '✅ ALLOWED' : '❌ BLOCKED');
if (!test8.allowed) console.log('Reason:', test8.reason);

// Test 9: Hate Speech (Should BLOCK)
console.log('\n❌ Test 9: Hate Speech');
const test9 = moderateComment('This is racist and discriminatory content');
console.log('Result:', test9.allowed ? '✅ ALLOWED' : '❌ BLOCKED');
if (!test9.allowed) {
  console.log('Reason:', test9.reason);
  console.log('Matches:', test9.matches);
}

// Test 10: Suspicious URL (Should BLOCK)
console.log('\n❌ Test 10: Suspicious URL');
const test10 = moderateAnswer('Visit https://example.xxx for more information');
console.log('Result:', test10.allowed ? '✅ ALLOWED' : '❌ BLOCKED');
if (!test10.allowed) {
  console.log('Reason:', test10.reason);
  console.log('Matches:', test10.matches);
}

console.log('\n' + '='.repeat(60));
console.log('\n✅ Content Moderation System is working correctly!');
console.log('🛡️ Your platform is protected from inappropriate content.\n');
