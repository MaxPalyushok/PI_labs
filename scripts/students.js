const students = [];
const students_per_page = 3;
let current_page = 1;
let current_id = 0;

document.querySelector(".close").onclick = close_modal_window;
document.getElementById("open_add_window").onclick = open_modal_window;
document.getElementById("add_student").onclick = add_student;
document.getElementById("save_student").onclick = edit_row;
document.getElementById("cancel_student").onclick = close_modal_window;

document.getElementById("all_checked").addEventListener("change", function () {
    const isChecked = this.checked;
    document.querySelectorAll('input[type="checkbox"].student_checkbox').forEach(checkbox => {
        checkbox.checked = isChecked;
    });
});


document.getElementById("pagination_prev_btn").onclick = function() {
    if (current_page > 1) {
        current_page--;
        update_table();
    }
};

document.getElementById("pagination_next_btn").onclick = function() {
    let total_pages = Math.ceil(students.length / students_per_page);
    if (current_page < total_pages) {
        current_page++;
        update_table();
    }
};

function open_modal_window() {
    document.getElementById("user_modal").style.display = "block";
    document.getElementById("add_student").style.display = "block";
    document.getElementById("save_student").style.display = "none";
}

function close_modal_window() {

    document.getElementById("student_first_name").value = "";
    document.getElementById("student_last_name").value = "";
    document.getElementById("student_birthday").value = "";

    document.getElementById("student_group").selectedIndex = 0;
    document.getElementById("student_gender").selectedIndex = 0;

    document.getElementById("user_modal").style.display = "none";
}

function add_student() {

    open_modal_window();
    
    const studentData = {
        first_name: document.getElementById("student_first_name").value.trim(),
        last_name: document.getElementById("student_last_name").value.trim(),
        gender: document.getElementById("student_gender").value,
        birthday: document.getElementById("student_birthday").value,
        group: document.getElementById("student_group").value
    };

    if (!studentData.first_name || !studentData.last_name || !studentData.birthday || !studentData.group) {
        alert("Будь ласка, заповніть всі поля!");
        return;
    }

    let student_data = {
        id: current_id++,
        first_name: studentData.first_name,
        last_name: studentData.last_name,
        gender: studentData.gender,
        birthday: studentData.birthday,
        group: studentData.group
    };

    students.push(student_data);

    console.log(students);
    close_modal_window();
    update_table();

    document.getElementById("save_student").style.display = "none";
}

function update_table() {
    let table_body = document.querySelector(".student_content table tbody");
    table_body.innerHTML = "";

    let start = (current_page - 1) * students_per_page;
    let end = start + students_per_page;
    let show_students = students.slice(start, end);
    

    show_students.forEach((student, index) => {
        let formatted_date = new Date(student.birthday).toLocaleDateString("uk-UA");
        let new_row = table_body.insertRow(index);
        new_row.innerHTML = `
            <td><div><input type="checkbox" class="student_checkbox"></div></td>
            <td><b>${student.group}</b></td>
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
                    <button onclick="edit_row(${student.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
                            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                        </svg>
                    </button>

                    <button onclick="delete_row(${student.id})">
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

    let total_pages = Math.ceil(students.length / students_per_page);

    for (let i = 1; i <= total_pages; i++) {
        let new_button = document.createElement("button");
        new_button.textContent = i;
        new_button.onclick = function() {
            current_page = i;
            update_table();
        };

        if (current_page === i) {
            new_button.classList.add("active");
        }

        pagination.appendChild(new_button);
    }

    let prev_btn = document.getElementById("pagination_prev_btn");
    let next_btn = document.getElementById("pagination_next_btn");

    prev_btn.hidden = current_page === 1;
    next_btn.hidden = current_page === total_pages;
}

function delete_row(id) {
    const index = students.findIndex(student => student.id === id);
    if (index === -1) {
        alert("Студент не знайдений!");
        return;
    }

    if (confirm("Ви дійсно хочете видалити цього студента?")) {
        students.splice(index, 1);
        update_table();
        console.log(students);
    }
}

function edit_row(id) {
    const student = students.find(student => student.id === id);
    if (!student) {
        alert("Студент не знайдений!");
        return;
    }
    
    document.querySelector('input[name="student_id"]').value = student.id;
    document.getElementById("student_first_name").value = student.first_name;
    document.getElementById("student_last_name").value = student.last_name;
    document.getElementById("student_gender").value = student.gender;
    document.getElementById("student_birthday").value = student.birthday;
    document.getElementById("student_group").value = student.group;
    
    document.getElementById("user_modal").style.display = "block";
    document.getElementById("add_student").style.display = "none";
    document.getElementById("save_student").style.display = "block";
    
    document.getElementById("save_student").onclick = function () {
        student.first_name = document.getElementById("student_first_name").value.trim();
        student.last_name = document.getElementById("student_last_name").value.trim();
        student.gender = document.getElementById("student_gender").value;
        student.group = document.getElementById("student_group").value;
        student.birthday = document.getElementById("student_birthday").value;
        
        if (!student.first_name || !student.last_name || !student.birthday || !student.group) {
            alert("Будь ласка, заповніть всі поля!");
            return;
        }
        
        close_modal_window();
        update_table();
        console.log(students);
    };
}

update_table();
console.log(students);