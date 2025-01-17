document.addEventListener("DOMContentLoaded", () => {
    const todoInput = document.querySelector(".todo-input");
    const todoBtn = document.querySelector(".todo-btn");
    const todoList = document.getElementById("todo-items");
    const themeButtons = document.querySelectorAll(".theme-btn");

    // Add Task
    todoBtn.addEventListener("click", () => {
        const task = todoInput.value.trim();
        if (task !== "") {
            addTask(task);
            todoInput.value = "";
        }
    });

    // Fetch and display tasks on page load
    fetchTodos();

    // Apply saved theme on page load
    const savedTheme = localStorage.getItem("theme") || "standard";
    applyTheme(savedTheme);

    // Add event listeners for theme buttons
    themeButtons.forEach(button => {
        button.addEventListener("click", () => {
            const theme = button.getAttribute("data-theme");
            applyTheme(theme);
        });
    });

    function fetchTodos() {
        fetch('/api/todos')
            .then(response => response.json())
            .then(todos => {
                todos.forEach(todo => {
                    createTodoElement(todo);
                });
            });
    }

    // Add Task Function
    function addTask(task) {
        const date = new Date().toLocaleString();
        const newTodo = { task, date, completed: false };

        fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTodo)
        })
        .then(response => response.json())
        .then(todo => {
            createTodoElement(todo);
        });
    }

    function createTodoElement(todo) {
        const li = document.createElement("li");
        li.classList.add("todo-item");

        // Checkbox for task completion
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("task-checkbox");
        checkbox.checked = todo.completed;
        checkbox.addEventListener("change", () => toggleComplete(todo.task, span));

        // Task text
        const span = document.createElement("span");
        span.classList.add("task-text");
        if (todo.completed) {
            span.classList.add("completed");
        }
        span.textContent = todo.task;

        // Date
        const dateSpan = document.createElement("span");
        dateSpan.classList.add("task-date");
        dateSpan.textContent = ` (Added on: ${todo.date})`;

        // Update button
        const updateBtn = document.createElement("button");
        updateBtn.textContent = "Update";
        updateBtn.classList.add("update-btn");
        updateBtn.addEventListener("click", () => updateTask(span, todo.task));

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", () => deleteTask(todo.task, li));

        // Append elements
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(dateSpan);
        li.appendChild(updateBtn);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    }

    // Toggle Task Completion
    function toggleComplete(task, span) {
        fetch(`/api/todos/${task}`, {
            method: 'PUT'
        })
        .then(() => {
            span.classList.toggle("completed");
        });
    }

    // Update Task
    function updateTask(span, oldTask) {
        const newTask = prompt("Update your task:", span.textContent);
        if (newTask !== null && newTask.trim() !== "") {
            fetch(`/api/todos/${oldTask}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ task: newTask })
            })
            .then(() => {
                span.textContent = newTask.trim();
            });
        }
    }

    // Delete Task
    function deleteTask(task, li) {
        fetch(`/api/todos/${task}`, {
            method: 'DELETE'
        })
        .then(() => {
            li.remove();
        });
    }

    // Apply Theme
    function applyTheme(theme) {
        document.body.className = theme;
        localStorage.setItem("theme", theme);
    }
});