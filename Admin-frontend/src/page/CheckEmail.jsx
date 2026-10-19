import { useLocation, useNavigate } from "react-router-dom";

function CheckEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const message =
    location.state?.message || "Please check your inbox for verification.";
  const email = location.state?.email || "your email";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-green-700 mb-4">
          Verify Your Email
        </h1>
        <p className="text-gray-700">{message}</p>
        <p className="mt-2 text-gray-500">
          Sent to: <span className="font-medium">{email}</span>
        </p>
        <button
          className="mt-6 bg-[#16730F] text-white px-6 py-2 rounded-lg shadow hover:bg-green-800"
          onClick={() => navigate("/")}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

export default CheckEmail;
