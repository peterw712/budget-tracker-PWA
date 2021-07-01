// variable to hold db connection
let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function (event) {
    // save reference to database 
    const db = event.target.result;
    db.createObjectStore('new_budget', { autoIncrement: true });
  };

request.onsuccess = function(event) {
// if db was created successfully with object store, save to global variable
    db = event.target.result;
    };

request.onerror = function (event) {
    // log error here
    console.log(event.target.errorCode);
  };

// function to be executed if new budget is created offline
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_budget'], 'readwrite');
    // access the object store for the new budget
    const budgetObjectStore = transaction.objectStore('new_budget');
    // add record to the store
    budgetObjectStore.add(record);
  };

