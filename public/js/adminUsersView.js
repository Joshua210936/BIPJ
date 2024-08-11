document.addEventListener('DOMContentLoaded', () => {
    const customersTable = document.getElementById('customersTable');
    const customerProfileContent = document.getElementById('customerProfileContent');
    const customerModal = document.getElementById('customerModal');
    const searchInput = document.querySelector('.search-input');
    let allCustomers = [];

    async function fetchCustomers() {
        try {
            const response = await fetch('/customers');
            if (response.ok) {
                const customers = await response.json();
                allCustomers = customers;
                renderCustomers(customers);
            } else {
                console.error('Failed to fetch customers:', await response.text());
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    }

    function renderCustomers(customers) {
        customersTable.innerHTML = '';
        customers.forEach(customer => {
            customersTable.appendChild(createCustomerRow(customer));
        });
    }

    function createCustomerRow(customer) {
        const tr = document.createElement('tr');
        tr.classList.add('customer-row');
        tr.dataset.customerName = `${customer.customer_fName || ''} ${customer.customer_lName || ''}`.toLowerCase();
        tr.id = `customerRow${customer.Customer_id}`;
        tr.innerHTML = `
            <td><a href="#" class="customer-name" data-customer-id="${customer.Customer_id}">${customer.Customer_fName || 'N/A'} ${customer.Customer_lName || 'N/A'}</a></td>
            <td>${customer.Customer_Email || 'N/A'}</td>
            <td>
                <button class="delete-button" data-customer-id="${customer.Customer_id}">Delete</button>
            </td>
        `;
        return tr;
    }

    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('customer-name')) {
            event.preventDefault();
            const customerId = event.target.dataset.customerId;
            try {
                const response = await fetch(`/getCustomer/${customerId}`);
                if (response.ok) {
                    const customer = await response.json();
                    customerProfileContent.innerHTML = `
                        <p><strong>Name:</strong> ${customer.Customer_fName || 'N/A'} ${customer.Customer_lName || 'N/A'}</p>
                        <p><strong>Email:</strong> ${customer.Customer_Email || 'N/A'}</p>
                        <p><strong>Phone Number:</strong> ${customer.Customer_Phone || 'N/A'}</p>
                    `;
                    customerModal.style.display = "block";
                } else {
                    console.error('Failed to fetch customer details:', await response.text());
                }
            } catch (error) {
                console.error('Error fetching customer details:', error);
            }
        }
    });

    document.querySelector('.close').onclick = function() {
        customerModal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target === customerModal) {
            customerModal.style.display = "none";
        }
    };

    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-button')) {
            event.preventDefault();
            const customerId = event.target.dataset.customerId;
            if (confirm('Are you sure you want to delete this customer?')) {
                try {
                    const response = await fetch(`/adminDeleteCustomer/${customerId}`, {
                        method: 'DELETE'
                    });
                    const result = await response.json();
                    if (response.ok) {
                        console.log(result.message);
                        await fetchCustomers();
                    } else {
                        console.error('Failed to delete customer:', result.message);
                    }
                } catch (error) {
                    console.error('Error deleting customer:', error);
                }
            }
        }
    });

    function filterCustomers() {
        const query = searchInput.value.toLowerCase();
        const filteredCustomers = allCustomers.filter(customer => 
            (`${customer.Customer_fName || ''} ${customer.Customer_lName || ''}`.toLowerCase().includes(query))
        );
        renderCustomers(filteredCustomers);
    }

    searchInput.addEventListener('input', filterCustomers);

    fetchCustomers();
});
