# Canteen Connect 

Canteen Connect is a full-stack web application designed to streamline canteen operations. It provides a seamless experience for both administrators managing the canteen and students placing orders. The frontend is built with React and Vite, and the backend is powered by Node.js, Express, and MongoDB.

## 🌟 Features

* **Dual Login System:** Separate authentication for administrators and students using JWT.
* **Menu Management:** Admins can view, add, update, and delete menu items through a dedicated dashboard.
* **Order Processing:** Students can browse the menu, place orders, and view their order history.
* **Admin Dashboard:** A central control panel for administrators to oversee menu items and manage incoming orders.
* **RESTful API:** A well-structured backend API for handling all application logic.

## 🛠️ Tech Stack

* **Frontend:**
    * React.js
    * Vite
    * Tailwind CSS
    * Lucide React (for icons)
* **Backend:**
    * Node.js
    * Express.js
    * MongoDB (with Mongoose)
* **Authentication:**
    * JSON Web Tokens (JWT)
    * bcrypt.js (for password hashing)

## 📂 Project Structure

The project is organized in a monorepo structure with two main directories: `client` and `server`.

├── client/         # React frontend application│   ├── src/│   │   ├── pages/  # Main page components (Login, Dashboard, etc.)│   │   └── ...│   └── vite.config.js # Vite config with proxy to the server│├── server/         # Node.js/Express backend API│   ├── controllers/  # Request handling logic│   ├── models/       # Mongoose schemas for the database│   ├── routes/       # API endpoint definitions│   ├── scripts/      # Seeding scripts for initial data│   └── index.js      # Main server entry point│└── package.json    # Dependencies for both client and server
## ⚙️ Setup and Installation

Follow these steps to get the project running locally.

### Prerequisites

* Node.js (v18 or newer)
* npm (or yarn)
* MongoDB (running locally or a connection URI from a service like MongoDB Atlas)

### 1. Backend Setup

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env` in the `server` directory and add the following variables. Replace the placeholder values with your own.

    ```env
    # A strong, secret key for signing JWTs
    JWT_SECRET=your_super_secret_key_123

    # Your MongoDB connection string
    MONGO_URI=mongodb://localhost:27017/canteenconnect
    ```

4.  **Seed the database (Optional):**
    To populate the database with an initial admin user and menu items, run the seeding scripts. You may need to add these scripts to your `server/package.json` file first:
    ```json
    "scripts": {
      "start": "node index.js",
      "seed:admin": "node scripts/seedAdmin.js",
      "seed:menu": "node scripts/seedMenu.js"
    }
    ```
    Then run the commands:
    ```bash
    npm run seed:admin
    npm run seed:menu
    ```

5.  **Start the backend server:**
    The server will run on `http://localhost:5000`.
    ```bash
    npm start
    ```

### 2. Frontend Setup

1.  **Navigate to the client directory from the root:**
    ```bash
    cd client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the frontend development server:**
    The React app will be available at `http://localhost:5173` (or another port if 5173 is busy).
    ```bash
    npm run dev
    ```

The client is configured with a proxy, so any API requests to `/api` will be automatically forwarded to the backend server at `http://localhost:5000`.

## 🔐 API Endpoints

The server exposes the following main API routes:

* **Authentication (`/api/auth`)**
    * `POST /login`: Admin login.
    * `POST /student-login`: Student login.
* **Menu Items (`/api/menu`)**
    * `GET /`: Get all menu items.
    * `POST /`: (Admin) Add a new menu item.
* **Orders (`/api/orders`)**
    * `GET /my-orders`: (Student) Get orders for the logged-in user.
    * `POST /`: (Student) Place a new order.
    * `GET /all-orders`: (Admin) Get all orders.
    * `PUT /:orderId/status`: (Admin) Update the status of an order.


