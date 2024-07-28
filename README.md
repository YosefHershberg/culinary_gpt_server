# CulinaryGPT - server

## Description

This is a Node.js Express server application built with TypeScript that generates recipes using the OpenAI API. It uses MongoDB as the database and Clerk for authentication. The project follows a clean, scalable, object-oriented, and layered architecture.

## Features

- User authentication and authorization using Clerk
- Recipe generation using the OpenAI API
- CRUD operations for managing user-generated recipes
- MongoDB for storing recipes and user data
- Structured and scalable codebase

## Prerequisites

- Node.js
- MongoDB
- Clerk account
- OpenAI API key

## Project Structure

```plaintext
├── src
│   ├── api
│   │   ├── controllers
│   │   ├── data-access
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── validations
│   │   └── webhooks
│   ├── interfaces
│   ├── lib
│   ├── utils
│   ├── index.ts
│   ├── middlewares.ts
│   └── app.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md