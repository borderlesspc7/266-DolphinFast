"use client";

import React from "react";
import "./Button.css";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  type = "button",
  onClick,
  className,
  fullWidth = false,
}) => {
  const buttonClassName = [
    "button",
    `button--${variant}`,
    size !== "medium" && `button--${size}`,
    fullWidth && "button--full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={buttonClassName}
    >
      {children}
    </button>
  );
};
