// Almacenamiento de datos (simulando una base de datos)
let clients = JSON.parse(localStorage.getItem('gym-clients')) || [];
let memberships = JSON.parse(localStorage.getItem('gym-memberships')) || [
    { id: 1, name: "Plan 8 Clases", price: 20000, credits: 8, duration: 30 },
    { id: 2, name: "Plan 12 Clases", price: 28000, credits: 12, duration: 30 },
    { id: 3, name: "Mensual Ilimitado", price: 35000, credits: 999, duration: 30 }
];
let attendance = JSON.parse(localStorage.getItem('gym-attendance')) || [];
let payments = JSON.parse(localStorage.getItem('gym-payments')) || [];

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    renderClients();
    renderMemberships();
    renderAttendance();
    populateMembershipDropdowns();
    
    // Event Listeners para formularios
    document.getElementById('add-client-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addClient();
    });
    
    document.getElementById('add-membership-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addMembership();
    });
    
    document.getElementById('add-payment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addPayment();
    });
    
    // Abrir la pestaña de clientes por defecto
    document.getElementById('clientes-tab').classList.add('active');
});

// Funciones para manejar las pestañas
function openTab(event, tabId) {
    // Ocultar todas las pestañas
    let tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    // Mostrar la pestaña seleccionada
    document.getElementById(tabId).classList.add('active');
    
    // Cambiar la clase activa en los botones de navegación
    let navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    if (event) {
        event.currentTarget.classList.add('active');
    }
}

// Funciones para manejar modales
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Función para poblar los dropdowns de membresías
function populateMembershipDropdowns(specificDropdownId) {
    const dropdowns = specificDropdownId 
        ? [document.getElementById(specificDropdownId)] 
        : [
            document.getElementById('client-membership'),
            document.getElementById('payment-membership')
        ];
    
    dropdowns.forEach(dropdown => {
        if (dropdown) {
            dropdown.innerHTML = '';
            
            memberships.forEach(membership => {
                const option = document.createElement('option');
                option.value = membership.id;
                option.textContent = `${membership.name} - $${membership.price.toLocaleString()}`;
                dropdown.appendChild(option);
            });
        }
    });
}

// Función para obtener el nombre de la membresía por ID
function getMembershipName(id) {
    const membership = memberships.find(m => m.id === id);
    return membership ? membership.name : 'N/A';
}

// CRUD para Clientes
function renderClients() {
    const clientsList = document.getElementById('clients-list');
    clientsList.innerHTML = '';
    
    clients.forEach(client => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${client.id}</td>
            <td>${client.name}</td>
            <td>${client.email}</td>
            <td>${client.phone}</td>
            <td>${getMembershipName(client.membershipId)}</td>
            <td>${client.credits}</td>
            <td>
                <button class="btn btn-success" onclick="openPaymentModal(${client.id})">Pago</button>
                <button class="btn" onclick="editClient(${client.id})">Editar</button>
                <button class="btn btn-danger" onclick="deleteClient(${client.id})">Eliminar</button>
            </td>
        `;
        clientsList.appendChild(tr);
    });
}

function addClient() {
    const name = document.getElementById('client-name').value;
    const email = document.getElementById('client-email').value;
    const phone = document.getElementById('client-phone').value;
    const membershipId = parseInt(document.getElementById('client-membership').value);
    
    // Encontrar el ID más alto actual y sumar 1
    const maxId = clients.length > 0 ? Math.max(...clients.map(client => client.id)) : 0;
    
    // Crear nuevo cliente
    const newClient = {
        id: maxId + 1,
        name: name,
        email: email,
        phone: phone,
        membershipId: membershipId,
        credits: 0, // Se establecerá al hacer un pago
        joinDate: new Date().toISOString()
    };
    
    clients.push(newClient);
    localStorage.setItem('gym-clients', JSON.stringify(clients));
    
    renderClients();
    closeModal('modal-add-client');
    document.getElementById('add-client-form').reset();
}

function editClient(id) {
    // Implementar la edición de cliente
    alert("Función de edición de cliente no implementada en esta versión");
}

function deleteClient(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
        clients = clients.filter(client => client.id !== id);
        localStorage.setItem('gym-clients', JSON.stringify(clients));
        renderClients();
    }
}

function searchClients() {
    const searchTerm = document.getElementById('search-client').value.toLowerCase();
    const rows = document.getElementById('clients-list').getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.getElementsByTagName('td');
        let found = false;
        
        for (let j = 0; j < cells.length; j++) {
            const cellText = cells[j].textContent.toLowerCase();
            if (cellText.indexOf(searchTerm) > -1) {
                found = true;
                break;
            }
        }
        
        if (found) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
}

// CRUD para Membresías
function renderMemberships() {
    const membershipsList = document.getElementById('memberships-list');
    membershipsList.innerHTML = '';
    
    memberships.forEach(membership => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${membership.name}</td>
            <td>$${membership.price.toLocaleString()}</td>
            <td>${membership.credits}</td>
            <td>${membership.duration}</td>
            <td>
                <button class="btn" onclick="editMembership(${membership.id})">Editar</button>
                <button class="btn btn-danger" onclick="deleteMembership(${membership.id})">Eliminar</button>
            </td>
        `;
        membershipsList.appendChild(tr);
    });
}

