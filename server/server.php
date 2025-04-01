<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$students_file = "students.json";

// Функція для отримання студентів
function getStudents() {
    global $students_file;
    if (file_exists($students_file)) {
        $data = file_get_contents($students_file);
        $students = json_decode($data, true);
        return is_array($students) ? $students : [];
    }
    return [];
}

// Функція для збереження студентів
function saveStudents($students) {
    global $students_file;
    file_put_contents($students_file, json_encode($students, JSON_PRETTY_PRINT));
}

// Функція для генерації унікального ID
function generateUniqueId() {
    return uniqid("", true);
}

function validateStudentData($data) {
    if (empty($data["first_name"]) || empty($data["last_name"]) || empty($data["gender"]) || empty($data["birthday"]) || empty($data["group"])) {
        return 'All fields must be filled';
    }

    if (!preg_match("/^[А-Яа-яІіЇїЄєA-Za-z]+([-А-Яа-яІіЇїЄєA-Za-z]+)?$/u", $data["first_name"])) {
        return 'First name can contain only letters (Latin or Cyrillic), one hyphen is allowed';
    }

    if (!preg_match("/^[А-Яа-яІіЇїЄєA-Za-z]+(-[А-Яа-яІіЇїЄєA-Za-z]+)?$/u", $data["last_name"])) {
        return 'Last name can contain only letters (Latin or Cyrillic), one hyphen is allowed';
    }
    
    if (!in_array($data["gender"], ["Male", "Female"])) {
        return 'Gender must be "Male" or "Female"';
    }
    
    if (!preg_match("/^\d{4}-\d{2}-\d{2}$/", $data["birthday"])) {
        return 'Birthday must be in the format YYYY-MM-DD';
    }
        
    return null;
}

// Отримання HTTP-методу
$method = $_SERVER["REQUEST_METHOD"];

if ($method == "GET") {
    echo json_encode(getStudents());
    exit;
}

if ($method == "POST") {
    $input_data = json_decode(file_get_contents("php://input"), true);

    if (!is_array($input_data)) {
        echo json_encode(["error" => "Invalid data format"]);
        http_response_code(400);
        exit;
    }
    
    // Валідація даних нового студента
    $validation_errors = validateStudentData($input_data);
    if ($validation_errors) {
        echo json_encode(["errors" => $validation_errors]);
        http_response_code(400);
        exit;
    }

    $students = getStudents();
    $new_student = [
        "id" => generateUniqueId(),
        "first_name" => $input_data["first_name"],
        "last_name" => $input_data["last_name"],
        "gender" => $input_data["gender"],
        "birthday" => $input_data["birthday"],
        "group" => $input_data["group"]
    ];

    $students[] = $new_student;
    saveStudents($students);
    
    echo json_encode(["message" => "Student added", "student" => $new_student]);
    exit;
}

if ($method == "DELETE") {
    $input_data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($input_data["id"])) {
        echo json_encode(["error" => "ID not provided"]);
        http_response_code(400);
        exit;
    }

    $students = getStudents();
    $students = array_filter($students, function ($s) use ($input_data) {
        return $s["id"] != $input_data["id"];
    });

    saveStudents(array_values($students));

    echo json_encode(["message" => "Student deleted"]);
    exit;
}

if ($method == "PUT") {
    $input_data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($input_data["id"])) {
        echo json_encode(["error" => "ID not provided"]);
        http_response_code(400);
        exit;
    }

    // Валідація даних студента перед оновленням
    $validation_errors = validateStudentData($input_data);
    if ($validation_errors) {
        echo json_encode(["errors" => $validation_errors]);
        http_response_code(400);
        exit;
    }

    $students = getStudents();
    foreach ($students as &$student) {
        if ($student["id"] == $input_data["id"]) {
            $student["first_name"] = $input_data["first_name"];
            $student["last_name"] = $input_data["last_name"];
            $student["gender"] = $input_data["gender"];
            $student["birthday"] = $input_data["birthday"];
            $student["group"] = $input_data["group"];
            break;
        }
    }

    // Якщо студент не знайдений
    if (!$student) {
        echo json_encode(["error" => "Student not found"]);
        http_response_code(404);
        exit;
    }

    saveStudents($students);

    echo json_encode(["message" => "Student updated"]);
    exit;
}

?>
