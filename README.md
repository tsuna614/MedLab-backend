# MedLab Backend

This is the backend server for my graduation thesis project, MedLab. It is built using:

* Node.js (Express.js)
* MongoDB (Mongoose)
* WebSocket (ws)
* Dockerized for easy deployment
* Other packages/libraries

---

## Requirements

* **Docker** (must be installed)

  * [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## Project Structure

```
.
├── controllers/        # Controller logic
├── middleware/         # Middlewares
├── models/             # Mongoose models
├── routes/             # API routes
├── utils/              # Utilities
├── .env                # Environment variables (provided separately)
├── Dockerfile          # Docker build file
├── docker-compose.yml  # Docker Compose for running the app
├── package.json
└── server.js           # Main entry point
```

---

## Environment Variables (.env)

```
PORT=3000
MONGODB_URI="mongodb+srv://thedarkspiritaway:jHH4PtU7sB7d9vq4@kltn.ymtqa.mongodb.net/?retryWrites=true&w=majority&appName=KLTN"
# ACCESS-TOKEN
ACCESS_TOKEN_LIFE=72h
ACCESS_TOKEN_SECRET="access-token-secret"
REFRESH_TOKEN_SECRET="refresh-token-secret"
```

> Please create an `.env` file and paste the content above into the root directory before running the server.

---

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Place the `.env` file

Put the provided `.env` file into the root directory of the project.

### 3. Build and run using Docker Compose

```bash
docker-compose up --build
```

This will:

* Build the Docker image
* Run the container
* Automatically start the backend server

The server will be accessible at `http://localhost:3000`.

---

## For Troubleshooting

* Make sure Docker is installed and running.
* Ensure that the `.env` file exists in the root directory.
* If you face any issues, feel free to contact me via nqkhanh@gmail.com
