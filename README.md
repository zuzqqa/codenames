<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="./codenames-frontend/src/assets/images/logo.png" alt="Project logo"></a>
</p>

<h1 align="center">Codenames - Distributed Game Project</h1>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![issues - codenames](https://img.shields.io/github/issues/zuzqqa/codenames)](https://github.com/zuzqqa/codenames/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/zuzqqa/codenames.svg)](https://github.com/zuzqqa/codenames/pulls)
[![GitHub tag](https://img.shields.io/github/tag/zuzqqa/codenames?include_prereleases=&sort=semver&color=green)](https://github.com/zuzqqa/codenames/releases/)
[![License](https://img.shields.io/badge/License-MIT-green)](https://github.com/zuzqqa/codenames/blob/main/LICENSE)

</div>

---

<p align="center"> A distributed implementation of the popular board game "Codenames" created as a group project for the Gdańsk University of Technology. 
    <br> 
</p>

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Deployment](#deployment)
- [Usage](#usage)
- [Built Using](#built_using)
- [Authors](#authors)
- [Environment variables](#environment_variables)
- [Acknowledgments](#acknowledgement)

## 🧐 About <a name = "about"></a>

Codenames is a distributed game inspired by the popular board game **"Codenames"** (Tajniacy). This project is being developed as part of a group project for the **Gdańsk University of Technology**. The current version includes both a frontend (React with TypeScript) and a backend (Spring Boot) that can communicate over a network to simulate the gameplay.

In the future, we plan to expand this application into a mobile version and possibly integrate with other platforms.

## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will help you get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before running the project, make sure you have the following installed:
* Docker - For containerization of both backend and frontend applications.
* Docker Compose - For running the applications locally using Docker.

Install Docker and Docker Compose if you haven't already:

```
https://www.docker.com/get-started
```

### Installing

To get the project up and running locally, follow these steps:

1. Clone the repository

```
git clone https://github.com/zuzqqa/codenames.git
cd codenames
```

2. Set up the .env file in the root directory to define necessary environment variables (see [Environment Variables](#-environment-variables)).

3. Set up the .env.local file in the `/codenames-frontend/` directory to define necessary environment variables (see [Environment Variables](#-environment-variables)).

4. Set up the .env file in the `/codenames-backend/` directory to define necessary environment variables (see [Environment Variables](#-environment-variables)). 

3. Run the application using Docker Compose:

```
docker-compose up --build
```

The backend and frontend should now be running locally. You can access the frontend at http://localhost:5173 and the backend will be available through its API.

## 🔧 Running the tests <a name = "tests"></a>

Currently, there are unit an integration tests for backend available. 

To run the tests you can use this commands:
- for unit tests:
  - `mvn test -Dtest="**/unitTests/*.java"`
- for integration tests:
  - `mvn test -Dtest="**/integrationTests/*.java"`

## 🎈 Usage <a name="usage"></a>

To start the game, open the frontend application in your browser. The gameplay will be conducted between multiple players, with the game logic managed by the backend.

## 🚀 Deployment <a name = "deployment"></a>

The most recent releases of the frontend and backend are available as Docker images on Docker Hub. You can find them under the following links:

* [Frontend Docker Image] (https://hub.docker.com/r/codenames/codenames-frontend)
* [Backend Docker Image] (https://hub.docker.com/r/codenames/codenames-backend)

In the future, we will deploy the application to cloud platforms such as AWS, Azure, or Google Cloud.

## 🌍 Environment Variables <a name = "environment_variables"></a>

The following environment variables are required to run the project:

* SECRET: JWT secret key for token generation (needed for secure authentication).
* SPRING_MAIL_USERNAME: Username for sending emails.
* SPRING_MAIL_PASSWORD: Password for the mail account.
* MONGO_INITDB_ROOT_USERNAME: Root username for MongoDB initialization.
* MONGO_INITDB_ROOT_PASSWORD: Root password for MongoDB initialization.
* VITE_GOOGLE_CLIENT_ID: Google Client ID used to authorize users with Google OAuth 2.0.
* GOOGLE_CLIENT_ID: Google Client ID used to authorize users with Google OAuth 2.0.
* GOOGLE_CLIENT_SECRET: OAuth 2.0 key used to authorize and exchange tokens in the authorization processes using Google.

Create a `.env` file in the root directory of the project and define these variables as follows:

```
SECRET=your_jwt_secret_key
SPRING_MAIL_USERNAME=your_email_username
SPRING_MAIL_PASSWORD=your_email_password
MONGO_INITDB_ROOT_USERNAME=your_mongo_root_username
MONGO_INITDB_ROOT_PASSWORD=your_mongo_root_password
```

Create a `.env.local` file in the `/codenames-frontend/` directory and define these variables as follows:

```
VITE_GOOGLE_CLIENT_ID=your_google_clientid
```

Create a `.env` file in the `/codenames-backend/` directory and define these variables as follows:

```
SECRET=your_jwt_secret_key
SPRING_MAIL_USERNAME=your_email_username
SPRING_MAIL_PASSWORD=your_email_password
MONGO_INITDB_ROOT_USERNAME=your_mongo_root_username
MONGO_INITDB_ROOT_PASSWORD=your_mongo_root_password
GOOGLE_CLIENT_ID=your_google_clientid
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Alternatively, you can set these variables directly in your system as environment variables.

## ⛏️ Built Using <a name = "built_using"></a>

* [MongoDB](https://www.mongodb.com/) - NoSQL Database
* [Spring Boot](https://spring.io/projects/spring-boot) - Backend Framework
* [React](https://react.dev/) - Frontend Framework
* [Docker](https://www.docker.com/) - Containerization
* [Docker Compose](https://docs.docker.com/compose/) - Multi-container Docker applications
* [JUnit 5](https://junit.org/junit5/) - Testing framework for Java and the JVM

## ✍️ Authors <a name = "authors"></a>

* [Zuzanna Nowak](https://github.com/zuzqqa) - Project Lead
* [Agata Domasik](https://github.com/agatadomasik)
* [Adam Chabraszewski](https://github.com/achabrasz)
* [Jakub Walasik](https://github.com/jwalasik3)

See also the list of [contributors](https://github.com/zuzqqa/codenames/contributors) who participated in this project.
