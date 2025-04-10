/*const BASE_URL = "http://localhost:5500/server/server.php"; 
const API_URL = `${BASE_URL}?endpoint=students`;
const students_per_page = 8;
let current_page = 1;
let total_pages = 0;
let total_students = 0;
let isFirstLoad = true;

// Отримання студентів з сервера при завантаженні сторінки
document.addEventListener("DOMContentLoaded", fetchStudents);

document.querySelector(".close").onclick = close_modal_window;
document.getElementById("open_add_window").onclick = open_modal_window;
document.getElementById("add_student").onclick = add_student;
document.getElementById("save_student").onclick = save_student;
document.getElementById("cancel_student").onclick = close_modal_window;

document.getElementById("pagination_prev_btn").onclick = function () {
    if (current_page > 1) {
        current_page--;
        fetchStudents();
    }
};

document.getElementById("pagination_next_btn").onclick = function () {
    if (current_page < total_pages) {
        current_page++;
        fetchStudents();
    }
};

// Функція отримання студентів із сервера з пагінацією
function fetchStudents() {
    if (isFirstLoad) {
        // Тільки перше завантаження, не викликаємо fetch для кожної зміни
        isFirstLoad = false;
    } else {
        // Якщо не перше завантаження, просто оновлюємо таблицю без повторного запиту на сервер
        update_table();
        return;
    }

    const url = `${API_URL}&page=${current_page}&per_page=${students_per_page}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(response => {
            // Перевіряємо структуру відповіді
            if (!response.data || !response.meta) {
                console.error("Невірний формат відповіді:", response);
                return;
            }
            
            // Оновлюємо дані
            students = response.data;
            total_students = response.meta.total;
            current_page = response.meta.current_page; // Поточна сторінка
            total_pages = response.meta.total_pages;
            
            update_table();
        })
        .catch(error => {
            console.error("Помилка при отриманні студентів:", error);
            alert("Помилка з'єднання з сервером: " + error.message);
        });
}

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

// Додавання студента через сервер
function add_student() {
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

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            close_modal_window();
            // Перезавантажуємо поточну сторінку або переходимо на останню
            fetchStudents();
        })
        .catch(error => {
            console.error("Помилка при додаванні студента:", error);
            alert("Помилка при додаванні студента: " + error.message);
        });
}

// Оновлення таблиці студентів
function update_table() {
    let table_body = document.querySelector(".student_content table tbody");
    table_body.innerHTML = "";

    if (!students || students.length === 0) {
        // Якщо немає студентів, показуємо повідомлення
        let new_row = table_body.insertRow(0);
        new_row.innerHTML = `<td colspan="7" class="no-data">Немає студентів для відображення</td>`;
    } else {
        students.forEach((student, index) => {
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
                        <button onclick="edit_row('${student.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
                                <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                            </svg>
                        </button>

                        <button onclick="delete_row('${student.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
                                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                            </svg>  
                        </button>
                    </div>
                </td>
                `;
        });
    }
    
    update_pagination();
}

function update_pagination() {
    let pagination = document.querySelector(".pagination_num_btns");
    pagination.innerHTML = "";

    if (total_pages <= 1) {
        // Якщо тільки одна сторінка, приховуємо пагінацію
        document.getElementById("pagination_prev_btn").hidden = true;
        document.getElementById("pagination_next_btn").hidden = true;
        return;
    }

    // Визначаємо, які номери сторінок показати
    let show_max_buttons = 5; // Максимальна кількість кнопок для відображення
    let start_page = Math.max(1, current_page - Math.floor(show_max_buttons / 2));
    let end_page = Math.min(total_pages, start_page + show_max_buttons - 1);
    
    // Якщо ми біля кінця, зсуваємо діапазон назад
    if (end_page - start_page + 1 < show_max_buttons && start_page > 1) {
        start_page = Math.max(1, end_page - show_max_buttons + 1);
    }

    // Додаємо кнопку "На першу сторінку", якщо не на початку
    if (start_page > 1) {
        let firstButton = document.createElement("button");
        firstButton.textContent = "1";
        firstButton.onclick = function () {
            current_page = 1;
            fetchStudents();
        };
        pagination.appendChild(firstButton);
        
        if (start_page > 2) {
            let ellipsis = document.createElement("span");
            ellipsis.textContent = "...";
            ellipsis.className = "pagination-ellipsis";
            pagination.appendChild(ellipsis);
        }
    }

    // Додаємо кнопки по сторінках
    for (let i = start_page; i <= end_page; i++) {
        let new_button = document.createElement("button");
        new_button.textContent = i;
        new_button.onclick = function () {
            current_page = i;
            fetchStudents();
        };

        if (current_page === i) {
            new_button.classList.add("active");
        }

        pagination.appendChild(new_button);
    }

    // Додаємо кнопку "На останню сторінку", якщо не на кінці
    if (end_page < total_pages) {
        if (end_page < total_pages - 1) {
            let ellipsis = document.createElement("span");
            ellipsis.textContent = "...";
            ellipsis.className = "pagination-ellipsis";
            pagination.appendChild(ellipsis);
        }
        
        let lastButton = document.createElement("button");
        lastButton.textContent = total_pages;
        lastButton.onclick = function () {
            current_page = total_pages;
            fetchStudents();
        };
        pagination.appendChild(lastButton);
    }

    document.getElementById("pagination_prev_btn").hidden = current_page === 1;
    document.getElementById("pagination_next_btn").hidden = current_page === total_pages;
}*/

