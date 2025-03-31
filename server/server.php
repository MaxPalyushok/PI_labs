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
    return uniqid("", true); // Генерує унікальний рядковий ідентифікатор
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
        echo json_encode(["error" => "Неправильний формат даних"]);
        http_response_code(400);
        exit;
    }

    $students = getStudents();
    $new_student = [
        "id" => generateUniqueId(),
        "first_name" => $input_data["first_name"] ?? "",
        "last_name" => $input_data["last_name"] ?? "",
        "gender" => $input_data["gender"] ?? "",
        "birthday" => $input_data["birthday"] ?? "",
        "group" => $input_data["group"] ?? ""
    ];

    $students[] = $new_student;
    saveStudents($students);
    
    echo json_encode(["message" => "Студент доданий"]);
    exit;
}

if ($method == "DELETE") {
    $input_data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($input_data["id"])) {
        echo json_encode(["error" => "ID не вказано"]);
        http_response_code(400);
        exit;
    }

    $students = getStudents();
    $students = array_filter($students, function ($s) use ($input_data) {
        return $s["id"] != $input_data["id"];
    });

    saveStudents(array_values($students));

    echo json_encode(["message" => "Студент видалений"]);
    exit;
}

if ($method == "PUT") {
    $input_data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($input_data["id"])) {
        echo json_encode(["error" => "ID не вказано"]);
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
    saveStudents($students);

    echo json_encode(["message" => "Студент оновлений"]);
    exit;
}

?>
