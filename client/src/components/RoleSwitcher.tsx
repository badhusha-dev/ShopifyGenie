import { useRole } from './RoleProvider';

const RoleSwitcher = () => {
  const { userId, setUserId, userRole } = useRole();

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="mb-0">
          <i className="fas fa-user-shield me-2"></i>
          Role Demo (Development Only)
        </h6>
      </div>
      <div className="card-body">
        <p className="text-muted small mb-3">
          Switch between user roles to see different access levels in action.
        </p>
        <div className="mb-3">
          <label className="form-label">Current Role</label>
          <div className="d-flex align-items-center">
            <span className={`badge me-3 ${
              userRole === 'admin' ? 'bg-danger' :
              userRole === 'staff' ? 'bg-warning' : 'bg-info'
            }`}>
              {userRole?.toUpperCase() || 'LOADING...'}
            </span>
            <small className="text-muted">User ID: {userId}</small>
          </div>
        </div>
        <div className="btn-group w-100" role="group">
          <button
            className={`btn btn-sm ${userId === 'admin' ? 'btn-danger' : 'btn-outline-danger'}`}
            onClick={() => setUserId('admin')}
          >
            <i className="fas fa-crown me-1"></i>
            Admin
          </button>
          <button
            className={`btn btn-sm ${userId === 'staff' ? 'btn-warning' : 'btn-outline-warning'}`}
            onClick={() => setUserId('staff')}
          >
            <i className="fas fa-users-cog me-1"></i>
            Staff
          </button>
          <button
            className={`btn btn-sm ${userId.includes('customer') ? 'btn-info' : 'btn-outline-info'}`}
            onClick={() => setUserId('customer-demo')}
          >
            <i className="fas fa-user me-1"></i>
            Customer
          </button>
        </div>
        <div className="mt-3">
          <small className="text-muted">
            <strong>Permissions:</strong><br/>
            • Admin: Full access<br/>
            • Staff: Products + Orders only<br/>
            • Customer: Personal dashboard only
          </small>
        </div>
      </div>
    </div>
  );
};

export default RoleSwitcher;