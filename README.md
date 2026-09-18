# Supplier Delivery Risk Prediction & Dashboard

An end-to-end Machine Learning and full-stack web application designed to predict and monitor supplier delivery risks. The system leverages a trained classification model to evaluate order parameters, identify potential delivery delays, and visualize order risk categories via an interactive dashboard.

---

## 🌟 Project Overview

- **Machine Learning**: Predicts probability of late delivery and categorizes risk into **High**, **Medium**, and **Low**.
- **Backend**: Built with **FastAPI** providing high-performance REST APIs for real-time predictions and order retrieval.
- **Frontend**: Interactive **React** dashboard for visualizing delivery risks and submitting new orders for inference.
- **Data & Model**: Includes historical delivery dataset and a pre-trained machine learning model pipeline (tracked via Git LFS).

---

## 📁 Repository Structure

```
Supplier_Delivery_Risk/
├── backend/
│   ├── main.py                          # FastAPI application & API endpoints
│   ├── requirements.txt                 # Python dependencies
│   └── supplier_delivery_risk_model.pkl # Trained ML model (Git LFS)
├── data/
│   └── supplier_risk_predictions.csv    # Historical delivery & risk dataset
├── frontend/
│   ├── public/                          # Static assets
│   ├── src/                             # React components & application logic
│   ├── package.json                     # Frontend dependencies & scripts
│   └── .gitignore
├── .gitattributes                       # Git LFS configuration
├── .gitignore                           # Git ignore rules
└── README.md                            # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** and **npm**
- **Git & Git LFS** (for downloading the model file)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```
Backend API will be accessible at: `http://localhost:8000`  
Swagger API documentation: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```
Frontend will be accessible at: `http://localhost:3000`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/orders` | Fetches historical order records with risk classifications. |
| `POST` | `/predict` | Predicts delivery risk score and category for a given order payload. |

---

## 🧠 Model Features

The risk prediction model evaluates:
- Item Category & Region
- Supplier Risk Class & Defect Rate
- Order Quantity, Unit Cost & Order Value
- Promised Lead Time & Historical Average Delay
- Historical Late Delivery Rate
- Order Month & Day of Week
