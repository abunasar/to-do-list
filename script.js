const inputBox = document.getElementById('inputBox');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');

const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

let editTodo = null;
let toastTimeout;

// Function to show toast
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Load todos on DOM Load
document.addEventListener('DOMContentLoaded', getLocalTodos);

const createTodoElement = (text, completed = false) => {
    const li = document.createElement("li");
    if (completed) {
        li.classList.add("completed");
    }

    // Check button
    const checkBtn = document.createElement("button");
    checkBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
    checkBtn.classList.add("btn", "checkBtn");
    checkBtn.setAttribute('title', 'Mark as complete');
    li.appendChild(checkBtn);

    const p = document.createElement("p");
    p.innerHTML = text;
    li.appendChild(p);

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
    editBtn.classList.add("btn", "editBtn");
    editBtn.setAttribute('title', 'Edit');
    li.appendChild(editBtn);

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteBtn.classList.add("btn", "deleteBtn");
    deleteBtn.setAttribute('title', 'Delete');
    li.appendChild(deleteBtn);

    return li;
};

// Function to add todo
const addTodo = () => {
    const inputText = inputBox.value.trim();
    if (inputText.length <= 0) {
        showToast("You must write something in your task");
        return false;
    }

    if (editTodo !== null) {
        // Editing existing todo
        const oldText = editTodo.querySelector('p').innerHTML;
        editLocalTodos(oldText, inputText);
        editTodo.querySelector('p').innerHTML = inputText;
        editTodo = null;
        
        // Reset button
        addBtn.innerHTML = 'Add Task';
        inputBox.value = "";
    } else {
        // Creating new todo
        const li = createTodoElement(inputText);
        todoList.appendChild(li);
        inputBox.value = "";
        
        saveLocalTodos(inputText);
    }
}

// Function to update : (Edit/Delete/Complete) todo
const updateTodo = (e) => {
    // Determine which button was clicked (or its child icon)
    let target = e.target;
    // If the icon was clicked, get the parent button
    if(target.tagName === 'I') {
        target = target.parentElement;
    }

    const li = target.parentElement;

    if (target.classList.contains('deleteBtn')) {
        // Delete
        li.classList.add('fadeOut');
        deleteLocalTodos(li.querySelector('p').innerHTML);
        setTimeout(() => {
            if(todoList.contains(li)) {
                todoList.removeChild(li);
            }
        }, 300); // Wait for fade out animation
    }

    if (target.classList.contains('editBtn')) {
        // Edit
        inputBox.value = li.querySelector('p').innerHTML;
        inputBox.focus();
        addBtn.innerHTML = 'Save Task';
        editTodo = li;
    }
    
    if (target.classList.contains('checkBtn')) {
        // Toggle complete
        li.classList.toggle('completed');
        toggleCompleteLocal(li.querySelector('p').innerHTML);
    }
}

// Local Storage Helper Functions
function getTodosFromLocal() {
    let todos;
    if (localStorage.getItem("todosData") === null) {
        // Migrate old string-based local storage to object-based if present
        if (localStorage.getItem("todos") !== null) {
            let oldTodos = JSON.parse(localStorage.getItem("todos"));
            todos = oldTodos.map(t => ({ text: t, completed: false }));
            localStorage.setItem("todosData", JSON.stringify(todos));
            localStorage.removeItem("todos"); // cleanup old
        } else {
            todos = [];
        }
    } else {
        todos = JSON.parse(localStorage.getItem("todosData"));
    }
    return todos;
}

// Function to save local todo
const saveLocalTodos = (todoText) => {
    let todos = getTodosFromLocal();
    todos.push({ text: todoText, completed: false });
    localStorage.setItem("todosData", JSON.stringify(todos));
}

// Function to get local todo
function getLocalTodos() {
    let todos = getTodosFromLocal();
    todos.forEach(todo => {
        const li = createTodoElement(todo.text, todo.completed);
        todoList.appendChild(li);
    });
}

// Function to delete local todo
const deleteLocalTodos = (todoText) => {
    let todos = getTodosFromLocal();
    todos = todos.filter(t => t.text !== todoText);
    localStorage.setItem("todosData", JSON.stringify(todos));
}

// Function to edit local todo
const editLocalTodos = (oldText, newText) => {
    let todos = getTodosFromLocal();
    const todoIndex = todos.findIndex(t => t.text === oldText);
    if(todoIndex !== -1) {
        todos[todoIndex].text = newText;
        localStorage.setItem("todosData", JSON.stringify(todos));
    }
}

// Function to toggle complete local todo
const toggleCompleteLocal = (todoText) => {
    let todos = getTodosFromLocal();
    const todoIndex = todos.findIndex(t => t.text === todoText);
    if(todoIndex !== -1) {
        todos[todoIndex].completed = !todos[todoIndex].completed;
        localStorage.setItem("todosData", JSON.stringify(todos));
    }
}

addBtn.addEventListener('click', addTodo);
todoList.addEventListener('click', updateTodo);

// Allow adding on enter key
inputBox.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});