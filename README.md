# Admin Panel

## Project Overview

This repository contains the codebase for an admin panel built with TypeScript and Node.js. While a detailed description wasn't initially provided, the project structure and file contents suggest it handles various administrative tasks, including managing files (berkas), chats, user data (data-diri), application paths (jalur), reports (laporan), payments (pembayaran), and announcements (pengumuman).

## Key Features & Benefits

Based on the file structure and provided code snippets, the admin panel likely offers the following features:

*   **User Authentication:**  Uses JWT tokens for authentication, allowing secure access to admin functionalities.
*   **File Management:** Enables administrators to manage files, likely including uploading, downloading, and updating files associated with users or other entities.
*   **Chat Functionality:** Includes a chat interface with APIs for receiving and sending messages, potentially integrated with a platform like WhatsApp.
*   **Data Management:** Provides interfaces for managing user data, application paths, payments, and other relevant information.
*   **Reporting:** Generates and manages reports related to various aspects of the system.
*   **Announcement Management:**  Allows administrators to create and manage announcements.
*   **API Endpoints:** Exposes a set of API endpoints for different admin functionalities.

## Prerequisites & Dependencies

Before setting up the project, ensure you have the following installed:

*   **Node.js:** Version 16 or higher recommended.
*   **npm or Yarn:**  Package managers for Node.js.
*   **MySQL:** A MySQL database server is required.
*   **TypeScript:** Although this is part of the development stack, it is typically managed by npm within the project.

## Installation & Setup Instructions

Follow these steps to install and set up the admin panel:

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd admin-panel
    ```

2.  **Install dependencies:**

    ```bash
    npm install  # or yarn install
    ```

3.  **Configure environment variables:**

    *   Create a `.env` file in the root directory (refer to `.env.backup` for example variables).
    *   Set the necessary environment variables, including:
        *   **Database connection details:** (e.g., `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`)
        *   **JWT secret key:** (e.g., `JWT_SECRET`)
        *   Other environment-specific configurations.

    Example `.env` file:

    ```
    DB_HOST=localhost
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=your_db_name
    JWT_SECRET=your_jwt_secret_key
    ```

4.  **Database Setup:**

    *   Create the database specified in your `.env` file (e.g., `your_db_name`).
    *   Run any necessary database migrations or seed scripts to set up the initial database schema. (Specific migration/seed details are not provided in the initial information and would depend on the used ORM/database management strategy.)

5.  **Run the application:**

    ```bash
    npm run dev # or yarn dev (if your package.json contains this script for development)
    ```

    This will start the development server, typically on `http://localhost:3000`.

## Usage Examples & API Documentation

The project includes several API endpoints under the `app/api/admin/` directory. Here are a few examples based on the provided code:

*   **GET `/api/admin/berkas`:** Retrieves a list of files (requires admin authentication). Example:

    ```javascript
    // JavaScript fetch example
    fetch('/api/admin/berkas', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}` // Replace authToken with the actual token
      }
    })
    .then(response => response.json())
    .then(data => console.log(data));
    ```

*   **PATCH `/api/admin/berkas/[id]`:** Updates a specific file (requires admin authentication). Example:

    ```javascript
    // JavaScript fetch example
    fetch(`/api/admin/berkas/${fileId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`, // Replace authToken with the actual token
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Update data here
      })
    })
    .then(response => response.json())
    .then(data => console.log(data));
    ```

*   **POST `/api/admin/chat/receive`:**  Receives a chat message (likely from WhatsApp).  This is an inbound API. Example (simulating a WhatsApp message reception):

    ```javascript
    // JavaScript fetch example (simulating the WhatsApp platform)
    fetch('/api/admin/chat/receive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: '1234567890',
        message: 'Hello from WhatsApp!',
        timestamp: new Date().toISOString()
      })
    })
    .then(response => response.json())
    .then(data => console.log(data));
    ```

*   **POST `/api/admin/chat/send`:** Sends a chat message. Example:

    ```javascript
    // JavaScript fetch example
    fetch('/api/admin/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: '1234567890',
        message: 'Hello!'
      })
    })
    .then(response => response.json())
    .then(data => console.log(data));
    ```

*   **PATCH `/api/admin/data-diri/[userId]`:** Updates user data (requires admin authentication). Example:

    ```javascript
    // JavaScript fetch example
    fetch(`/api/admin/data-diri/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`, // Replace authToken with the actual token
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // User data to update
      })
    })
    .then(response => response.json())
    .then(data => console.log(data));
    ```

## Configuration Options

The application's behavior can be configured through environment variables defined in the `.env` file. These variables control database connections, authentication secrets, and other environment-specific settings.

## Contributing Guidelines

Contributions are welcome! To contribute to the project, follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Implement your changes.
4.  Write tests to cover your changes.
5.  Submit a pull request.

Please ensure your code adheres to the project's coding standards and includes appropriate documentation.

## License Information

[MIT License](https://github.com/contact-iqbal/admin-panel/blob/main/LICENSE) legal 2025.

## Acknowledgments

This project utilizes the following technologies:

*   TypeScript
*   Node.js
*   Next.js
*   MySQL


