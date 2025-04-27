<?php
// Підключення конфігурації бази даних
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Отримання URI запиту
$request_uri = $_SERVER['REQUEST_URI'];
$uri_parts = explode('/', trim(parse_url($request_uri, PHP_URL_PATH), '/'));

// Знаходження індексу "students" у URI
$students_index = array_search('students', $uri_parts);
$resource_id = null;

// Перевірка, чи є ID ресурсу після "students" в URI
if ($students_index !== false && isset($uri_parts[$students_index + 1])) {
    $resource_id = $uri_parts[$students_index + 1];
}

$request_method = $_SERVER['REQUEST_METHOD'];

switch ($request_method) {
    case 'GET':
        if ($resource_id) {
            getStudent($resource_id);
        } else {
            getStudents();
        }
        break;
    case 'POST':
        addStudent();
        break;
    case 'PUT':
        if ($resource_id) {
            updateStudent($resource_id);
        } else {
            response(400, 'Bad Request', 'Student ID not provided in URL');
        }
        break;
    case 'DELETE':
        if ($resource_id) {
            deleteStudent($resource_id);
        } else {
            response(400, 'Bad Request', 'Student ID not provided in URL');
        }
        break;
    default:
        response(405, 'Method Not Allowed', 'Invalid request method');
        break;
}

function validateStudentData($data, $required = true) {
    $errors = array();
    
    if ($required) {
        $required_fields = array('first_name', 'last_name', 'gender', 'birthday', 'student_group');
        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                $errors[] = "Field '$field' is required";
            }
        }
    }
    
    if (!empty($errors)) {
        return $errors;
    }
    
    if (isset($data['first_name'])) {
        if (strlen($data['first_name']) < 2 || strlen($data['first_name']) > 50) {
            $errors[] = "First name must be between 2 and 50 characters";
        }
        if (!preg_match('/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\'\s-]+$/u', $data['first_name'])) {
            $errors[] = "First name contains invalid characters";
        }
    }
    
    if (isset($data['last_name'])) {
        if (strlen($data['last_name']) < 2 || strlen($data['last_name']) > 50) {
            $errors[] = "Last name must be between 2 and 50 characters";
        }
        if (!preg_match('/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\'\s-]+$/u', $data['last_name'])) {
            $errors[] = "Last name contains invalid characters";
        }
    }
    
    if (isset($data['gender'])) {
        $valid_genders = array('Male', 'Female', 'Other');
        if (!in_array($data['gender'], $valid_genders)) {
            $errors[] = "Gender must be one of: " . implode(", ", $valid_genders);
        }
    }
    
    if (isset($data['birthday'])) {
        $date_format = 'Y-m-d';
        $birthday = DateTime::createFromFormat($date_format, $data['birthday']);
        
        if (!$birthday || $birthday->format($date_format) !== $data['birthday']) {
            $errors[] = "Birthday must be in format YYYY-MM-DD";
        } else {
            $today = new DateTime();
            if ($birthday > $today) {
                $errors[] = "Birthday cannot be in the future";
            }
        }
    }
    
    if (isset($data['student_group'])) {
        if (strlen($data['student_group']) < 2 || strlen($data['student_group']) > 20) {
            $errors[] = "Student group must be between 2 and 20 characters";
        }
        if (!preg_match('/^[a-zA-Z0-9а-яА-ЯіІїЇєЄґҐ\'\s-]+$/u', $data['student_group'])) {
            $errors[] = "Student group contains invalid characters";
        }
    }
    
    return $errors;
}

function getStudents() {
    global $conn;
    
    $page = isset($_GET['page']) ? filter_var($_GET['page'], FILTER_VALIDATE_INT) : 1;
    $per_page = isset($_GET['per_page']) ? filter_var($_GET['per_page'], FILTER_VALIDATE_INT) : 8;
    
    if ($page === false || $page < 1) {
        $page = 1;
    }
    
    if ($per_page === false || $per_page < 1 || $per_page > 100) {
        $per_page = 8;
    }
    
    $offset = ($page - 1) * $per_page;
    
    // Запит для підрахунку загальної кількості студентів
    $count_result = $conn->query("SELECT COUNT(*) as total FROM students");
    $count_row = $count_result->fetch_assoc();
    $total = $count_row['total'];
    
    $total_pages = ceil($total / $per_page);
    
    // Запит для студентів з пагінацією
    $sql = "SELECT id, first_name, last_name, gender, birthday, student_group FROM students ORDER BY id LIMIT $offset, $per_page";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $students = array();
        while ($row = $result->fetch_assoc()) {
            $students[] = $row;
        }
        
        // Підготовка даних пагінації
        $pagination = array(
            'total' => $total,
            'per_page' => $per_page,
            'current_page' => $page,
            'total_pages' => $total_pages
        );
        
        response(200, 'Success', null, array(
            'students' => $students,
            'pagination' => $pagination
        ));
    } else {
        response(200, 'Success', null, array(
            'students' => array(),
            'pagination' => array(
                'total' => 0,
                'per_page' => $per_page,
                'current_page' => 1,
                'total_pages' => 0
            )
        ));
    }
}

