interface TopNavProps {
  title: string;
  subtitle: string;
}

const TopNav = ({ title, subtitle }: TopNavProps) => {
  return (
    <div className="top-nav">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">{title}</h5>
          <small className="text-muted">{subtitle}</small>
        </div>
        <div className="d-flex align-items-center">
          <span className="me-3">myshop.myshopify.com</span>
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary btn-sm dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              <i className="fas fa-user-circle me-1"></i>
              Store Owner
            </button>
            <ul className="dropdown-menu">
              <li>
                <a className="dropdown-item" href="#settings">
                  Settings
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#logout">
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
