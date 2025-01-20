document.addEventListener("DOMContentLoaded", () => {
    const todoInput = document.querySelector(".todo-input");
    const todoDueDate = document.querySelector(".todo-due-date");
    const todoPriority = document.querySelector(".todo-priority");
    const todoBtn = document.querySelector(".todo-btn");
    const todoList = document.getElementById("todo-items");
    const themeDropdown = document.querySelector(".theme-dropdown");
    const todoSearch = document.querySelector(".todo-search");
    const todoFilter = document.querySelector(".todo-filter");

    // Add Task
    todoBtn.addEventListener("click", () => {
        const task = todoInput.value.trim();
        const dueDate = todoDueDate.value;
        const priority = todoPriority.value;
        if (task !== "") {
            addTask(task, dueDate, priority);
            todoInput.value = "";
            todoDueDate.value = "";
            todoPriority.value = "low";
        }
    });

    // Fetch and display tasks on page load
    fetchTodos();

    // Apply saved theme on page load
    const savedTheme = localStorage.getItem("theme") || "standard";
    applyTheme(savedTheme);
    themeDropdown.value = savedTheme;

    // Add event listener for theme dropdown
    themeDropdown.addEventListener("change", () => {
        const theme = themeDropdown.value;
        applyTheme(theme);
    });

    // Add event listeners for search and filter
    todoSearch.addEventListener("input", filterTasks);
    todoFilter.addEventListener("change", filterTasks);

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
    function addTask(task, dueDate, priority) {
        const date = new Date().toLocaleString();
        const newTodo = { task, date, dueDate, priority, completed: false };

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
        checkbox.addEventListener("change", () => toggleComplete(todo.task, span, completedSpan));

        // Task text
        const span = document.createElement("span");
        span.classList.add("task-text");
        if (todo.completed) {
            span.classList.add("completed");
        }
        span.textContent = todo.task;

        // Due Date
        const dueDateSpan = document.createElement("span");
        dueDateSpan.classList.add("task-due-date");
        dueDateSpan.textContent = `Due: ${todo.dueDate}`;

        // Priority
        const prioritySpan = document.createElement("span");
        prioritySpan.classList.add("task-priority");
        prioritySpan.textContent = `Priority: ${todo.priority}`;

        // Completed/Incomplete text
        const completedSpan = document.createElement("span");
        if (todo.completed) {
            completedSpan.classList.add("task-completed");
            completedSpan.textContent = "Completed";
        } else {
            completedSpan.classList.add("task-incomplete");
            completedSpan.textContent = "Incomplete";
        }

        // Button container
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");

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

        // Append buttons to container
        buttonContainer.appendChild(updateBtn);
        buttonContainer.appendChild(deleteBtn);

        // Append elements
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(dueDateSpan);
        li.appendChild(prioritySpan);
        li.appendChild(completedSpan);
        li.appendChild(buttonContainer);
        todoList.appendChild(li);
    }

    // Toggle Task Completion
    function toggleComplete(task, span, completedSpan) {
        fetch(`/api/todos/${task}`, {
            method: 'PUT'
        })
        .then(() => {
            span.classList.toggle("completed");
            if (span.classList.contains("completed")) {
                completedSpan.classList.remove("task-incomplete");
                completedSpan.classList.add("task-completed");
                completedSpan.textContent = "Completed";
            } else {
                completedSpan.classList.remove("task-completed");
                completedSpan.classList.add("task-incomplete");
                completedSpan.textContent = "Incomplete";
            }
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

    // Filter Tasks
    function filterTasks() {
        const searchText = todoSearch.value.toLowerCase();
        const filterValue = todoFilter.value;
        const todoItems = document.querySelectorAll(".todo-item");

        todoItems.forEach(item => {
            const taskText = item.querySelector(".task-text").textContent.toLowerCase();
            const isCompleted = item.querySelector(".task-checkbox").checked;
            const priority = item.querySelector(".task-priority").textContent.toLowerCase();

            let shouldDisplay = true;

            if (searchText && !taskText.includes(searchText)) {
                shouldDisplay = false;
            }

            if (filterValue === "completed" && !isCompleted) {
                shouldDisplay = false;
            } else if (filterValue === "incomplete" && isCompleted) {
                shouldDisplay = false;
            } else if (filterValue !== "all" && filterValue !== "completed" && filterValue !== "incomplete" && !priority.includes(filterValue)) {
                shouldDisplay = false;
            }

            item.style.display = shouldDisplay ? "flex" : "none";
        });
    }
});