function addMembership() {
    const name = document.getElementById('membership-name').value;
    const price = parseFloat(document.getElementById('membership-price').value);
    const credits = parseInt(document.getElementById('membership-credits').value);
    const duration = parseInt(document.getElementById('membership-duration').value);
    
    // Encontrar el ID más alto actual y sumar 1
    const maxId = memberships.length > 0 ? Math.max(...memberships.map(m => m.id)) : 0;
    
    // Crear nueva membresía
    const newMembership = {
        id: maxId + 1,
        name: name,
        price: price,
        credits: credits,
        duration: duration
    };
    
    memberships.push(newMembership);
    localStorage.setItem('gym-memberships', JSON.stringify(memberships));
    
    renderMemberships();
    populateMembershipDropdowns();
    closeModal('modal-add-membership');
    document.getElementById('add-membership-form').reset();
}

function editMembership(id) {
    // Implementar la edición de membresía
    alert("Función de edición de membresía no implementada en esta versión");
}

function deleteMembership(id) {
    // Verificar si hay clientes con esta membresía
    const clientsWithMembership = clients.filter(client => client.membershipId === id);
    
    if (clientsWithMembership.length > 0) {
        alert("No se puede eliminar esta membresía porque hay clientes que la están utilizando.");
        return;
    }
    
    if (confirm("¿Estás seguro de que deseas eliminar esta membresía?")) {
        memberships = memberships.filter(membership => membership.id !== id);
        localStorage.setItem('gym-memberships', JSON.stringify(memberships));
        renderMemberships();
        populateMembershipDropdowns();
    }
}

// Gestión de Asistencia
function renderAttendance() {
    const attendanceList = document.getElementById('attendance-list');
    attendanceList.innerHTML = '';
    
    // Ordenar asistencias por fecha (más recientes primero)
    const sortedAttendance = [...attendance].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Mostrar solo las últimas 20 asistencias
    const recentAttendance = sortedAttendance.slice(0, 20);
    
    recentAttendance.forEach(record => {
        const client = clients.find(c => c.id === record.clientId);
        if (client) {
            const tr = document.createElement('tr');
            const date = new Date(record.date);
            tr.innerHTML = `
                <td>${client.name}</td>
                <td>${date.toLocaleDateString()}</td>
                <td>${date.toLocaleTimeString()}</td>
                <td>${record.previousCredits}</td>
                <td>${record.currentCredits}</td>
            `;
            attendanceList.appendChild(tr);
        }
    });
}

