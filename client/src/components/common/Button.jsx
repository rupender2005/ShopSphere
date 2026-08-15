import { Link } from "react-router-dom";
import styles from "./Button.module.css";

const CommonButton = ({
  text,
  onClick,
  href,
  variant = "primary",
  target,
  disabled = false,
  icon,
  type = "submit",
  className: additionalClassName = "",
  scrollOffset = 0,
}) => {
  const className = `
    pointer 
    ${styles.button} 
    ${styles[variant]} 
    text-16 
    radius-16
    ${additionalClassName}
  `;

  // Navigation button
  if (href) {
    if (href.startsWith("#")) {
      return (
        <a
          href={href}
          target={target}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : undefined}
          className={className}
          onClick={(e) => {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
              if (scrollOffset > 0) {
                const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                  top: elementPosition - scrollOffset,
                  behavior: "smooth"
                });
              } else {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }}
        >
          <span className={`flex alignCenter gap-2`}>
            {text}
            {icon && <span className={`flex alignCenter`}>{icon}</span>}
          </span>
        </a>
      );
    }
    
    return (
      <Link
        to={href}
        target={target}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        className={className}
      >
        <span className={`flex alignCenter gap-2`}>
          {text}
          {icon && <span className={`flex alignCenter`}>{icon}</span>}
        </span>
      </Link>
    );
  }

  // Normal action button
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={className}>
      <span className={`flex alignCenter gap-2`}>
        {icon && (
          <span className={`flex alignCenter`} style={{ minWidth: "1.25rem" }}>
            {icon}
          </span>
        )}
        {text}
      </span>
    </button>
  );
};

export default CommonButton;
