window.onload = function() {
    show_content('student_content');
};

function show_content(content_id) {
    const content = document.querySelectorAll('.dashboard_content, .student_content, .task_content');

    content.forEach(content => content.classList.remove('active'));

    document.getElementById(content_id).classList.add('active');

    let btn = document.querySelectorAll(".navigation_btn button");
    btn.forEach(btn => btn.classList.remove("active_btn"));

    event.target.classList.add("active_btn");
};

function add_user() {
    let table = document.querySelector('.student_content table tbody');
    let new_row = table.insertRow();

    new_row.innerHTML = `
    <td><div><input type="checkbox"></div></td>
    <td><b>PZ-26</b></td>
    <td><b>John Doe</b></td>
    <td><b>Male</b></td>
    <td><b>01.01.2000</b></td>
    <td>
        <b>
            <svg
                viewBox="0 0 30 14"
                xmlns="http://www.w3.org/2000/svg"
                fill="#bfbfbf">
                <circle cx="15" cy="7" r="3" />
            </svg>
        </b>
    </td>
    <td>
        <div class="edit_btns">
            <button>
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
}

function delete_row(btn) {
    const row = btn.closest("tr");

    if (row) {
        row.remove();
    }
}