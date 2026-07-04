# Online Ticket Reservation & Verification System (Bangladesh)

A high-fidelity, unified ticketing portal for Bus, Train, and Flight travels in Bangladesh, designed with rich aesthetics, secure verification mechanisms, and custom matching algorithms.

## 🌟 Key Features

1. **🔒 Anti-Scalping & Multi-Verification Security**:
   - **NID Verification**: Real-time validation against a mock NID card registry.
   - **SIM Verification**: Dual-layer verification with a simulated 120s countdown visual OTP clock.
   - **Email OTP**: SMTP-based real-time email verification.
   - **Brute-Force Lockout protection**: Enforces automatic temporary lockouts (5-10 mins) after 5 rapid failed password attempts.

2. **🎟️ Flexible Ticket Limits**:
   - **Bus**: Max 4 seats per account per journey.
   - **Train**: Max 4 seats per account per journey.
   - **Flight (Plane)**: Max 5 seats per account per journey.

3. **🗺️ Comprehensive Bangladeshi Routes (2,610 Daily Trips)**:
   - Covers 26 major stations (Gabtoli, Kamalapur, Jashore, Khulna, Benapole, Teknaf, Tetulia, Panchagarh).
   - Generates route-accurate train operators (e.g., *Subarna Express* for Dhaka-Chittagong, *Bonolota Express* for Dhaka-Rajshahi, *Benapole Express* for Dhaka-Benapole).

4. **⚡ Capability-Based Comparison Engine**:
   - Compares and sorts trips instantly based on user priority sliders: **Budget (Cheap)**, **Speed (Duration)**, **Comfort (VIP)**, or **Balanced**.

5. **🌐 Bilingual Toggle Support (EN | বাংলা)**:
   - Full global translation switch between English and Bangla (with localStorage persistence).
   - Showcases spelling variations side-by-side (e.g., `Dhaka Kamalapur (ঢাকা কমলাপুর)`) for enhanced accessibility.

6. **💸 Ticket Cancellation & Secure Refund Portal**:
   - Initiates cancellations directly from the traveler dashboard.
   - Requires password re-authentication and bKash/Nagad wallet input to process instant BDT refunds and release the reserved seats back into availability.

7. **✨ Aesthetic Moving Gradient Backgrounds**:
   - Premium dynamic mesh blob styling for a state-of-the-art dark theme.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS, Lucide Icons.
- **Backend**: Django, Django REST Framework, SQLite, django-cors-headers.

---

## 🚀 Setup & Execution

### 1. Backend Server Setup
```bash
cd backend
python -m venv venv
# Activate virtual environment:
# On Windows: .\venv\Scripts\activate
# On Unix/macOS: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_db
python manage.py runserver
```

### 2. Frontend client Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.
