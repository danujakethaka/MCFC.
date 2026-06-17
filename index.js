let customers = JSON.parse(localStorage.getItem('mcfc_customers')) || [];
let memberships = JSON.parse(localStorage.getItem('mcfc_memberships')) || [];

window.onload = function() {
    const rememberMe = localStorage.getItem('mcfc_remember_me');
    if (rememberMe === 'true') {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-system').style.display = 'block';
        initSystem();
    }
};

// Authentication & Remember Me
function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    const isRememberChecked = document.getElementById('login-remember').checked;
    const errorDiv = document.getElementById('login-error');

    if (["Sanjeewa@mcfc.com", "Nadeera@mcfc.com"].includes(email) && pass === "mcfc@123") {
        if (isRememberChecked) localStorage.setItem('mcfc_remember_me', 'true');
        else localStorage.removeItem('mcfc_remember_me');
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-system').style.display = 'block';
        initSystem();
    } else { errorDiv.style.display = 'block'; }
}

function handleLogout() {
    localStorage.removeItem('mcfc_remember_me');
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('main-system').style.display = 'none';
    document.getElementById('login-pass').value = '';
    document.getElementById('login-remember').checked = false;
}

// Navigation Views
function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-links button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view-${viewName}`).classList.add('active');
    document.getElementById(`nav-${viewName}`).classList.add('active');
    if(viewName === 'dashboard') updateDashboard();
    if(viewName === 'memberships') renderMemberships(memberships);
}

// Auto End-Date Generation
function calculateEndDate() {
    const startDateVal = document.getElementById('mem-start-date').value;
    const type = document.getElementById('mem-type').value;
    const endDateInput = document.getElementById('mem-end-date');
    if (!startDateVal || !type) return;
    let startDate = new Date(startDateVal);
    if (type === "Month") startDate.setMonth(startDate.getMonth() + 1);
    else if (type === "3 months") startDate.setMonth(startDate.getMonth() + 3);
    else if (type === "6 months") startDate.setMonth(startDate.getMonth() + 6);
    else if (type === "Annual") startDate.setFullYear(startDate.getFullYear() + 1);
    endDateInput.value = startDate.toISOString().split('T')[0];
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { 
    document.getElementById(id).style.display = 'none'; 
    if(id === 'customerModal') document.getElementById('customerForm').reset();
    if(id === 'membershipModal') document.getElementById('membershipForm').reset();
}

function openCustomerModal() {
    document.getElementById('cust-modal-title').innerText = "Add Customer";
    document.getElementById('cust-btn-text').innerText = "Save Customer";
    document.getElementById('cust-edit-id').value = "";
    openModal('customerModal');
}

function openMembershipModal() {
    document.getElementById('mem-modal-title').innerText = "Add Membership";
    document.getElementById('mem-btn-text').innerText = "Save Membership";
    document.getElementById('mem-edit-id').value = "";
    document.getElementById('mem-search-group').style.display = "block";
    document.getElementById('mem-edit-name-display').style.display = "none";
    document.getElementById('mem-cust-search-input').required = true;
    openModal('membershipModal');
}

function previewImage(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) { document.getElementById('cust-photo-base64').value = e.target.result; }
        reader.readAsDataURL(file);
    }
}

// Customer Operations
function saveCustomer(e) {
    e.preventDefault();
    const editId = document.getElementById('cust-edit-id').value;
    const photoBase64 = document.getElementById('cust-photo-base64').value;

    const customerData = {
        fname: document.getElementById('cust-fname').value,
        lname: document.getElementById('cust-lname').value,
        dob: document.getElementById('cust-dob').value,
        gender: document.getElementById('cust-gender').value,
        email: document.getElementById('cust-email').value,
        phone: document.getElementById('cust-phone').value,
        whatsapp: document.getElementById('cust-whatsapp').value,
        occupation: document.getElementById('cust-occupation').value,
        city: document.getElementById('cust-city').value,
    };

    if (editId) {
        let index = customers.findIndex(c => c.id === editId);
        customers[index] = { ...customers[index], ...customerData, photo: photoBase64 ? photoBase64 : customers[index].photo };
        
        memberships.forEach(m => {
            if(m.customerUniqueId === editId) {
                m.customerName = `${customerData.fname} ${customerData.lname}`;
                m.customerPhoto = photoBase64 ? photoBase64 : m.customerPhoto;
            }
        });
        localStorage.setItem('mcfc_memberships', JSON.stringify(memberships));
    } else {
        const newCust = {
            id: 'CUST-' + Math.floor(1000 + Math.random() * 9000),
            ...customerData,
            photo: photoBase64 || '',
            dateAdded: new Date().toISOString().split('T')[0]
        };
        customers.push(newCust);
    }
    localStorage.setItem('mcfc_customers', JSON.stringify(customers));
    closeModal('customerModal');
    renderCustomers(customers);
    renderMemberships(memberships);
}

function editCustomer(id) {
    const c = customers.find(cust => cust.id === id);
    if (!c) return;
    document.getElementById('cust-modal-title').innerText = "Edit Customer Details";
    document.getElementById('cust-btn-text').innerText = "Update Customer";
    document.getElementById('cust-edit-id').value = c.id;
    document.getElementById('cust-fname').value = c.fname;
    document.getElementById('cust-lname').value = c.lname;
    document.getElementById('cust-dob').value = c.dob;
    document.getElementById('cust-gender').value = c.gender;
    document.getElementById('cust-email').value = c.email;
    document.getElementById('cust-phone').value = c.phone;
    document.getElementById('cust-whatsapp').value = c.whatsapp;
    document.getElementById('cust-occupation').value = c.occupation;
    document.getElementById('cust-city').value = c.city;
    document.getElementById('cust-photo-base64').value = c.photo || '';
    openModal('customerModal');
}

function deleteCustomer(id) {
    if (confirm("Are you sure you want to delete this customer?")) {
        customers = customers.filter(c => c.id !== id);
        localStorage.setItem('mcfc_customers', JSON.stringify(customers));
        renderCustomers(customers);
    }
}

function renderCustomers(list) {
    const container = document.getElementById('customer-list-container');
    container.innerHTML = '';
    list.forEach(c => {
        const imgTag = c.photo ? `<img src="${c.photo}">` : `<img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='gray'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>">`;
        container.innerHTML += `
            <div class="data-card">
                ${imgTag}
                <div class="card-details">
                    <h4>${c.fname} ${c.lname}</h4>
                    <p><span>ID:</span> ${c.id} | <span>Added:</span> ${c.dateAdded}</p>
                    <p><span>Phone:</span> ${c.phone}</p>
                    <p><span>WhatsApp:</span> ${c.whatsapp || 'N/A'}</p>
                    <p><span>Email:</span> ${c.email || 'N/A'}</p>
                    <p><span>City:</span> ${c.city || 'N/A'}</p>
                    <div class="card-actions">
                        <button class="btn-sm btn-edit" onclick="editCustomer('${c.id}')">Edit</button>
                        <button class="btn-sm btn-delete" onclick="deleteCustomer('${c.id}')">Delete</button>
                    </div>
                </div>
            </div>`;
    });
}

