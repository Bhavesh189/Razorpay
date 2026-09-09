import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/ai';

async function runTests() {
  console.log("=== RUNNING ADVANCED STATE MACHINE & ZERO-RANDOM-PRODUCT TESTS ===");

  const testCases = [
    {
      name: "1. Complex Greeting/Identity: 'Hello Bhai kesa hai kya kr skta hai tu?'",
      payload: { query: "Hello Bhai kesa hai kya kr skta hai tu?", history: [] },
      validate: (res) => {
        const text = res.data.reply || res.data.text || '';
        const prodCount = (res.data.products || []).length;
        console.log("Response:", text.slice(0, 120));
        console.log("Products Count:", prodCount);
        return res.data.success && prodCount === 0 && !res.data.questionnaire;
      }
    },
    {
      name: "2. Casual greeting: 'Hello'",
      payload: { query: "Hello", history: [] },
      validate: (res) => {
        const text = res.data.reply || res.data.text || '';
        const prodCount = (res.data.products || []).length;
        console.log("Response:", text);
        console.log("Products Count:", prodCount);
        return res.data.success && prodCount === 0 && !res.data.questionnaire;
      }
    },
    {
      name: "3. General shopping intent: 'I want to buy something'",
      payload: { query: "I want to buy something", history: [] },
      validate: (res) => {
        const text = res.data.reply || res.data.text || '';
        const prodCount = (res.data.products || []).length;
        console.log("Response:", text);
        console.log("Products Count:", prodCount);
        return res.data.success && prodCount === 0 && !res.data.questionnaire && (text.includes("looking to buy") || text.includes("kharidna"));
      }
    },
    {
      name: "4. Scope guard: 'Write a C++ program for binary search'",
      payload: { query: "Write a C++ program for binary search", history: [] },
      validate: (res) => {
        const text = res.data.reply || res.data.text || '';
        const prodCount = (res.data.products || []).length;
        console.log("Response:", text);
        console.log("Products Count:", prodCount);
        return res.data.success && prodCount === 0 && text.includes("shop");
      }
    },
    {
      name: "5. Gibberish / Random letters: 'ulla'",
      payload: { query: "ulla", history: [] },
      validate: (res) => {
        const text = res.data.reply || res.data.text || '';
        const prodCount = (res.data.products || []).length;
        console.log("Response:", text);
        console.log("Products Count:", prodCount);
        return res.data.success && prodCount === 0;
      }
    },
    {
      name: "6. Broad category (Incomplete specs): 'I need a laptop'",
      payload: { query: "I need a laptop", history: [] },
      validate: (res) => {
        const prodCount = (res.data.products || []).length;
        console.log("Questionnaire Title:", res.data.questionnaire?.title);
        console.log("Products Count:", prodCount);
        return res.data.success && prodCount === 0 && res.data.questionnaire && res.data.questionnaire.options.length > 0;
      }
    },
    {
      name: "7. Broad category (Incomplete specs): 'Show me phones'",
      payload: { query: "Show me phones", history: [] },
      validate: (res) => {
        const prodCount = (res.data.products || []).length;
        console.log("Questionnaire Title:", res.data.questionnaire?.title);
        console.log("Products Count:", prodCount);
        return res.data.success && prodCount === 0 && res.data.questionnaire;
      }
    },
    {
      name: "8. Broad category (Incomplete specs): 'I want headphones'",
      payload: { query: "I want headphones", history: [] },
      validate: (res) => {
        const prodCount = (res.data.products || []).length;
        console.log("Questionnaire Title:", res.data.questionnaire?.title);
        console.log("Products Count:", prodCount);
        return res.data.success && prodCount === 0 && res.data.questionnaire && res.data.questionnaire.title.includes("Audio");
      }
    },
    {
      name: "9. Impossible budget: 'Gaming laptop under 5000'",
      payload: { query: "Gaming laptop under 5000", history: [] },
      validate: (res) => {
        const text = res.data.reply || res.data.text || '';
        const prodCount = (res.data.products || []).length;
        console.log("Response:", text);
        console.log("Products Count:", prodCount);
        return res.data.success && prodCount === 0 && text.includes("37,490");
      }
    },
    {
      name: "10. Complete requirements directly: 'Gaming laptop under 90000 with 16GB RAM and RTX 4060'",
      payload: { query: "Gaming laptop under 90000 with 16GB RAM and RTX 4060", history: [] },
      validate: (res) => {
        const text = res.data.reply || res.data.text || '';
        const prodCount = (res.data.products || []).length;
        console.log("Response:", text.slice(0, 100));
        console.log("Products Count:", prodCount);
        if (prodCount > 0) {
          console.log("Top product:", res.data.products[0].title, "| Price: ₹" + res.data.products[0].price);
        }
        return res.data.success && prodCount > 0 && !res.data.questionnaire;
      }
    },
    {
      name: "11. Hinglish category: 'Mujhe laptop chahiye'",
      payload: { query: "Mujhe laptop chahiye", history: [] },
      validate: (res) => {
        const prodCount = (res.data.products || []).length;
        console.log("Questionnaire Title:", res.data.questionnaire?.title);
        console.log("Products Count:", prodCount);
        return res.data.success && prodCount === 0 && res.data.questionnaire;
      }
    },
    {
      name: "12. Structured Requirements Submission (Flexible Budget): Laptop + Gaming + Coding",
      isRequirementsEndpoint: true,
      payload: {
        requirementSessionId: "req-test-123",
        category: "Laptops & Computers",
        requirements: {
          priorities: ["Gaming & High-FPS Esports", "Coding & Software Dev"],
          customRequirements: "",
          budget: null,
          isBudgetActive: false
        },
        history: [{ role: 'user', text: 'Muje Laptop chaiye' }]
      },
      validate: (res) => {
        const text = res.data.reply || res.data.text || '';
        const prodCount = (res.data.products || []).length;
        console.log("Response:", text.slice(0, 120));
        console.log("Products Count:", prodCount);
        if (prodCount > 0) {
          console.log("Top Product:", res.data.products[0].title, "| Price: ₹" + res.data.products[0].price);
        }
        return res.data.success && prodCount > 0 && !text.includes("didn't quite understand");
      }
    },
    {
      name: "13. Structured Requirements Submission (Hard Budget <= ₹80,000)",
      isRequirementsEndpoint: true,
      payload: {
        requirementSessionId: "req-test-124",
        category: "Laptops & Computers",
        requirements: {
          priorities: ["Gaming & High-FPS Esports", "Coding & Software Dev"],
          customRequirements: "",
          budget: 80000,
          isBudgetActive: true
        },
        history: [{ role: 'user', text: 'Muje Laptop chaiye' }]
      },
      validate: (res) => {
        const prodCount = (res.data.products || []).length;
        const allUnder80k = (res.data.products || []).every(p => p.price <= 80000);
        console.log("Products Count:", prodCount, "| All <= ₹80,000:", allUnder80k);
        return res.data.success && prodCount > 0 && allUnder80k;
      }
    },
    {
      name: "14. Multi-turn Category Context in Chat: 'Muje Laptop chaiye' -> 'Gaming & High-FPS Esports, Coding & Software Dev'",
      payload: {
        query: "Gaming & High-FPS Esports, Coding & Software Dev",
        history: [
          { role: 'user', text: 'Muje Laptop chaiye' },
          { role: 'model', text: 'Please select your specifications' }
        ]
      },
      validate: (res) => {
        const text = res.data.reply || res.data.text || '';
        const prodCount = (res.data.products || []).length;
        console.log("Response:", text.slice(0, 120));
        console.log("Products Count:", prodCount);
        return res.data.success && prodCount > 0 && !text.includes("didn't quite understand");
      }
    },
    {
      name: "15. Category Switch in Chat: 'Actually I want a smartphone instead'",
      payload: {
        query: "Actually I want a smartphone instead",
        history: [
          { role: 'user', text: 'I need a laptop' },
          { role: 'model', text: 'Select laptop specifications' }
        ]
      },
      validate: (res) => {
        const prodCount = (res.data.products || []).length;
        console.log("Questionnaire Title:", res.data.questionnaire?.title);
        console.log("Products Count:", prodCount);
        return res.data.success && prodCount === 0 && res.data.questionnaire?.title?.includes("Smartphone");
      }
    }
  ];

  let passed = 0;
  for (const tc of testCases) {
    console.log(`\n--- Test: ${tc.name} ---`);
    try {
      const endpoint = tc.isRequirementsEndpoint ? `${BASE_URL}/requirements` : `${BASE_URL}/chat`;
      const res = await axios.post(endpoint, tc.payload, { timeout: 15000 });
      const ok = tc.validate(res);
      if (ok) {
        console.log(`✅ PASSED: ${tc.name}`);
        passed++;
      } else {
        console.log(`❌ FAILED VALIDATION: ${tc.name}`);
      }
    } catch (err) {
      console.log(`❌ ERROR in ${tc.name}:`, err.message);
    }
  }

  console.log(`\n======================================================`);
  console.log(`FINAL RESULT: ${passed}/${testCases.length} Tests Passed!`);
  console.log(`======================================================\n`);
}

runTests();
