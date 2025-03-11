document.querySelector(".close").onclick = close_modal_window;
document.getElementById("open_add_window").onclick = open_modal_window;
document.getElementById("save_student").onclick = add_student;
document.getElementById("cancel_student").onclick = close_modal_window;


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

    let table = document.querySelector(".student_content table tbody");
    let new_row = table.insertRow();

    new_row.innerHTML = `
    <td><div><input type="checkbox"></div></td>
    <td><b>${group}</b></td>
    <td><b class="student_name">${first_name} ${last_name}</b></td>
    <td><b>${gender}</b></td>
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

    close_modal_window();
}

function delete_row(btn) {
    const row = btn.closest("tr");

    if (row) {
        const name = row.querySelector(".student_name")?.textContent || "цього користувача";
        const confirmDelete = confirm(`Ви впевнені, що хочете видалити користувача з ім'ям "${name}"?`);

        if (confirmDelete) {
            row.remove();
        }
    }
}

function edit_row(btn) {
    const row = btn.closest("tr");

    if (!row) {
        return;
    }

    // Зберігаємо значення, що зараз є в таблиці
    let group = row.cells[1].textContent.trim();
    let full_name = row.cells[2].textContent.trim();
    let gender = row.cells[3].textContent.trim();
    let birthday = row.cells[4].textContent.trim();

    // Розділяємо ім'я та прізвище
    let [first_name, last_name] = full_name.split(" ");

    // Встановлюємо значення у форму для редагування
    document.getElementById("student_first_name").value = first_name;
    document.getElementById("student_last_name").value = last_name;
    document.getElementById("student_gender").value = gender;
    
    let [day, month, year] = birthday.split('.');
    let formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    document.getElementById("student_birthday").value = formattedDate;

    document.getElementById("student_group").value = group;

    document.getElementById("modal_title").textContent = "Edit student";
    document.getElementById("save_student").textContent = "Save";
    document.getElementById("user_modal").setAttribute("data-editing-row", row.rowIndex);


    open_modal_window();

    // Обробник збереження змін при натисканні кнопки "Зберегти"
    document.getElementById("save_student").onclick = function() {

        const first_name = document.getElementById("student_first_name").value;
        const last_name = document.getElementById("student_last_name").value;
        const gender = document.getElementById("student_gender").value;
        const birthday = document.getElementById("student_birthday").value;
        const group = document.getElementById("student_group").value;

        row.cells[1].querySelector("b").textContent = group;
        row.cells[2].querySelector("b").textContent = first_name + " " + last_name;
        row.cells[3].querySelector("b").textContent = gender;
        row.cells[4].querySelector("b").textContent = birthday.split('-').reverse().join('.');

        close_modal_window();
    };
}