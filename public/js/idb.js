// variable to hold db connection
let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function (event) {
    // save reference to database 
    const db = event.target.result;
    db.createObjectStore('new_budget', { autoIncrement: true });
    };

request.onsuccess = function (e) {
// if db was created successfully with object store, save to global variable
    db = e.target.result;
     // if online, upload any pending records
    if (navigator.onLine) {
        uploadBudget();
        }
    };

request.onerror = function (event) {
    // log error here
    console.log(event.target.errorCode);
    };
  
function uploadBudget() {
    const transaction = db.transaction(['new_budget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_budget');
    const getAll = budgetObjectStore.getAll();
    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
    // if there was data in indexedDB's store, send it to the API server
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(serverResponse => {
            if (serverResponse.message) {
                throw new Error(serverResponse);
            }
            // if saving to server worked, clear pending records
                const transaction = db.transaction(['new_budget'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('new_budget');
                budgetObjectStore.clear();
                alert('Your saved budgets has been submitted!');
            })
            .catch(err => {
            console.log(err);
            });
        }
    };
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

  // listen for online status
  window.addEventListener('online', uploadBudget);

