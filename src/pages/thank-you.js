import Head from "next/head";

export default function ThankYou() {
  return (
    <>
      <Head>
        <title>Thank You – Madarth</title>
        <meta
          name="description"
          content="Thank you for your valuable feedback. Your input helps us grow as a trusted creative partner."
        />
      </Head>
      <div className="dark min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center space-y-4 bg-gray-800 p-10 rounded-md shadow">
          <h1 className="text-3xl font-bold">Thank You!</h1>
          <p>Your feedback has been submitted successfully.</p>
        </div>
      </div>
    </>
  );
}
