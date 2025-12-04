# Nexus | 3D Interactive E-Commerce Platform

## 📖 About The Project

**Nexus** is a comprehensive web-based platform that integrates two core functionalities: exclusive branded T-shirt sales and a custom 3D T-shirt design studio. 

While traditional platforms often limit customization to simple 2D overlays, Nexus leverages **Three.js** to provide a real-time 3D configurator. Users can upload images, add text, adjust colors, and preview their designs from every angle before purchasing.

This project was built to address the "visualization gap" in online apparel shopping, reducing return rates and boosting customer engagement through immersive technology.

<img width="983" height="553" alt="image" src="https://github.com/user-attachments/assets/2158f3c2-59f0-46aa-b2b2-d98bcd719c0a" />
<img width="969" height="545" alt="image" src="https://github.com/user-attachments/assets/2c3dc9e5-c3f6-430f-be4b-df69bd711308" />
<img width="980" height="552" alt="image" src="https://github.com/user-attachments/assets/374f0589-304b-4cd6-bed3-04a801dcd99a" />
<img width="976" height="549" alt="image" src="https://github.com/user-attachments/assets/a98dfd51-c131-434b-ab77-7cd9b427ad23" />
<img width="983" height="553" alt="image" src="https://github.com/user-attachments/assets/7bfdaac4-8d00-48a2-bf66-f6f0067800ed" />

## 🚀 Key Features

### 🎨 Interactive 3D Configurator
* [cite_start]**Real-Time Rendering:** Users can rotate, zoom, and inspect the T-shirt model in a 3D environment.
**Deep Customization:** * Change base fabric colors dynamically.
   Add custom text with adjustable fonts, sizes, and colors.
   Upload images/logos that wrap onto the 3D model.
**Smart Capture:** Automatically converts the user's 3D design into a static image snapshot for the cart and order processing.

### 🛒 Full-Featured E-Commerce Store
**Product Catalog:** Browse trending, new, and best-selling collections with filtering options.
**Secure Checkout:** Integrated **Razorpay** payment gateway for secure transactions.
**User Accounts:** Track order history, status, and manage profile settings.

### 📊 Powerful Admin Dashboard
**Analytics:** Visual overview of total revenue, order trends, and processing status.
**Inventory Management:** comprehensive CRUD operations for products and categories.

---

## 🛠️ Tech Stack

### Frontend
**React.js:** For building a dynamic and responsive user interface.
**Three.js:** Powering the interactive 3D customization experience.
**Tailwind CSS:** Utility-first framework for rapid and clean UI styling.
Vite:** Frontend build tool

### Backend
Django (Python):** Robust framework handling business logic, authentication, and APIs.
MySQL:** Production database for reliable data storage.

### Tools & Deployment
* [cite_start]**Docker:** For containerization and consistent environments.
* [cite_start]**Spline/Blender:** For creating and optimizing 3D assets.
* [cite_start]**Postman:** For API testing and documentation.

---

## 🔮 Future Roadmap

We are actively working on the following enhancements:

🤖 AI Co-Creator:** Integrating Generative AI to suggest patterns and textures based on text prompts (e.g., "Cosmic Wolf")[cite: 765].
🕶️ AR Virtual Try-On:** Allowing users to project their custom designs onto themselves using their smartphone camera[cite: 767].
👕 Expanded Canvas:** Support for designing hoodies, caps, and tote bags[cite: 770].
🌍 Creator Marketplace:** A hub for users to publish and monetize their custom designs[cite: 773].

---

## ⚙️ Getting Started

### Prerequisites
* Node.js & npm
* Python 3.x
* MySQL

### Installation

1.  **Clone the Repo**
    ```sh
    git clone [https://github.com/viswajith-1/e-com-with-3d-tshirt-configurator-react-django-app.git)
    ```

2.  **Backend Setup**
    ```sh
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    python manage.py migrate
    python manage.py runserver
    ```

3.  **Frontend Setup**
    ```sh
    cd frontend
    npm install
    npm run dev
    ```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