function filterCustomers() {
    const nameQ = document.getElementById('search-cust-name').value.toLowerCase();
    const phoneQ = document.getElementById('search-cust-phone').value;
    const filtered = customers.filter(c => (`${c.fname} ${c.lname}`.toLowerCase().includes(nameQ)) && (c.phone.includes(phoneQ)));
    renderCustomers(filtered);
}

// Live Lookup For Membership Select
function searchCustomerForMembership(val) {
    const box = document.getElementById('search-suggestions');
    if (val.length < 1) { box.style.display = 'none'; return; }
    const matches = customers.filter(c => `${c.fname} ${c.lname}`.toLowerCase().includes(val.toLowerCase()) || c.phone.includes(val));
    if(matches.length > 0) {
        box.innerHTML = '';
        matches.forEach(c => {
            box.innerHTML += `<div class="search-item" onclick="selectCustomerForMembership('${c.id}', '${c.fname} ${c.lname} (${c.phone})')">${c.fname} ${c.lname} - ${c.phone}</div>`;
        });
        box.style.display = 'block';
    } else { box.style.display = 'none'; }
}

function selectCustomerForMembership(id, text) {
    document.getElementById('mem-cust-search-input').value = text;
    document.getElementById('mem-selected-cust-id').value = id;
    document.getElementById('search-suggestions').style.display = 'none';
}