function searchForAttendance() {
    const searchTerm = document.getElementById('search-attendance').value.toLowerCase();
    const resultsDiv = document.getElementById('attendance-results');
    
    if (searchTerm.length < 2) {
        resultsDiv.innerHTML = '';
        return;
    }
    
    // Buscar clientes que coincidan
    const matchedClients = clients.filter(client => 
        client.id.toString().includes(searchTerm) || 
        client.name.toLowerCase().includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm)
    );
    
    if (matchedClients.length === 0) {
        resultsDiv.innerHTML = '<p>No se encontraron clientes.</p>';
        return;
    }
    
    resultsDiv.innerHTML = '';
    
    matchedClients.forEach(client => {
        const clientCard = document.createElement('div');
        clientCard.className = 'card';
        clientCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3>${client.name}</h3>
                    <p>ID: ${client.id} | Créditos: ${client.credits}</p>
                    <p>Membresía: ${getMembershipName(client.membershipId)}</p>
                </div>
                <button class="btn btn-success" onclick="registerAttendance(${client.id})">Registrar Asistencia</button>
            </div>
        `;
        resultsDiv.appendChild(clientCard);
    });
}

function registerAttendance(clientId) {
    const client = clients.find(c => c.id === clientId);
    
    if (!client) {
        alert("Cliente no encontrado.");
        return;
    }
    
    if (client.credits <= 0) {
        alert("Este cliente no tiene créditos disponibles. Por favor, registre un nuevo pago.");
        return;
    }
    
    // Registrar la asistencia
    const previousCredits = client.credits;
    client.credits -= 1; // Descontar un crédito
    
    const attendanceRecord = {
        id: attendance.length > 0 ? Math.max(...attendance.map(a => a.id)) + 1 : 1,
        clientId: client.id,
        date: new Date().toISOString(),
        previousCredits: previousCredits,
        currentCredits: client.credits
    };
    
    attendance.push(attendanceRecord);
    
    // Actualizar los datos
    localStorage.setItem('gym-clients', JSON.stringify(clients));
    localStorage.setItem('gym-attendance', JSON.stringify(attendance));
    
    renderAttendance();
    searchForAttendance(); // Actualizar resultados de búsqueda
    
    alert(`Asistencia registrada para ${client.name}. Créditos restantes: ${client.credits}`);
}

// Gestión de Pagos
function openPaymentModal(clientId) {
    const client = clients.find(c => c.id === clientId);
    
    if (!client) {
        alert("Cliente no encontrado.");
        return;
    }
    
    document.getElementById('payment-client-id').value = client.id;
    document.getElementById('payment-client-name').value = client.name;
    
    // Poblar el dropdown de membresías si no se ha hecho antes
    populateMembershipDropdowns('payment-membership');
    
    openModal('modal-add-payment');
}

function addPayment() {
    const clientId = parseInt(document.getElementById('payment-client-id').value);
    const membershipId = parseInt(document.getElementById('payment-membership').value);
    const amount = parseFloat(document.getElementById('payment-amount').value);
    const method = document.getElementById('payment-method').value;
    
    const client = clients.find(c => c.id === clientId);
    const membership = memberships.find(m => m.id === membershipId);
    
    if (!client || !membership) {
        alert("Error al procesar el pago. Cliente o membresía no encontrados.");
        return;
    }
    
    // Crear registro de pago
    const payment = {
        id: payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1,
        clientId: clientId,
        membershipId: membershipId,
        amount: amount,
        method: method,
        date: new Date().toISOString()
    };
    
    // Actualizar créditos del cliente
    client.credits += membership.credits;
    client.membershipId = membership.id;
    
    // Guardar los cambios
    payments.push(payment);
    localStorage.setItem('gym-clients', JSON.stringify(clients));
    localStorage.setItem('gym-payments', JSON.stringify(payments));
    
    renderClients();
    closeModal('modal-add-payment');
    document.getElementById('add-payment-form').reset();
    
    alert(`Pago registrado con éxito. ${client.name} ahora tiene ${client.credits} créditos.`);
}

// Generación de reportes
function generate