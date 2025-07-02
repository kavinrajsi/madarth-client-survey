
# Client Feedback Survey – Madarth

This is a client feedback survey application built using **Next.js**, **React**, **Tailwind CSS**, and **Supabase**. It allows clients to rate their experience across multiple criteria and submit suggestions. All responses are saved securely in a Supabase database.

---

## ✨ Features

- 🎛 Interactive rating sliders (0–5)
- 🎯 Real-time form validation
- 🌈 Visual slider feedback with color and tooltip
- 📬 Feedback stored in Supabase
- 💡 Suggestions field for open-ended comments
- 🔁 Redirects to a thank-you page after submission
- 📱 Responsive UI using Tailwind CSS

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install Dependencies

```bash
npm install
# or
yarn
```

### 3. Configure Supabase

1. Go to <https://supabase.com> and create a new project.
2. Then create a table named `survey_responses` with the following schema:

```sql
CREATE TABLE survey_responses (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT,
  email TEXT,
  responses JSONB,
  suggestions TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

3. Go to Project Settings → API and get your:
4. Create a .env.local file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open <http://localhost:3000> in your browser to use the app.

## 🧠 Tech Stack

- [Next.js](https://nextjs.org/) – React Framework  
- [React](https://reactjs.org/) – UI Library  
- [Supabase](https://supabase.com/) – Backend-as-a-Service (database + auth)  
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework

## 📁 Project Structure

```bash
.
├── components/
│   └── ui/                 # Custom reusable UI components
├── lib/
│   └── supabase.js         # Supabase client initialization
├── pages/
│   ├── index.js            # Main survey page
│   └── thank-you.js        # Thank you page
├── public/                 # Static assets
├── styles/                 # Optional global styles
└── .env.local              # Environment variables (not committed)
```

## 🚀 Deployment

Deploy your app with [Vercel](https://vercel.com) — the creators of Next.js.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 🙌 Contributing

Contributions, suggestions, and improvements are welcome!
Feel free to fork this repo and open a pull request.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 📬 Contact

If you have questions or feedback, please reach out at:  
📧 **kavin@madarth.com**
