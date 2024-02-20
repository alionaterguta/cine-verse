# Project Overview:

The  web application  will  provide  users  with  access  to  information  about  different  
movies,   directors,   and  genres.  Users  will  be  able  to  sign  up,   update  their  
personal  information,   and  create  a  list  of  their  favorite  movies. 

## Getting Started
To run this API locally, you'll need to follow these steps:

### Prerequisites
Before you begin, make sure you have the following installed on your local machine:

* **Node.js:** Download and install Node.js
* **MongoDB:** Install MongoDB

### Installation
  1. Clone the repository to your local machine:
     
    git clone https://github.com/alionaterguta/cine-verse.git
    
  1. Navigate to the project directory:
     
    cd <project-directory>
    
  3. Install dependencies using npm. For the list of dependencies, refer to the `package.json` file.

    npm install

### Configuration

**Development**

  1. Create a `.env` file in the root directory of the project.

  2. Add the following MongoDB environment variables to the `.env` file: 

    CONNECTION_URI="<your-mongodb-uri>"

  3. Add the following Express.js environment variables to the `.env` file:

    PORT=8080

**Production**
  1. Add the following MongoDB environment variables to the connection settings of your cloud application.

  2. Replace `<your-mongodb-uri>` with your actual MongoDB URI provided by MongoDB Atlas or any other MongoDB hosting service you are using.

  3. Use `process.env.CONNECTION_URI` in your code to access the MongoDB URI. Here's an example of how you can connect to MongoDB using Mongoose:

    const mongoose = require('mongoose');
    mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

 * **Note:** By following these steps, you can set up your own MongoDB connection securely without exposing sensitive information in the codebase.
 
### Running the API

   1. Start the server:

    npm start

   2. The API will be running locally at http://localhost:8080.
    
### Testing

You can test the API endpoints using tools like Postman.

## Endpoints Documentation 

All available endpoints along with their descriptions can be viewed https://cine-verse-b8832aa84c3e.herokuapp.com/documentation/ or `documentation.html` file.

## Authentication

All endpoints are protected except for `/`. To access them, users must first create an account.

In Postman, call the endpoint by replacing `http://localhost:8080/` with your local port number.

  **POST** (http://localhost:8080/users)

Go to the **Body** section and create an account in JSON format using this model:

    {
     "UserName": "UserName",
     "Email": "user@email.com",
     "Password": "password8765",
     "Birthdate": "YYYY-MM-DD"
    }

After an user account has been created,

**POST** /login 

you will log in with the username and password you created. This time, go to the **Params** section. 
Check the snippet below.

![image](https://github.com/alionaterguta/cine-verse/assets/71376066/98427959-946b-4798-8fd9-6eeb7c82f5f2)
- Image: Postman
  
After authentication, you will obtain a Token. When accessing other endpoints, copy the Token and go to **Authorization**. 
Choose **Bearer Token** from the **Type** dropdown and paste the copied token into the given field.

![image](https://github.com/alionaterguta/cine-verse/assets/71376066/c02ed958-4f1b-49e0-9b39-f9a5abd201c3)
- Image: Postman