// Membership Save (Calculates & Updates/Overwrites Old records)
function saveMembership(e) {
    e.preventDefault();
    const editId = document.getElementById('mem-edit-id').value;

    if (editId) {
        let index = memberships.findIndex(m => m.id == editId);
        if (index !== -1) {
            memberships[index].type = document.getElementById('mem-type').value;
            memberships[index].startDate = document.getElementById('mem-start-date').value;
            memberships[index].endDate = document.getElementById('mem-end-date').value;
            memberships[index].amount = parseFloat(document.getElementById('mem-amount').value);
            memberships[index].payment = document.getElementById('mem-payment').value;
            memberships[index].notes = document.getElementById('mem-notes').value;
        }
    } else {
        const custId = document.getElementById('mem-selected-cust-id').value;
        const customer = customers.find(c => c.id === custId);
        if(!customer) { alert("Please select a valid customer from search!"); return; }

        // OVERWRITE LOGIC: Me customer gema kalin memberships thiyenawa nam ewa remove karala dagnnawa.
        memberships = memberships.filter(m => m.customerUniqueId !== customer.id);

        const newMem = {
            id: 'MEM-' + Math.floor(1000 + Math.random() * 9000),
            customerUniqueId: customer.id,
            customerName: `${customer.fname} ${customer.lname}`,
            customerPhoto: customer.photo || '',
            customerPhone: customer.phone, 
            type: document.getElementById('mem-type').value,
            startDate: document.getElementById('mem-start-date').value,
            endDate: document.getElementById('mem-end-date').value,
            amount: parseFloat(document.getElementById('mem-amount').value),
            payment: document.getElementById('mem-payment').value,
            notes: document.getElementById('mem-notes').value,
            dateAdded: new Date().toISOString().split('T')[0]
        };
        memberships.push(newMem);
    }
    localStorage.setItem('mcfc_memberships', JSON.stringify(memberships));
    closeModal('membershipModal');
    renderMemberships(memberships);
}

function editMembership(id) {
    const m = memberships.find(mem => mem.id === id);
    if (!m) return;
    document.getElementById('mem-modal-title').innerText = "Edit Membership Details";
    document.getElementById('mem-btn-text').innerText = "Update Membership";
    document.getElementById('mem-edit-id').value = m.id;
    
    document.getElementById('mem-search-group').style.display = "none";
    document.getElementById('mem-cust-search-input').required = false;
    document.getElementById('mem-edit-name-display').style.display = "block";
    document.getElementById('mem-readonly-name').value = m.customerName;

    document.getElementById('mem-type').value = m.type;
    document.getElementById('mem-start-date').value = m.startDate;
    document.getElementById('mem-end-date').value = m.endDate;
    document.getElementById('mem-amount').value = m.amount;
    document.getElementById('mem-payment').value = m.payment;
    document.getElementById('mem-notes').value = m.notes || '';
    openModal('membershipModal');
}

function deleteMembership(id) {
    if (confirm("Are you sure you want to delete this membership record?")) {
        memberships = memberships.filter(m => m.id !== id);
        localStorage.setItem('mcfc_memberships', JSON.stringify(memberships));
        renderMemberships(memberships);
    }
}

// WhatsApp Intent Dispatcher
function sendRenewMessage(id) {
    const m = memberships.find(mem => mem.id === id);
    if(!m) return;

    const customer = customers.find(c => c.id === m.customerUniqueId);
    const targetPhone = customer && customer.whatsapp ? customer.whatsapp : (m.customerPhone || '');
    
    // Custom message block template
    const message = `Hello ${m.customerName},\n\nYour Muscle Choice Fitness Center membership (${m.type}) has expired on ${m.endDate}.\n\nPlease visit the gym center to renew your membership.\nThank you!`;
    const encodedMessage = encodeURIComponent(message);
    
    // Links out to WhatsApp web/app natively
    window.open(`https://wa.me/${targetPhone}?text=${encodedMessage}`, '_blank');
}

