Николаева Т.Д. 2304, Ефремов А.Д. 2304
# Запуск 

`docker-compose up`

### Для запуска docker-compose необходим файл .env:

`
SERVER_PORT=3000 # порт
POSTGRES_USER=user # пользователь бдшки
POSTGRES_PASSWORD=password # пароль пользователя
POSTGRES_DB=todos_db # бд
DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?schema=public
`
