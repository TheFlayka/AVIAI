# <center>AVIAI</center>

Are you a marketing professional who wants to make their life easier? You found right repository. This project helps to write AI answers to reviews on Yandex Maps. Just press the button "answer" and after a few minutes you will get answers on all the latest reviews.

## Paragraphs:

1. [What does "AVIAI" mean?](#1-what-does-aviai-mean)
2. [The main idea of project](#2-the-main-idea-of-project)
3. [Stack & Architecture](#3-stack--architecture)
4. [Installing](#4-installing)
5. [Future of project](#5-future-of-project)

## 1. What does "AVIAI" mean??
It is combination of **Avis** (French for *"Review"*) + **AI** (*Artificial Intelligence*).

## 2. The main idea of project

The main idea is helping people to write answers to reviews without spending time on it. AI will write answer and you don't have to write this manual. It saves time for others actions.  
It will be helpful for people who have a small company and don't want to spend time.

## 3. Stack & Architecture

In this project I used different dependencies.

### Core of project:

* Bun
* Typescript
* Hono (instead Express.js)

### Database

* PostgreSQL
* Prisma (ORM, connection with Database)

### Temporary database(Workers, Queue)

* Redis (ioredis)
* bullmq (workers & queues)

### Additional dependencies

* Valibot (validation)
* Google GENAI (Gemini)

### Code syntax and format

* ESLint
* Prettier

## 4. Installing

Before all, you must to create docker containers for Redis and Postgres:  
`docker compose up -d`

After that, you must to set environmental variables in `.env`:

```
- DATABASE_URL=
- JWT_SECRET= (You must to create it)
- GOOGLE_GENAI_API_KEY= (from Google AI Studio)
- REDIS_HOST=
- REIDS_PORT=
- PORT= (of porject)
```

After creating containers and setting variables in `.env` you must to install all dependencies by commands:

`bun install`  

Finally, you can work with project.

### All commands:
* Start in dev status: `bun dev`
* Build project: `bun build`
* Start project(index.ts): `bun start`
* Lint code(ESLint): `bun lint`
* Fix code(ESLint): `bun lint:fix`
* Prettier: `bun prettier`

## 5. Future of project
Firstly, I might create frontend-side, but it will not be soon because of other projects. There only backend-side, but it work successful and in Wiki you can find API pattern to work or experiment with it.