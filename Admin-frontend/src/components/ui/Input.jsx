import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';

const Input = ({ type = 'text', placeholder, value, setValue, errorKey, localErrors = {} }) => {
  const [showPassword, setShowPassword] = useState(false);

  const reduxErrors = useSelector((state) => state.auth.errors);
  const errorMessage = localErrors[errorKey] || reduxErrors?.[errorKey] || null;

  return (
    <div className="flex flex-col space-y-1">
      <div className="relative">
        <input
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`w-full px-4 py-2 rounded-xl outline-none border ${
            errorMessage
              ? 'border-red-500 focus:ring-2 focus:ring-red-300'
              : 'border-[#1A3E32] focus:ring-2 focus:ring-green-300'
          }`}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
    </div>
  );
};

export default Input;
