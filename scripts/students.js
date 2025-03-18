const students = [];
const students_per_page = 2;
let current_page = 1;
let editing_index = -1;

students.push({
    first_name: "Ivan",
    last_name: "Petrenko",
    gender: "Male",
    birthday: "15.03.2002",
    group: "PZ-21"
});

students.push({
    first_name: "Maksym",
    last_name: "Palyushok",
    gender: "Male",
    birthday: "02.05.2006",
    group: "PZ-26"
});

students.push({
    first_name: "Kyryl",
    last_name: "Ponomarenko",
    gender: "Male",
    birthday: "20.06.2006",
    group: "PZ-26"
});

document.querySelector(".close").onclick = close_modal_window;
document.getElementById("open_add_window").onclick = open_modal_window;
document.getElementById("save_student").onclick = add_student;
document.getElementById("cancel_student").onclick = close_modal_window;

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
}

function close_modal_window() {
    document.getElementById("modal_title").textContent = "Add student";
    document.getElementById("save_student").textContent = "Add";

    document.getElementById("student_first_name").value = "";
    document.getElementById("student_last_name").value = "";
    document.getElementById("student_birthday").value = "";

    document.getElementById("student_group").selectedIndex = 0;
    document.getElementById("student_gender").selectedIndex = 0;

    document.getElementById("user_modal").style.display = "none";
}

function add_student() {

    let first_name = document.getElementById("student_first_name").value.trim();
    let last_name = document.getElementById("student_last_name").value.trim();
    let gender = document.getElementById("student_gender").value;
    let birthday = document.getElementById("student_birthday").value;
    let group = document.getElementById("student_group").value;

    if (!first_name || !last_name || !birthday || !group) {
        alert("Будь ласка, заповніть всі поля!");
        return;
    }

    let formatted_date = new Date(birthday).toLocaleDateString("uk-UA");

    let student_data = {first_name, last_name, gender, birthday: formatted_date, group};

    if (editing_index === -1) {
        students.push(student_data);
    } else {
        students[editing_index] = student_data;
        editing_index = -1;
    }

    console.log(students);
    close_modal_window();

    update_table();
}

function update_table() {
    let table_body = document.querySelector(".student_content table tbody");
    table_body.innerHTML = "";

    let start = (current_page - 1) * students_per_page;
    let end = start + students_per_page;
    let show_students = students.slice(start, end);

    show_students.forEach((student, index) => {
        let new_row = table_body.insertRow(index);
        new_row.innerHTML = `
            <td><div><input type="checkbox"></div></td>
            <td><b>${student.group}</b></td>
            <td><b class="student_name">${student.first_name} ${student.last_name}</b></td>
            <td><b>${student.gender}</b></td>
            <td><b>${student.birthday}</b></td>
            <td>
                <b>
                    <svg viewBox="0 0 30 14" xmlns="http://www.w3.org/2000/svg" fill="#bfbfbf">
                        <circle cx="15" cy="7" r="3" />
                    </svg>
                </b>
            </td>
            <td>
                <div class="edit_btns">
                    <button onclick="edit_row(this)">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
                            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                        </svg>
                    </button>

                    <button onclick="delete_row(this)">
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


function delete_row(btn) {
    const row = btn.closest("tr");

    if (!row) {
        return;
    }

    let group = row.cells[1].textContent.trim();
    let full_name = row.cells[2].textContent.trim();
    let gender = row.cells[3].textContent.trim();
    let birthday = row.cells[4].textContent.trim();

    let [first_name, last_name] = full_name.split(" ");

    const confirmation = confirm(`Are you sure you want to delete user: ${first_name} ${last_name}?`);

    if (confirmation) {
        row.remove();

        let index = students.findIndex(student => 
            student.first_name === first_name &&
            student.last_name === last_name &&
            student.group === group &&
            student.gender === gender &&
            student.birthday === birthday
        );

        if (index !== -1) {
            students.splice(index, 1);
        }

        console.log(students);
        update_table();
    }
}

function edit_row(btn) {
    const row = btn.closest("tr");
    if (!row) return;

    let group = row.cells[1].textContent.trim();
    let full_name = row.cells[2].textContent.trim();
    let gender = row.cells[3].textContent.trim();
    let birthday = row.cells[4].textContent.trim();

    let [first_name, last_name] = full_name.split(" ");

    let index = students.findIndex(student => 
        student.first_name === first_name &&
        student.last_name === last_name &&
        student.group === group &&
        student.gender === gender &&
        student.birthday === birthday
    );

    if (index !== -1) {
        editing_index = index;

        document.getElementById("modal_title").textContent = "Edit student";
        document.getElementById("save_student").textContent = "Save";

        document.getElementById("student_first_name").value = students[index].first_name;
        document.getElementById("student_last_name").value = students[index].last_name;
        document.getElementById("student_group").value = students[index].group;
        document.getElementById("student_gender").value = students[index].gender;

        let date = students[index].birthday;

        if (date) {
            let parts = date.split(".");
            let formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

            console.log("Original Date:", date);
            console.log("Formatted Date:", formattedDate);

            document.getElementById("student_birthday").value = formattedDate;
        }
        document.getElementById("user_modal").style.display = "block";
    }
}

update_table();
console.log(students);