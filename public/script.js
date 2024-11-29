const apiUrl = 'http://localhost:3001'; // backend api
let students = []
let currentPage = 1
const pageSize = 3

// Fetch and display students in a table
async function fetchStudents() {
    const response = await fetch(apiUrl);
    students = (await response.json()).data;
    displayStudents()
    setupPagination()
}

function displayStudents() {
    const studentTableBody = document.getElementById('studentList');
    studentTableBody.innerHTML = ''; // Clear existing data

    const start = (currentPage - 1) * pageSize
    const end = start + pageSize

    const paginatedStudents = students.slice(start, end)

    paginatedStudents.forEach(student => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td style="display: none">${student._id}</td>
            <td>${student.studentId}</td>
            <td>${student.name}</td>
            <td>${student.dob.slice(0, 10)}</td>
            <td>${student.address}</td>
            <td>
                <button class="edit" onclick="loadStudent('${student._id}')">Edit</button>
                <button class="delete" onclick="deleteStudent('${student._id}')">Delete</button>
            </td>
        `;
        studentTableBody.appendChild(tr);
    });
}

// Setup pagination controls
function setupPagination() {
    const paginationControls = document.getElementById('paginationControls');
    paginationControls.innerHTML = ''; // Clear existing pagination buttons

    const totalPages = Math.ceil(students.length / pageSize);

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('pagination-btn');
        if (i === currentPage) {
            button.classList.add('active'); // Highlight the current page
        }

        button.addEventListener('click', () => {
            currentPage = i;
            displayStudents(); // Display the students for the selected page
        });

        paginationControls.appendChild(button);
    }
}

// Show the "Create Student" popup form
function showPopup(isUpdate) {
    const popup = document.getElementById('studentModal');
    popup.style.display = 'block';
    if (isUpdate) {
        popup.querySelector("#editSubmit").style.display = 'block'
    } else {
        popup.querySelector("#addSubmit").style.display = 'block'
    }
}

// Hide the "Create Student" popup form
function hidePopup() {
    const popup = document.getElementById('studentModal');
    popup.style.display = 'none';
    popup.querySelector("#addSubmit").style.display = 'none'
    popup.querySelector("#editSubmit").style.display = 'none'
    document.getElementById('studentForm').reset();
}

// Load student data into the form for editing
async function loadStudent(id) {
    const response = await fetch(`${apiUrl}/${id}`);
    const student = (await response.json()).data;
    document.getElementById('dbEntryId').value = student._id;
    document.getElementById('studentId').value = student.studentId;
    document.getElementById('name').value = student.name;
    document.getElementById('dob').value = student.dob.slice(0, 10);
    document.getElementById('address').value = student.address;
    showPopup(true); // Show the form in popup when editing
}

// Add or update student
document.getElementById('studentForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    console.log(document.getElementById('update'))
    const isUpdate = event.submitter.id != "addSubmit"
    const method = isUpdate ? 'PUT' : 'POST'
    let url = apiUrl

    const studentData = {
        dbEntryId: document.getElementById('dbEntryId').value,
        studentId: document.getElementById('studentId').value,
        name: document.getElementById('name').value,
        dob: document.getElementById('dob').value,
        address: document.getElementById('address').value
    };

    if (method === 'PUT') {
        url += `/${studentData.dbEntryId}`
    }


    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        if (response.ok) {
            hidePopup(); // Hide the popup after saving
            await fetchStudents();
        } else {
            const errorResponse = await response.json();
            alert("Error: ", errorResponse)
        }
    } catch (error) {
        console.error('Error adding/updating student: ', error)
    }
});

// Delete student
async function deleteStudent(id) {
    await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
    await fetchStudents();
}

// Initial fetch of students
fetchStudents();

// Event listener for the "Add Student" button to show the popup
document.getElementById('addStudentBtn').addEventListener('click', () => { showPopup(false) });

// Event listener to close the modal
document.getElementById('closeModal').addEventListener('click', hidePopup)
