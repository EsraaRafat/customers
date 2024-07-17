

// let container = document.getElementById('container');
// async function Customers() {

//      // Correct element selection

    // fetch("http://localhost:3000/transactions")
    // .then (res => res.json())
    // .then(data => {
    //  
    
//     for (let i = 0; i < data.length; i++) {
//         table += `<tr>
//                       <td>${data[i].amount}</td>
//                       <td>${data[i].name}</td>
//                   </tr>`;
//                   console.log(transaction)
//     }
//     container.innerHTML = table;
//     });
    
        // const getApi = await response.json();
        // let customers = getApi.customers;
        // console.log(customers);
       
        
//     } 

// Customers();



//  let table = '';
// async function transaction () {
//     fetch("http://localhost:3000/transactions")
//     .then (res => res.json())
//     .then(data => {
//         for (let i = 0; i < data.length; i++) {
//                     table += `
//                     <thead>
//                      <th>id</th>
//                     <th>customer_id</th>
//                     <th>date</th>
//                     <th>amount</th>
//                     </thead>
//                              <tr>
//                                   <td>${data[i].id}</td>
//                                   <td>${data[i].customer_id}</td>
//                                   <td>${data[i].date}</td>
//                                   <td>${data[i].amount}</td>
//                               </tr>`;
                              
//                 }
//                 container.innerHTML = table;


// });
// }

// transaction ()




// async function customers () {
//     fetch("http://localhost:3000/customers")
//     .then (res => res.json())
//     .then(data => {
//         for (let i = 0; i < data.length; i++) {
//                     table += `
//                     <thead>
//                      <th>id</th>
//                     <th>name</th>
                    
//                     </thead>
//                              <tr>
//                                   <td>${data[i].id}</td>
//                                   <td>${data[i].name}</td>
                                
//                               </tr>`;
                              
//                 }
//                 container.innerHTML = table;


// });
// }

// customers ()


// let table = '';
// const container = document.getElementById('container'); // Ensure there is an element with id 'container' in your HTML

// async function fetchTransactions() {
//     const response = await fetch("http://localhost:3000/transactions");
//     return response.json();
// }

// async function fetchCustomers() {
//     const response = await fetch("http://localhost:3000/customers");
//     return response.json();
// }

// async function displayData() {
//     const transactions = await fetchTransactions();
//     const customers = await fetchCustomers();
    
//     // Create a map of customers by id for easy lookup
//     const customerMap = new Map();
//     customers.forEach(customer => {
//         customerMap.set(customer.id, customer);
//     });
    
//     // Combine data
//     let tableContent = `
//         <thead>
//             <tr>
//                 <th>Transaction ID</th>
//                 <th>Customer ID</th>
//                 <th>Customer Name</th>
//                 <th>Date</th>
//                 <th>Amount</th>
//             </tr>
//         </thead>
//         <tbody>`;
    
//     transactions.forEach(transaction => {
//         const customer = customerMap.get(transaction.customer_id,customers.name);
//         tableContent += `
//             <tr>
//                 <td>${transaction.id}</td>
//                 <td>${transaction.customer_id}</td>
//                 <td>${customer ? customer.name : 'Unknown'}</td>
//                 <td>${transaction.date}</td>
//                 <td>${transaction.amount}</td>
//             </tr>`;
//     });
    
//     tableContent += '</tbody>';
//     container.innerHTML = tableContent;
// }

// displayData();
let transactions = [];
let customers = [];
const container = document.getElementById('container'); // Ensure there is an element with id 'container' in your HTML
const ctx = document.getElementById('transactionChart').getContext('2d');
let transactionChart; // Variable to hold the chart instance

async function fetchTransactions() {
    const response = await fetch("http://localhost:3000/transactions");
    return response.json();
}

async function fetchCustomers() {
    const response = await fetch("http://localhost:3000/customers");
    return response.json();
}

async function loadData() {
    transactions = await fetchTransactions();
    customers = await fetchCustomers();
    displayData();
}

function displayData() {
    const filterName = document.getElementById('filterName').value.toLowerCase();
    const filterAmount = document.getElementById('filterAmount').value;

    // Create a map of customers by id for easy lookup
    const customerMap = new Map();
    customers.forEach(customer => {
        customerMap.set(customer.id, customer.name);
    });
    
    // Filter and combine data
    let tableContent = `
        <table>
            <thead>
                <tr>
                    <th>Transaction ID</th>
                    <th>Customer ID</th>
                    <th>Customer Name</th>
                    <th>Date</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>`;
    
    const filteredTransactions = [];
    
    transactions.forEach(transaction => {
        const customerName = customerMap.get(transaction.customer_id) || '';
        const transactionAmount = transaction.amount;
        
        // Apply filters
        const nameMatches = customerName.toLowerCase().includes(filterName);
        const amountMatches = !filterAmount || transactionAmount == filterAmount;

        if (nameMatches && amountMatches) {
            tableContent += `
                <tr>
                    <td>${transaction.id}</td>
                    <td>${transaction.customer_id}</td>
                    <td>${customerName}</td>
                    <td>${transaction.date}</td>
                    <td>${transaction.amount}</td>
                </tr>`;
            filteredTransactions.push(transaction);
        }
    });
    
    tableContent += '</tbody></table>';
    container.innerHTML = tableContent;

    // Generate the graph
    generateChart(filteredTransactions, customerMap);
}

function generateChart(transactions, customerMap) {
    const filterName = document.getElementById('filterName').value.toLowerCase();

    // Filter transactions by selected customer name
    const filteredTransactions = transactions.filter(transaction => {
        const customerName = customerMap.get(transaction.customer_id) || '';
        return customerName.toLowerCase().includes(filterName);
    });

    // Aggregate transaction amounts by date
    const transactionAmountsByDate = filteredTransactions.reduce((acc, transaction) => {
        const date = transaction.date;
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date] += transaction.amount;
        return acc;
    }, {});

    // Prepare data for the chart
    const labels = Object.keys(transactionAmountsByDate);
    const data = Object.values(transactionAmountsByDate);

    // Destroy the previous chart if it exists
    if (transactionChart) {
        transactionChart.destroy();
    }

    // Create a new chart
    transactionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Transaction Amount',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: true
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initial load
loadData();
