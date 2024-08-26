# CulinaryGPT - server

## Description

This is a Node.js Express server application built with TypeScript that generates recipes using the OpenAI API. It uses MongoDB as the main database, firebase for image storage, zod for validation and Clerk for authentication.

## Features

- User authentication and authorization using Clerk
- Recipe generation using the OpenAI API
- CRUD operations for managing user-generated recipes
- MongoDB for storing recipes and user data
- Image storage with firebase
- Structured and scalable codebase

## Project Structure

```plaintext
├── src
│   ├── api
│   │   ├── controllers
│   │   ├── data-access
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── schemas
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