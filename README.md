# FamilyMap

A modern, theme-aware web application for building, visualizing, and sharing your family's history. Connect with family members, create family trees, and manage cherished photo albums in a beautiful, customizable interface.

## 🌟 Features

### Family Groups & Members
* **Create & Manage Groups:** Easily set up and manage multiple family groups.
* **Invite Members:** Invite new members to your groups via email.
* **Member Management:** Add, edit, and remove members from a group's family tree.

### Dynamic Family Tree
* **Tree Visualization:** Build and explore a dynamic family tree associated with each group.
* **Member Details:** View detailed profiles for each family member in the tree.

### Photo Albums
* **Group Albums:** Create dedicated photo albums for each family group.
* **Photo Management:** Upload and organize photos within albums.
* **Optimized Display:** Album covers are styled to ensure text visibility, even with busy or dark images.

### Analytics Chatbot
* **AI-Powered Queries:** Interact with an AI chatbot to ask natural language questions about your family tree data (e.g., "Who is the partner of John?").

### User Experience
* **Theme-Aware UI:** The entire application is built with DaisyUI, allowing for seamless theme switching (e.g., Light, Dark, Retro). All components automatically adapt to the chosen theme.
* **Full-Screen Layout:** The core application content is designed to fill the entire screen, providing an immersive and distraction-free experience.
* **Secure Authentication:** User registration and login are handled securely, with protected routes to ensure data privacy.
* **Global Notifications:** Uses `react-hot-toast` for clean, simple toast notifications.

## 🛠️ Technical Stack

* **Frontend:**
    * **React:** A component-based JavaScript library for building the user interface.
    * **Vite:** A fast build tool for modern web development.
* **Styling:**
    * **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
    * **DaisyUI:** A Tailwind CSS component library that provides built-in themes and theme-aware components.
* **State Management:**
    * **Zustand:** A lightweight and performant state management solution.
* **Routing:**
    * **React Router:** Declarative routing for React.
* **API Communication:**
    * **Axios:** A promise-based HTTP client for making API requests.
* **Icons:**
    * **React Icons:** A library providing popular icon sets.

## 🚀 Getting Started

To get a local copy of this project up and running, follow these simple steps.

### Prerequisites
* Node.js (LTS version recommended)
* npm (or yarn/pnpm)

### Installation
1.  Clone the repository:
    ```sh
    git clone [https://github.com/Rohith292/FamilyMap.git](https://github.com/Rohith292/FamilyMap.git)
    ```
2.  Navigate to the project directory:
    ```sh
    cd FamilyMap
    ```
3.  Install the dependencies:
    ```sh
    npm install
    ```
4.  Configure environment variables. Copy the `.env.example` files from both the frontend and backend folders and rename them to `.env`. Fill in the required values.
5.  Run the development server:
    ```sh
    npm run dev
    ```
The application will be available at `http://localhost:5173`.

## 📂 Project Structure

* `src/pages/`: Top-level components representing each page of the application (e.g., `HomePage`, `LoginPage`).
* `src/components/`: Reusable UI components used across different pages (e.g., `Navbar`, `Modal`, `AlbumCard`).
* `src/store/`: Zustand stores for global state management (`useAuthStore`, `useThemeStore`).
* `src/lib/`: Utility functions and services (`axiosInstance.js`).
* `src/services/`: Service files for interacting with the backend API.

## 🤝 Contributing

Suggestions and ideas for future enhancements are always welcome. Feel free to open an issue or pull request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
_Crafted with ❤️ and a little help from Gemini_
