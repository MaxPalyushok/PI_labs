const BASE_URL = 'http://localhost:5500/server/server.php';
const API_URL = `${BASE_URL}/students`;

let students = [];
const students_per_page = 8;
let current_page = 1;
let total_pages = 1;


document.querySelector(".close").onclick = close_modal_window;
document.getElementById("open_add_window").onclick = open_modal_window;
document.getElementById("add_student").onclick = add_student;
document.getElementById("save_student").onclick = save_student;
document.getElementById("cancel_student").onclick = close_modal_window;

document.addEventListener('DOMContentLoaded', function() {
    fetch_students(current_page);
});

document.getElementById("all_checked").addEventListener("change", function () {
    const isChecked = this.checked;
    document.querySelectorAll('input[type="checkbox"].student_checkbox').forEach(checkbox => {
        checkbox.checked = isChecked;
    });
});

document.getElementById("pagination_prev_btn").onclick = function() {
    if (current_page > 1) {
        current_page--;
        fetch_students(current_page);
    }
};

document.getElementById("pagination_next_btn").onclick = function() {
    if (current_page < total_pages) {
        current_page++;
        fetch_students(current_page);
    }
};


function fetch_students(page) {
    fetch(`${API_URL}?page=${page}&per_page=${students_per_page}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'Success') {
                students = data.data.students;
                current_page = data.data.pagination.current_page;
                total_pages = data.data.pagination.total_pages;
                update_table();
            } else {
                console.error('Error fetching students:', data.message);
            }
        })
        .catch(error => {
            console.error('API request failed:', error);
        });
}

function open_modal_window() {
    document.getElementById("modal_title").textContent = "Add student";
    document.getElementById("user_modal").style.display = "block";
    document.getElementById("add_student").style.display = "block";
    document.getElementById("save_student").style.display = "none";

    document.getElementById("student_first_name").value = "";
    document.getElementById("student_last_name").value = "";
    document.getElementById("student_birthday").value = "";
    document.getElementById("student_group").selectedIndex = 0;
    document.getElementById("student_gender").selectedIndex = 0;
}

function close_modal_window() {
    document.getElementById("user_modal").style.display = "none";
}

function add_student() {
    const studentData = {
        first_name: document.getElementById("student_first_name").value.trim(),
        last_name: document.getElementById("student_last_name").value.trim(),
        gender: document.getElementById("student_gender").value,
        birthday: document.getElementById("student_birthday").value,
        student_group: document.getElementById("student_group").value
    };

    if (!studentData.first_name || !studentData.last_name || !studentData.birthday || !studentData.student_group) {
        alert("Будь ласка, заповніть всі поля!");
        return;
    }

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'Created') {
            close_modal_window();
            fetch_students(current_page);
        } else {
            alert(`Error: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('API request failed:', error);
        alert('Failed to add student. Please try again.');
    });
}

function edit_student(id) {
    fetch(`${API_URL}/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'Success') {
                const student = data.data;
                document.querySelector('input[name="student_id"]').value = student.id;
                document.getElementById("student_first_name").value = student.first_name;
                document.getElementById("student_last_name").value = student.last_name;
                document.getElementById("student_gender").value = student.gender;
                document.getElementById("student_birthday").value = student.birthday;
                document.getElementById("student_group").value = student.student_group;
                
                document.getElementById("modal_title").textContent = "Edit student";
                document.getElementById("user_modal").style.display = "block";
                document.getElementById("add_student").style.display = "none";
                document.getElementById("save_student").style.display = "block";
            } else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('API request failed:', error);
            alert('Failed to load student data. Please try again.');
        });
}

function save_student() {
    const id = document.querySelector('input[name="student_id"]').value;
    
    const studentData = {
        id: id,
        first_name: document.getElementById("student_first_name").value.trim(),
        last_name: document.getElementById("student_last_name").value.trim(),
        gender: document.getElementById("student_gender").value,
        birthday: document.getElementById("student_birthday").value,
        student_group: document.getElementById("student_group").value
    };

    if (!studentData.first_name || !studentData.last_name || !studentData.birthday || !studentData.student_group) {
        alert("Будь ласка, заповніть всі поля!");
        return;
    }

    fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'Success') {
            close_modal_window();
            fetch_students(current_page);
        } else {
            alert(`Error: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('API request failed:', error);
        alert('Failed to update student. Please try again.');
    });
}

function delete_student(id) {
    if (confirm("Ви дійсно хочете видалити цього студента?")) {
        fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'Success') {
                if (students.length === 1 && current_page > 1) {
                    current_page--;
                }
                fetch_students(current_page);
            } else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('API request failed:', error);
            alert('Failed to delete student. Please try again.');
        });
    }
}

function update_table() {
    let table_body = document.querySelector(".student_content table tbody");
    table_body.innerHTML = "";

    students.forEach((student, index) => {
        let formatted_date = new Date(student.birthday).toLocaleDateString("uk-UA");
        let new_row = table_body.insertRow(index);
        new_row.innerHTML = `
            <td><div><input type="checkbox" class="student_checkbox"></div></td>
            <td><b>${student.student_group}</b></td>
            <td><b class="student_name">${student.first_name} ${student.last_name}</b></td>
            <td><b>${student.gender}</b></td>
            <td><b>${formatted_date}</b></td>
            <td>
                <b>
                    <svg viewBox="0 0 30 14" xmlns="http://www.w3.org/2000/svg" fill="#bfbfbf">
                        <circle cx="15" cy="7" r="3" />
                    </svg>
                </b>
            </td>
            <td>
                <div class="edit_btns">
                    <button onclick="edit_student('${student.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
                            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                        </svg>
                    </button>

                    <button onclick="delete_student('${student.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
                            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                        </svg>  
                    </button>
                </div>
            </td>
            `;
    });
    update_pagination();
}

function update_pagination() {
    let pagination = document.querySelector(".pagination_num_btns");
    pagination.innerHTML = "";

    for (let i = 1; i <= total_pages; i++) {
        let new_button = document.createElement("button");
        new_button.textContent = i;
        new_button.onclick = function() {
            fetch_students(i);
        };

        if (current_page === i) {
            new_button.classList.add("active");
        }

        pagination.appendChild(new_button);
    }

    let prev_btn = document.getElementById("pagination_prev_btn");
    let next_btn = document.getElementById("pagination_next_btn");

    prev_btn.hidden = current_page === 1;
    next_btn.hidden = current_page === total_pages || total_pages === 0;
}