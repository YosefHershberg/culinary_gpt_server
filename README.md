# CulinaryGPT - server

## Description

This is a Node.js Express server application that generates recipes using the OpenAI API. It uses MongoDB as the main database, firebase for image storage, zod for validation and Clerk for authentication. 
This application is build in a layered and clean architecture to allow easy maintainability, scalability, team-work etc.
This application is deployed on AWS with a CI/CD pipeline with Github Actions and tested with jest (controllers & services).

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

## Get Started

To install the dependencies run - 

```console
npm install
```

To start the server run - 

```console
npm start
```

To run development server -

```console
npm run dev
```

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