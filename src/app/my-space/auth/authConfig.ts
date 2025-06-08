interface AuthImageConfig {
  url: string;
  alt: string;
  fallback?: string;
  className?: string;
}

interface AuthConfig {
  [key: string]: AuthImageConfig;
}

const authConfig: AuthConfig = {
  login: {
    url: "/images/scheuor_final.png",
    alt: "Illustration of a user logging in",
    fallback: "bg-blue-200",
    className: "object-cover",
  },
  register: {
    url: "/images/scheuor_final.png",
    alt: "Illustration of a user creating an account",
    fallback: "bg-green-200",
    className: "object-cover",
  },
  "forgot-password": {
    url: "/forgot-password-image.jpg",
    alt: "Illustration of password recovery",
    fallback: "bg-gray-200",
    className: "object-cover",
  },
};

export const defaultImageConfig: AuthImageConfig = {
  url: "/default-image.jpg",
  alt: "Default authentication illustration",
  fallback: "bg-gray-200",
  className: "object-cover",
};

export default authConfig;