const BASE_URL = "http://localhost:5500/server/server.php"; 
const API_URL = `${BASE_URL}?endpoint=students`;
const students_per_page = 8;
let current_page = 1;
let total_pages = 0;
let students = []; // Додано для збереження списку студентів
let isFirstLoad = true; // Перевірка для ініціальної загрузки

// Отримання студентів з сервера при завантаженні сторінки
document.addEventListener("DOMContentLoaded", function() {
    if (isFirstLoad) {
        fetchStudents(); // Викликається тільки один раз при завантаженні сторінки
        isFirstLoad = false;
    }
});

document.querySelector(".close").onclick = close_modal_window;
document.getElementById("open_add_window").onclick = open_modal_window;
document.getElementById("add_student").onclick = add_student;
document.getElementById("save_student").onclick = save_student;
document.getElementById("cancel_student").onclick = close_modal_window;

document.getElementById("pagination_prev_btn").onclick = function () {
    if (current_page > 1) {
        current_page--;
        fetchStudents(); // Оновлення студентів на попередній сторінці
    }
};

document.getElementById("pagination_next_btn").onclick = function () {
    if (current_page < total_pages) {
        current_page++;
        fetchStudents(); // Оновлення студентів на наступній сторінці
    }
};

// Функція отримання студентів із сервера з пагінацією
// function fetchStudents() {
//     const url = `${API_URL}&page=${current_page}&per_page=${students_per_page}`;
    
