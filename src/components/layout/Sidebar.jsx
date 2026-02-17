import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { Users, ShieldCheck, FileText, LogOut, Sun } from 'lucide-react';
import logo from '../../assets/logo.png';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((driver) => driver[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const hasPermission = (configId) => {
        if (!user || !user.permissions) return false;
        try {
            const permissions = typeof user.permissions === 'string'
                ? JSON.parse(user.permissions)
                : user.permissions;

            if (!permissions?.adminPanel?.enabled) return false;

            const config = permissions.adminPanel.configs?.find(c => c.id === configId);
            return config?.enabled === true;
        } catch (e) {
            console.error("Error parsing permissions:", e);
            return false;
        }
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <img src={logo} alt="R-Solar" className={styles.logoImage} />
            </div>

            <nav className={styles.nav}>
                {hasPermission('user-mgmt') && (
                    <div
                        className={`${styles.navItem} ${location.pathname === '/' || location.pathname.startsWith('/employees') ? styles.active : ''}`}
                        onClick={() => navigate('/')}
                        style={{ cursor: 'pointer' }}
                    >
                        <Users size={18} style={{ marginRight: 10 }} />
                        Employees
                    </div>
                )}
                {hasPermission('role-config') && (
                    <div
                        className={`${styles.navItem} ${location.pathname === '/roles' ? styles.active : ''}`}
                        onClick={() => navigate('/roles')}
                        style={{ cursor: 'pointer' }}
                    >
                        <ShieldCheck size={18} style={{ marginRight: 10 }} />
                        Roles & Permissions
                    </div>
                )}
                <div
                    className={`${styles.navItem} ${location.pathname === '/audit-logs' ? styles.active : ''}`}
                    onClick={() => navigate('/audit-logs')}
                    style={{ cursor: 'pointer' }}
                >
                    <FileText size={18} style={{ marginRight: 10 }} />
                    Audit Logs
                </div>
            </nav>

            <div className={styles.footer}>
                <div className={styles.userProfile}>
                    <div className={styles.avatar}>
                        {user ? getInitials(user.fullName) : 'G'}
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>
                            {user ? user.fullName : 'Guest User'}
                        </span>
                        <span className={styles.userRole}>
                            {user ? user.roleName : 'Read Only'}
                        </span>
                    </div>
                    <LogOut
                        size={16}
                        style={{ marginLeft: 'auto', color: 'var(--text-muted)', cursor: 'pointer' }}
                        onClick={handleLogout}
                    />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
