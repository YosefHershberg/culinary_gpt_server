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

## Documentation

JSDoc is shown in various functions ans services and SwaggerUI is available for this application.
to create the swagger HTML file enter this command - 

```console
npm run docs
```

The Swagger UI will be available at http://localhost:5000/docs

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
│   ├── config
│   ├── interfaces
│   ├── lib
│   ├── utils
│   ├── index.ts
│   ├── middlewares.ts
│   └── app.ts
├── .env
├── package.json
├── tsconfig.json
├── jest.config.json
├── jsdoc.json
└── README.md