//     fetch(url)
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(response => {
//             // Оновлено структуру згідно з наданим форматом JSON
//             if (!response.students) {
//                 console.error("Невірний формат відповіді:", response);
//                 return;
//             }
            
//             // Оновлюємо дані
//             students = response.students;
//             total_pages = response.total_pages;
//             current_page = response.page; // Оновлено для використання page з відповіді
            
//             update_table();
//         })
//         .catch(error => {
//             console.error("Помилка при отриманні студентів:", error);
//             alert("Помилка з'єднання з сервером: " + error.message);
//         });
// }

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

// Додавання студента через сервер без виклику fetchStudents
/*function add_student() {
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

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData)
    })
        .then(response => response.json())
        .then(data => {
            console.log("Студента додано:", data);
            close_modal_window();
            
            // Після додавання студента, оновлюємо поточну сторінку
            // Замість fetchStudents відразу робимо GET запит на першу сторінку
            current_page = 1; // Повертаємось на першу сторінку після додавання
            
            // Виконуємо прямий GET запит на першу сторінку
            fetch(`${API_URL}&page=1&per_page=${students_per_page}`)
                .then(response => response.json())
                .then(response => {
                    students = response.students;
                    total_pages = response.total_pages;
                    current_page = response.page;
                    update_table();
                })
                .catch(error => console.error("Помилка оновлення після додавання:", error));
        })
        .catch(error => {
            console.error("Помилка при додаванні студента:", error);
            alert("Помилка при додаванні студента: " + error.message);
        });
}*/

// function update_table() {
//     let table_body = document.querySelector(".student_content table tbody");
//     table_body.innerHTML = "";

//     if (!students || students.length === 0) {
//         // Якщо немає студентів, показуємо повідомлення
//         let new_row = table_body.insertRow(0);
//         new_row.innerHTML = `<td colspan="7" class="no-data">Немає студентів для відображення</td>`;
        
//         // Якщо поточна сторінка більша за загальну кількість сторінок (може статися після видалення),
//         // повертаємося на останню доступну сторінку без виклику fetchStudents
//         if (current_page > total_pages && total_pages > 0) {
//             current_page = total_pages;
            
//             // Виконуємо прямий GET запит на оновлену сторінку
//             fetch(`${API_URL}&page=${current_page}&per_page=${students_per_page}`)
//                 .then(response => response.json())
//                 .then(response => {
//                     students = response.students;
//                     total_pages = response.total_pages;
//                     current_page = response.page;
//                     update_table();
//                 })
//                 .catch(error => console.error("Помилка оновлення після зміни сторінки:", error));
            
//             return;
//         }
//     } else {
//         students.forEach((student, index) => {
//             let formatted_date = new Date(student.birthday).toLocaleDateString("uk-UA");
//             let new_row = table_body.insertRow(index);
//             new_row.innerHTML = `
//                 <td><div><input type="checkbox" class="student_checkbox"></div></td>
//                 <td><b>${student.group}</b></td>
//                 <td><b class="student_name">${student.first_name} ${student.last_name}</b></td>
//                 <td><b>${student.gender}</b></td>
//                 <td><b>${formatted_date}</b></td>
//                 <td>
//                     <b>
//                         <svg viewBox="0 0 30 14" xmlns="http://www.w3.org/2000/svg" fill="#bfbfbf">
//                             <circle cx="15" cy="7" r="3" />
//                         </svg>
//                     </b>
//                 </td>
//                 <td>
//                     <div class="edit_btns">
//                         <button onclick="edit_row('${student.id}')">
//                             <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
//                                 <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
//                             </svg>
//                         </button>

//                         <button onclick="delete_row('${student.id}')">
//                             <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
//                                 <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
//                             </svg>  
//                         </button>
//                     </div>
//                 </td>
//                 `;
//         });
//     }
    
//     update_pagination();
// }

function update_table() {
    let table_body = document.querySelector(".student_content table tbody");
    
    // Очищаємо таблицю перед відображенням нової сторінки
    // Оскільки ми відображаємо нову сторінку цілком, повне очищення є обґрунтованим
    table_body.innerHTML = "";

    if (!students || students.length === 0) {
        // Якщо немає студентів, показуємо повідомлення
        table_body.innerHTML = `<tr><td colspan="7" class="no-data">Немає студентів для відображення</td></tr>`;
        
        // Якщо поточна сторінка більша за загальну кількість сторінок (може статися після видалення),
        // повертаємося на останню доступну сторінку
        if (current_page > total_pages && total_pages > 0) {
            current_page = total_pages;
            fetchStudents();
            return;
        }
    } else {
        // Відображаємо студентів поточної сторінки
        students.forEach((student, index) => {
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
                        <button onclick="edit_row('${student.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
                                <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                            </svg>
                        </button>

                        <button onclick="delete_row('${student.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
                                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                            </svg>  
                        </button>
                    </div>
                </td>
            `;
        });
    }
    
    update_pagination();
}

function update_pagination() {
    let pagination = document.querySelector(".pagination_num_btns");
    pagination.innerHTML = "";

    if (total_pages <= 1) {
        // Якщо тільки одна сторінка, приховуємо пагінацію
        document.getElementById("pagination_prev_btn").hidden = true;
        document.getElementById("pagination_next_btn").hidden = true;
        return;
    }

    // Визначаємо, які номери сторінок показати
    let show_max_buttons = 5; // Максимальна кількість кнопок для відображення
    let start_page = Math.max(1, current_page - Math.floor(show_max_buttons / 2));
    let end_page = Math.min(total_pages, start_page + show_max_buttons - 1);
    
    // Якщо ми біля кінця, зсуваємо діапазон назад
    if (end_page - start_page + 1 < show_max_buttons && start_page > 1) {
        start_page = Math.max(1, end_page - show_max_buttons + 1);
    }

    // Додаємо кнопку "На першу сторінку", якщо не на початку
    if (start_page > 1) {
        let firstButton = document.createElement("button");
        firstButton.textContent = "1";
        firstButton.onclick = function () {
            current_page = 1;
            fetchStudents();
        };
        pagination.appendChild(firstButton);
        
        if (start_page > 2) {
            let ellipsis = document.createElement("span");
            ellipsis.textContent = "...";
            ellipsis.className = "pagination-ellipsis";
            pagination.appendChild(ellipsis);
        }
    }

    // Додаємо кнопки по сторінках
    for (let i = start_page; i <= end_page; i++) {
        let new_button = document.createElement("button");
        new_button.textContent = i;
        new_button.onclick = function () {
            current_page = i;
            fetchStudents();
        };

        if (current_page === i) {
            new_button.classList.add("active");
        }

        pagination.appendChild(new_button);
    }

    // Додаємо кнопку "На останню сторінку", якщо не на кінці
    if (end_page < total_pages) {
        if (end_page < total_pages - 1) {
            let ellipsis = document.createElement("span");
            ellipsis.textContent = "...";
            ellipsis.className = "pagination-ellipsis";
            pagination.appendChild(ellipsis);
        }
        
        let lastButton = document.createElement("button");
        lastButton.textContent = total_pages;
        lastButton.onclick = function () {
            current_page = total_pages;
            fetchStudents();
        };
        pagination.appendChild(lastButton);
    }
    
    // Оновлюємо кнопки пагінації
    document.getElementById("pagination_prev_btn").hidden = current_page <= 1;
    document.getElementById("pagination_next_btn").hidden = current_page >= total_pages;
}


// function delete_row(studentId) {
//     if (!confirm("Ви впевнені, що хочете видалити цього студента?")) {
//         return;
//     }

//     fetch(API_URL, {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id: studentId })
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log("Студента видалено:", data);
        
//         // Видаляємо студента з масиву
//         const updatedStudents = students.filter(s => s.id !== studentId);
        
//         // Якщо після видалення масив порожній і це не перша сторінка
//         if (updatedStudents.length === 0 && current_page > 1) {
//             current_page--; // Переходимо на попередню сторінку
            
//             // Виконуємо прямий GET запит на оновлену сторінку
//             fetch(`${API_URL}&page=${current_page}&per_page=${students_per_page}`)
//                 .then(response => response.json())
//                 .then(response => {
//                     students = response.students;
//                     total_pages = response.total_pages;
//                     current_page = response.page;
//                     update_table();
//                 })
//                 .catch(error => console.error("Помилка оновлення після видалення:", error));
//         } else {
//             // Інакше оновлюємо локальний масив і відображення
//             students = updatedStudents;
            
//             // Якщо масив став порожнім, може потрібно оновити total_pages
//             if (students.length === 0) {
//                 // Можна виконати додатковий запит для отримання актуальних даних про сторінки
//                 fetch(`${API_URL}&page=1&per_page=${students_per_page}`)
//                     .then(response => response.json())
//                     .then(response => {
//                         total_pages = response.total_pages;
//                         students = response.students;
//                         current_page = response.page;
//                         update_table();
//                     })
//                     .catch(error => console.error("Помилка оновлення після видалення:", error));
//             } else {
//                 update_table();
//             }
//         }
//     }).catch(error => {
//         console.error("Помилка при видаленні студента:", error);
//         alert("Помилка при видаленні студента: " + error.message);
//     });
// }

function edit_row(studentId) {
    // Знаходимо студента в поточному списку
    let student = students.find(s => s.id === studentId);
    if (!student) {
        alert("Студент не знайдений!");
        return;
    }

    // Заповнюємо модальне вікно даними студента
    document.getElementById("student_first_name").value = student.first_name;
    document.getElementById("student_last_name").value = student.last_name;
    document.getElementById("student_gender").value = student.gender;
    document.getElementById("student_birthday").value = student.birthday;
    document.getElementById("student_group").value = student.group;

    // Зберігаємо ID студента для оновлення
    document.getElementById("save_student").setAttribute("data-id", studentId);

    // Відкриваємо модальне вікно для редагування
    document.getElementById("user_modal").style.display = "block";
    document.getElementById("add_student").style.display = "none";
    document.getElementById("save_student").style.display = "block";
}

// Оптимізована функція збереження відредагованого студента
function save_student() {
    let studentId = document.getElementById("save_student").getAttribute("data-id");
    if (!studentId) {
        alert("Помилка: ID студента не знайдено!");
        return;
    }

    const studentData = {
        id: studentId,
        first_name: document.getElementById("student_first_name").value.trim(),
        last_name: document.getElementById("student_last_name").value.trim(),
        gender: document.getElementById("student_gender").value,
        birthday: document.getElementById("student_birthday").value,
        group: document.getElementById("student_group").value
    };

    fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Студента оновлено:", data);
        close_modal_window();
        
        // Оновлюємо поточну сторінку за допомогою прямого запиту
        //updateCurrentPageOnly();
        students = response.students;
        total_pages = response.total_pages;
        current_page = response.page;
        renderCurrentPageTable();
    })
    .catch(error => {
        console.error("Помилка при оновленні студента:", error);
        alert("Помилка при оновленні студента: " + error.message);
    });
}

// Функція додавання студента
function add_student() {
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

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Студента додано:", data);
        close_modal_window();
        
        // При додаванні студента переходимо на першу сторінку
        current_page = 1;
        updateCurrentPageOnly();
    })
    .catch(error => {
        console.error("Помилка при додаванні студента:", error);
        alert("Помилка при додаванні студента: " + error.message);
    });
}

// Функція видалення студента
function delete_row(studentId) {
    if (!confirm("Ви впевнені, що хочете видалити цього студента?")) {
        return;
    }

    fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: studentId })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Студента видалено:", data);
        
        // Перевіряємо, якщо був видалений останній студент на поточній сторінці
        // і це не перша сторінка
        if (students.length === 1 && current_page > 1) {
            current_page--; // Переходимо на попередню сторінку
        }
        
        // Оновлюємо тільки поточну сторінку
        updateCurrentPageOnly();
    })
    .catch(error => {
        console.error("Помилка при видаленні студента:", error);
        alert("Помилка при видаленні студента: " + error.message);
    });
}

// Нова функція для оновлення тільки поточної сторінки без зайвих запитів
function updateCurrentPageOnly() {
    const url = `${API_URL}&page=${current_page}&per_page=${students_per_page}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(response => {
            if (!response.students) {
                console.error("Невірний формат відповіді:", response);
                return;
            }
            
            // Оновлюємо дані сторінки
            students = response.students;
            total_pages = response.total_pages;
            current_page = response.page;
            
            // Оновлюємо відображення таблиці
            renderCurrentPageTable();
        })
        .catch(error => {
            console.error("Помилка при отриманні студентів:", error);
            alert("Помилка з'єднання з сервером: " + error.message);
        });
}

// Замінюємо update_table на більш спеціалізовану функцію для відображення
function renderCurrentPageTable() {
    let table_body = document.querySelector(".student_content table tbody");
    
    // Очищаємо таблицю перед відображенням нової сторінки
    table_body.innerHTML = "";

    if (!students || students.length === 0) {
        // Якщо немає студентів, показуємо повідомлення
        table_body.innerHTML = `<tr><td colspan="7" class="no-data">Немає студентів для відображення</td></tr>`;
        
        // Перевіряємо, чи потрібно оновити сторінку при порожньому результаті
        if (current_page > total_pages && total_pages > 0) {
            current_page = total_pages;
            updateCurrentPageOnly();
            return;
        }
    } else {
        // Відображаємо студентів поточної сторінки
        students.forEach((student, index) => {
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
                        <button onclick="edit_row('${student.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
                                <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                            </svg>
                        </button>

                        <button onclick="delete_row('${student.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
                                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                            </svg>  
                        </button>
                    </div>
                </td>
            `;
        });
    }
    
    update_pagination();
}

// Також потрібно змінити вихідну функцію fetchStudents для узгодженості
function fetchStudents() {
    updateCurrentPageOnly(); // Використовуємо нову функцію замість дублювання коду
}

// function save_student() {
//     let studentId = document.getElementById("save_student").getAttribute("data-id");
//     if (!studentId) {
//         alert("Помилка: ID студента не знайдено!");
//         return;
//     }

//     const studentData = {
//         id: studentId,
//         first_name: document.getElementById("student_first_name").value.trim(),
//         last_name: document.getElementById("student_last_name").value.trim(),
//         gender: document.getElementById("student_gender").value,
//         birthday: document.getElementById("student_birthday").value,
//         group: document.getElementById("student_group").value
//     };

//     fetch(API_URL, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(studentData)
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log("Студента оновлено:", data);
//         close_modal_window();
        
//         // Зберігаємо поточну сторінку і оновлюємо дані з сервера
//         fetch(`${API_URL}&page=${current_page}&per_page=${students_per_page}`)
//             .then(response => response.json())
//             .then(response => {
//                 students = response.students;
//                 total_pages = response.total_pages;
//                 // Не змінюємо current_page, щоб залишитись на поточній сторінці
//                 update_table();
//             })
//             .catch(error => console.error("Помилка оновлення після редагування:", error));
//     })
//     .catch(error => {
//         console.error("Помилка при оновленні студента:", error);
//         alert("Помилка при оновленні студента: " + error.message);
//     });
// }