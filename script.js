document.addEventListener('DOMContentLoaded', async () => {
    const tables = await fetchTables();
    tables.forEach((tableData, index) => {
        addTableToDOM(tableData.card, tableData.name, index);
    });

    // Event-Listener für Enter-Taste hinzufügen
    document.getElementById('numberInput').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            highlightNumbers();
        }
    });
});

async function fetchTables() {
    const response = await fetch('/api/tables');
    return await response.json();
}

async function addNewTable() {
    const newTableName = document.getElementById('newTableName').value.trim();
    const newTableData = document.getElementById('newTableData').value.trim();
    
    if (newTableName && newTableData) {
        try {
            const tableArray = JSON.parse(newTableData);
            if (tableArray.length === 5 && tableArray.every(row => row.length === 5)) {
                await fetch('/api/tables', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ card: tableArray, name: newTableName })
                });
                document.getElementById('newTableName').value = '';
                document.getElementById('newTableData').value = '';
                location.reload();
            } else {
                alert('Die Tabelle muss 5x5 sein.');
            }
        } catch (e) {
            alert('Ungültiges Format. Bitte geben Sie eine gültige 5x5-Tabelle im JSON-Format ein.');
        }
    } else {
        alert('Bitte geben Sie einen Tabellennamen und Daten ein.');
    }
}

async function deleteTable(index) {
    await fetch(`/api/tables/${index}`, { 
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    location.reload();
}

function addTableToDOM(tableData, tableName, index) {
    const tablesContainer = document.getElementById('tablesContainer');
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('table-container');
    tableContainer.id = `table-container-${index}`;

    if (tableName) {
        const tableNameElement = document.createElement('h4');
        tableNameElement.textContent = tableName;
        tableContainer.appendChild(tableNameElement);
    }

    const table = document.createElement('table');
    table.id = `table-${index}`;
    table.classList.add('table', 'table-bordered', 'table-striped');
    
    tableData.forEach((row, rowIndex) => {
        let tr = document.createElement('tr');
        row.forEach((cell, colIndex) => {
            let td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Löschen';
    deleteButton.classList.add('btn', 'btn-danger', 'delete-btn');
    deleteButton.onclick = () => deleteTable(index);

    tableContainer.appendChild(table);
    tableContainer.appendChild(deleteButton);
    tablesContainer.appendChild(tableContainer);
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        alert('Erfolgreich angemeldet');
    } else {
        alert('Login fehlgeschlagen');
    }
}

async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        alert('Erfolgreich registriert');
    } else {
        alert('Registrierung fehlgeschlagen');
    }
}

function goBack() {
    window.location.href = 'index.html';
}

function highlightNumbers() {
    const inputElement = document.getElementById('numberInput');
    const input = inputElement.value.trim();

    if (input) {
        const content = document.getElementById('content');
        const regex = new RegExp(`\\b${input}\\b`, 'g');
        content.innerHTML = content.innerHTML.replace(/<span class="highlight">([^<]*)<\/span>/g, '$1');
        content.innerHTML = content.innerHTML.replace(regex, '<span class="highlight">$&</span>');

        const cells = document.querySelectorAll('#tablesContainer td');
        cells.forEach(cell => {
            cell.classList.remove('highlight');
            if (cell.textContent === input) {
                cell.classList.add('highlight');
            }
        });

        inputElement.value = '';
    }
}

function removeHighlights() {
    const content = document.getElementById('content');
    content.innerHTML = content.innerHTML.replace(/<span class="highlight">([^<]*)<\/span>/g, '$1');

    const cells = document.querySelectorAll('#tablesContainer td');
    cells.forEach(cell => {
        cell.classList.remove('highlight');
    });
}
