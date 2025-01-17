const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/todos', (req, res) => {
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading data');
        }
        res.json(JSON.parse(data));
    });
});

app.post('/api/todos', (req, res) => {
    const newTodo = {
        task: req.body.task,
        date: req.body.date,
        completed: req.body.completed
    };
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading data');
        }
        const todos = JSON.parse(data);
        todos.push(newTodo);
        fs.writeFile('data.json', JSON.stringify(todos), (err) => {
            if (err) {
                return res.status(500).send('Error saving data');
            }
            res.status(201).json(newTodo);
        });
    });
});

app.delete('/api/todos/:task', (req, res) => {
    const taskToDelete = req.params.task;
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading data');
        }
        let todos = JSON.parse(data);
        todos = todos.filter(todo => todo.task !== taskToDelete);
        fs.writeFile('data.json', JSON.stringify(todos), (err) => {
            if (err) {
                return res.status(500).send('Error saving data');
            }
            res.status(200).send('Todo deleted');
        });
    });
});

app.put('/api/todos/:task', (req, res) => {
    const taskToUpdate = req.params.task;
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading data');
        }
        let todos = JSON.parse(data);
        todos = todos.map(todo => {
            if (todo.task === taskToUpdate) {
                if (req.body.task) {
                    todo.task = req.body.task;
                } else {
                    todo.completed = !todo.completed;
                }
            }
            return todo;
        });
        fs.writeFile('data.json', JSON.stringify(todos), (err) => {
            if (err) {
                return res.status(500).send('Error saving data');
            }
            res.status(200).send('Todo updated');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});