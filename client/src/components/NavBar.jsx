import PropTypes from 'prop-types';
import './NavBar.css';

function NavBar({ pages, activePage, onPageChange }) {
  return (
    <nav className="nav-bar" aria-label="Main navigation">
      {Object.entries(pages).map(([key, label]) => (
        <button
          key={key}
          type="button"
          className={activePage === key ? 'active' : ''}
          onClick={() => onPageChange(key)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

NavBar.propTypes = {
  pages: PropTypes.objectOf(PropTypes.string).isRequired,
  activePage: PropTypes.string.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default NavBar;
