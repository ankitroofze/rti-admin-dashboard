import React from "react";
import { Link } from "react-router-dom";

const copy = {
  400: ["Bad Request", "Your request could not be processed."],
  403: ["Forbidden", "You do not have permission to view this resource."],
  404: ["Page Not Found", "The page you were looking for is not available."],
  500: ["Internal Server Error", "Something went wrong on the server."],
  503: ["Service Unavailable", "The service is temporarily unavailable."],
};

const ErrorPage = ({ code = 404 }) => {
  const [title, message] = copy[code] || copy[404];

  return (
    <div className="not-found card">
      <h2>{code}</h2>
      <h4>{title}</h4>
      <p>{message}</p>
      <Link className="btn btn-primary" to="/admin/dashboard">
        Back to dashboard
      </Link>
    </div>
  );
};

export default ErrorPage;