function renderMemberships(list) {
    const container = document.getElementById('membership-list-container');
    container.innerHTML = '';
    
    const todayStr = new Date().toISOString().split('T')[0];

    list.forEach(m => {
        const isExpired = m.endDate < todayStr;
        const statusBadge = isExpired 
            ? `<span style="color: #ff4d4d; font-weight: bold;">[EXPIRED]</span>` 
            : `<span style="color: #4ade80; font-weight: bold;">[ACTIVE]</span>`;

        const imgTag = m.customerPhoto ? `<img src="${m.customerPhoto}">` : `<img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='gray'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>">`;
        
        // Conditionally inject "Send Renew Message" button when membership is expired
        const whatsappBtn = isExpired 
            ? `<button class="btn-sm btn-whatsapp" onclick="sendRenewMessage('${m.id}')">Send Renew Message</button>` 
            : '';

        container.innerHTML += `
            <div class="data-card" style="${isExpired ? 'border-color: var(--danger-color);' : ''}">
                ${imgTag}
                <div class="card-details">
                    <h4 class="blue-title">${m.customerName} ${statusBadge}</h4>
                    <p><span>Mem ID:</span> ${m.id} | <span>Cust ID:</span> ${m.customerUniqueId}</p>
                    <p><span>Type:</span> <b>${m.type}</b></p>
                    <p><span>Duration:</span> ${m.startDate} <b>to</b> ${m.endDate}</p>
                    <p><span>Amount:</span> LKR ${m.amount.toLocaleString()} (${m.payment})</p>
                    <p><span>Notes:</span> ${m.notes || 'None'}</p>
                    <div class="card-actions">
                        <button class="btn-sm btn-edit" onclick="editMembership('${m.id}')">Edit</button>
                        <button class="btn-sm btn-delete" onclick="deleteMembership('${m.id}')">Delete</button>
                        ${whatsappBtn}
                    </div>
                </div>
            </div>`;
    });
}

// Date Range Filtering
function filterMembershipsByDate() {
    const startVal = document.getElementById('filter-mem-start').value;
    const endVal = document.getElementById('filter-mem-end').value;
    
    if(!startVal || !endVal) {
        alert("Please select both Start and End dates to filter!");
        return;
    }

    const filtered = memberships.filter(m => m.startDate >= startVal && m.endDate <= endVal);
    renderMemberships(filtered);
}

function filterExpiredMemberships() {
    const todayStr = new Date().toISOString().split('T')[0];
    const filtered = memberships.filter(m => m.endDate < todayStr);
    renderMemberships(filtered);
}

// Live Dashboard Engine Counters
function updateDashboard() {
    const todayStr = new Date().toISOString().split('T')[0];
    const thisMonthPrefix = todayStr.substring(0, 7);

    const todayCust = customers.filter(c => c.dateAdded === todayStr).length;
    const monthCust = customers.filter(c => c.dateAdded && c.dateAdded.startsWith(thisMonthPrefix)).length;

    let todayMemCount = 0;
    let todayRevSum = 0;
    let monthMemCount = 0;
    let monthRevSum = 0;

    memberships.forEach(m => {
        if(m.dateAdded === todayStr) {
            todayMemCount++;
            todayRevSum += m.amount;
        }
        if(m.dateAdded && m.dateAdded.startsWith(thisMonthPrefix)) {
            monthMemCount++;
            monthRevSum += m.amount;
        }
    });

    document.getElementById('dash-today-cust').innerText = todayCust;
    document.getElementById('dash-today-mem').innerText = todayMemCount;
    document.getElementById('dash-today-rev').innerText = todayRevSum.toLocaleString();

    document.getElementById('dash-month-cust').innerText = monthCust;
    document.getElementById('dash-month-mem').innerText = monthMemCount;
    document.getElementById('dash-month-rev').innerText = monthRevSum.toLocaleString();

    document.getElementById('dash-total-cust').innerText = customers.length;
    document.getElementById('dash-total-mem').innerText = memberships.length;
}

// System Init
function initSystem() {
    renderCustomers(customers);
    renderMemberships(memberships);
    updateDashboard();
}