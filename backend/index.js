const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.SERVER_PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Создание пула соединений с базой данных
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Функция для подключения к базе данных с повторными попытками
async function connectWithRetry() {
    let connected = false;
    while (!connected) {
        try {
            await pool.connect();
            connected = true;
            console.log('Подключение к базе данных успешно!');
        } catch (err) {
            console.error('Ошибка подключения к базе данных. Повторная попытка через 5 секунд...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

// Функция для выполнения миграций
async function migrate() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      task VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

    try {
        await pool.query(createTableQuery);
        console.log('Миграции выполнены: таблица "todos" создана или уже существует.');
    } catch (err) {
        console.error('Ошибка при выполнении миграций:', err);
    }
}

// Запуск сервера и выполнение миграций
async function startServer() {
    await connectWithRetry(); // Подключение к базе данных
    await migrate();          // Выполнение миграций

    // Запуск сервера после успешного подключения и выполнения миграций
    app.listen(port, () => {
        console.log(`Сервер запущен на порту ${port}`);
        console.log(`Вы можете зайти на страницу по адресу http://localhost:${port}/`);
    });
}


// Получение списка дел
app.get('/todos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todos');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при получении списка дел');
    }
});

// Добавление нового дела
app.post('/todos', async (req, res) => {
    const { task } = req.body;
    try {
        const result = await pool.query('INSERT INTO todos(task) VALUES($1) RETURNING *', [task]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при добавлении дела');
    }
});

// Удаление дела
app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM todos WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при удалении дела');
    }
});

// Запуск приложения
startServer();
