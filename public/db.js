let db;
// create a new db request for a "budget" database.
let request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  // create object store called "pending" and set autoIncrement to true
  const request = window.indexedDB.open("budgetApp", 1);
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
  let db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(request.error);
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  let transaction = db
    .transaction("pending", "readwrite")
    .objectStore("pending");

  // access your pending object store
  // add record to your store with add method.
  transaction.add(record);
}

function checkDatabase() {
  // open a transaction on your pending db
  let transaction = db
    .transaction("pending", "readwrite")
    .objectStore("pending");
  // access your pending object store
  // get all records from store and set to a variable
  const allRecords = transaction.getAll();

  allRecords.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          // if successful, open a transaction on your pending db
          let transaction = db
            .transaction("pending", "readwrite")
            .objectStore("pending");
          // access your pending object store
          // clear all items in your store
          transaction.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
