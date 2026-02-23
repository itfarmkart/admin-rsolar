import React, { useState, useEffect } from 'react';
import { Search, UserPlus } from 'lucide-react';
import EmployeeTable from '../components/ui/EmployeeTable';
import AddEmployeeModal from '../components/ui/AddEmployeeModal';

const EmployeeAccess = () => {
    const [employees, setEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lastSync, setLastSync] = useState(new Date());
    const itemsPerPage = 8; // Adjust to fit screen nicely

    const fetchEmployees = async () => {
        try {
            const response = await fetch('/api/employees');
            if (response.ok) {
                const data = await response.json();
                setEmployees(data);
                setLastSync(new Date());
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const filteredEmployees = employees.filter(emp => {
        const query = searchQuery.toLowerCase();
        return (
            (emp.fullName && emp.fullName.toLowerCase().includes(query)) ||
            (emp.roleName && emp.roleName.toLowerCase().includes(query)) ||
            (emp.departmentName && emp.departmentName.toLowerCase().includes(query)) ||
            (emp.email && emp.email.toLowerCase().includes(query))
        );
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div>
            {/* Search Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <div style={{ position: 'relative', width: '380px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search employees, roles, or departments..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 40px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            backgroundColor: 'var(--accent-green)',
                            color: '#000',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}>
                        <UserPlus size={18} />
                        <span>Add New Employee</span>
                    </button>
                    <AddEmployeeModal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            fetchEmployees();
                        }}
                    />
                </div>
            </header>

            {/* Page Content */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-lg)' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 8px 0' }}>Employee Access Overview</h1>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Manage cross-platform permissions for all {employees.length} active personnel.</p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Last HR Sync</div>
                        <TimeAgo date={lastSync} />
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: 'var(--spacing-lg)' }}>
                    <button style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-green)',
                        borderBottom: '2px solid var(--accent-green)',
                        padding: '8px 0',
                        marginRight: '24px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}>
                        All Employees
                    </button>
                </div>

                {/* Table Area */}
                <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <EmployeeTable employees={currentItems} />

                    {/* Pagination Footer */}
                    {filteredEmployees.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <div>Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, filteredEmployees.length)}</strong> of <strong>{filteredEmployees.length}</strong> employees</div>

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '6px 12px',
                                        background: 'var(--bg-hover)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                                        cursor: currentPage === 1 ? 'default' : 'pointer',
                                        opacity: currentPage === 1 ? 0.5 : 1
                                    }}
                                >&lt;</button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        style={{
                                            padding: '6px 12px',
                                            background: currentPage === page ? 'var(--accent-green)' : 'transparent',
                                            color: currentPage === page ? '#000' : 'var(--text-secondary)',
                                            border: currentPage === page ? '1px solid var(--accent-green)' : 'none',
                                            borderRadius: '4px',
                                            fontWeight: currentPage === page ? '600' : '400',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '6px 12px',
                                        background: 'var(--bg-hover)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-secondary)',
                                        cursor: currentPage === totalPages ? 'default' : 'pointer',
                                        opacity: currentPage === totalPages ? 0.5 : 1
                                    }}
                                >&gt;</button>
                            </div>
                        </div>
                    )}
                </div>

            </section>
        </div>
    );
};

const TimeAgo = ({ date }) => {
    const [timeAgo, setTimeAgo] = useState('Just now');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);

            if (diffInSeconds < 60) {
                setTimeAgo('Just now');
            } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                setTimeAgo(`${minutes} minute${minutes > 1 ? 's' : ''} ago`);
            } else {
                const hours = Math.floor(diffInSeconds / 3600);
                setTimeAgo(`${hours} hour${hours > 1 ? 's' : ''} ago`);
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [date]);

    return <div style={{ color: '#60a5fa', fontWeight: '600', fontSize: '0.9rem' }}>{timeAgo}</div>;
};

export default EmployeeAccess;
