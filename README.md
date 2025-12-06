# Nexus | 3D Interactive E-Commerce Platform

## 📖 About The Project

**Nexus** is a comprehensive web-based platform that integrates two core functionalities: exclusive branded T-shirt sales and a custom 3D T-shirt design studio. 
While traditional platforms often limit customization to simple 2D overlays, Nexus leverages **Three.js** to provide a real-time 3D configurator. Users can upload images, add text, adjust colors, and preview their designs from every angle before purchasing.

> homepage
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/ad9a0045-a2d7-472c-8e00-de5778933203" />


>customizationpage
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/a04d5706-0dc2-4353-a507-2f8972b95e9f" />


>searchpage
<img width="980" height="552" alt="image" src="https://github.com/user-attachments/assets/374f0589-304b-4cd6-bed3-04a801dcd99a" />

>productpage
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/254e15be-ec36-471a-b164-c41665f15f9f" />


>admindashboardpage
<img width="983" height="553" alt="image" src="https://github.com/user-attachments/assets/7bfdaac4-8d00-48a2-bf66-f6f0067800ed" />


## 🚀 Key Features

### 🎨 Interactive 3D Configurator
**Real-Time Rendering:** Users can rotate, zoom, and inspect the T-shirt model in a 3D environment.
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
**Vite:** Frontend build tool

### Backend
Django (Python):** Robust framework handling business logic, authentication, and APIs.
MySQL:** Production database for reliable data storage.

---

## 🔮 Future Roadmap

We are actively working on the following enhancements:

🤖 AI Co-Creator:** Integrating Generative AI to suggest patterns and textures based on text prompts (e.g., "Cosmic Wolf").
🕶️ AR Virtual Try-On:** Allowing users to project their custom designs onto themselves using their smartphone camera.
👕 Expanded Canvas:** Support for designing hoodies, caps, and tote bags.
🌍 Creator Marketplace:** A hub for users to publish and monetize their custom designs.

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