function getStudent($id) {
    global $conn;
    
    if (empty($id) || !is_string($id)) {
        response(400, 'Bad Request', 'Invalid student ID');
        return;
    }
    
    $id = $conn->real_escape_string($id);
    $sql = "SELECT * FROM students WHERE id = '$id'";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $student = $result->fetch_assoc();
        response(200, 'Success', null, $student);
    } else {
        response(404, 'Not Found', 'Student not found');
    }
}

function addStudent() {
    global $conn;
    
    $json_data = file_get_contents('php://input');
    if (empty($json_data)) {
        response(400, 'Bad Request', 'No data provided');
        return;
    }
    
    $data = json_decode($json_data, true);
    if ($data === null) {
        response(400, 'Bad Request', 'Invalid JSON format');
        return;
    }
    
    $validation_errors = validateStudentData($data);
    if (!empty($validation_errors)) {
        response(400, 'Validation Error', implode(", ", $validation_errors));
        return;
    }
    
    $first_name = $conn->real_escape_string($data['first_name']);
    $last_name = $conn->real_escape_string($data['last_name']);
    $gender = $conn->real_escape_string($data['gender']);
    $birthday = $conn->real_escape_string($data['birthday']);
    $student_group = $conn->real_escape_string($data['student_group']);
    
    $sql = "INSERT INTO students (first_name, last_name, gender, birthday, student_group) 
            VALUES ('$first_name', '$last_name', '$gender', '$birthday', '$student_group')";
    
    if ($conn->query($sql) === TRUE) {
        $data['id'] = $conn->insert_id;
        
        response(201, 'Created', 'Student added successfully', $data);
    } else {
        response(500, 'Internal Server Error', $conn->error);
    }
}

function updateStudent($id) {
    global $conn;
    
    $json_data = file_get_contents('php://input');
    if (empty($json_data)) {
        response(400, 'Bad Request', 'No data provided');
        return;
    }
    
    $data = json_decode($json_data, true);
    if ($data === null) {
        response(400, 'Bad Request', 'Invalid JSON format');
        return;
    }

    $id = $conn->real_escape_string($id);
    
    $validation_errors = validateStudentData($data, false);
    if (!empty($validation_errors)) {
        response(400, 'Validation Error', implode(", ", $validation_errors));
        return;
    }
    
    $updates = array();
    
    if (isset($data['first_name'])) {
        $first_name = $conn->real_escape_string($data['first_name']);
        $updates[] = "first_name = '$first_name'";
    }
    
    if (isset($data['last_name'])) {
        $last_name = $conn->real_escape_string($data['last_name']);
        $updates[] = "last_name = '$last_name'";
    }
    
    if (isset($data['gender'])) {
        $gender = $conn->real_escape_string($data['gender']);
        $updates[] = "gender = '$gender'";
    }
    
    if (isset($data['birthday'])) {
        $birthday = $conn->real_escape_string($data['birthday']);
        $updates[] = "birthday = '$birthday'";
    }
    
    if (isset($data['student_group'])) {
        $student_group = $conn->real_escape_string($data['student_group']);
        $updates[] = "student_group = '$student_group'";
    }
    
    if (empty($updates)) {
        response(400, 'Bad Request', 'No fields to update');
        return;
    }
    
    $sql = "UPDATE students SET " . implode(", ", $updates) . " WHERE id = '$id'";
    
    if ($conn->query($sql) === TRUE) {
        if ($conn->affected_rows > 0) {
            $data['id'] = $id;
            response(200, 'Success', 'Student updated successfully', $data);
        } else {
            response(404, 'Not Found', 'Student not found');
        }
    } else {
        response(500, 'Internal Server Error', $conn->error);
    }
}

function deleteStudent($id) {
    global $conn;

    if (empty($id) || !is_string($id)) {
        response(400, 'Bad Request', 'Invalid student ID');
        return;
    }
    
    $id = $conn->real_escape_string($id);
    
    $sql = "DELETE FROM students WHERE id = '$id'";
    
    if ($conn->query($sql) === TRUE) {
        if ($conn->affected_rows > 0) {
            response(200, 'Success', 'Student deleted successfully');
        } else {
            response(404, 'Not Found', 'Student not found');
        }
    } else {
        response(500, 'Internal Server Error', $conn->error);
    }
}

function response($status_code, $status, $message = null, $data = null) {
    http_response_code($status_code);
    
    $response = array(
        'status' => $status,
        'timestamp' => date('Y-m-d H:i:s')
    );
    
    if ($message !== null) {
        $response['message'] = $message;
    }
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    exit;
}
?>