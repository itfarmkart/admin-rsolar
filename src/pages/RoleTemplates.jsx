
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Pencil, ChevronDown, ChevronLeft, ChevronRight, Users } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const RoleTemplates = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch('/api/roles');
                if (response.ok) {
                    const data = await response.json();
                    setRoles(data);
                }
            } catch (error) {
                console.error('Failed to fetch roles:', error);
            }
        };
        fetchRoles();
    }, []);

    const extractAccessTags = (permissions) => {
        if (!permissions) return [];
        const tags = [];

        // Safe access with optional chaining and nullish coalescing
        if (permissions.crm?.enabled && Array.isArray(permissions.crm.modules)) {
            permissions.crm.modules.forEach(m => {
                if (m.view || m.edit) tags.push(m.name);
            });
        }

        if (permissions.missionControl?.enabled && Array.isArray(permissions.missionControl.stages)) {
            permissions.missionControl.stages.forEach(s => {
                if (s.enabled) tags.push(s.name);
            });
        }

        if (permissions.adminPanel?.enabled && Array.isArray(permissions.adminPanel.configs)) {
            permissions.adminPanel.configs.forEach(c => {
                if (c.enabled) tags.push(c.name);
            });
        }

        return tags.slice(0, 3); // Limit to 3 for display
    };

    const filteredRoles = roles.filter(role => {
        const matchesSearch = (role.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDepartment === 'All Departments' || role.departmentName === selectedDepartment;
        return matchesSearch && matchesDept;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredRoles.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = filteredRoles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const getDepartmentColor = (dept) => {
        switch (dept) {
            case 'Operations': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' }; // Blue
            case 'Sales': return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' }; // Orange
            case 'Engineering': return { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6' }; // Purple
            case 'Logistics': return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' }; // Green
            default: return { bg: '#222', text: '#ccc' };
        }
    };

    return (
        <div style={{ padding: '24px', color: '#fff', minHeight: '100vh', backgroundColor: '#000' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>Role Templates</h1>
                    <p style={{ color: '#888', margin: 0 }}>Define and manage access permissions for different organizational levels.</p>
                </div>
                <button
                    onClick={() => navigate('/roles/create')}
                    style={{
                        backgroundColor: 'var(--accent-green)',
                        color: '#000',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                    }}>
                    <Plus size={20} />
                    Add New Role
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    <input
                        type="text"
                        placeholder="Search by role name..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        style={{
                            width: '100%',
                            backgroundColor: '#111',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            padding: '12px 12px 12px 48px',
                            color: '#fff',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ position: 'relative' }}>
                    <select
                        value={selectedDepartment}
                        onChange={(e) => { setSelectedDepartment(e.target.value); setCurrentPage(1); }}
                        style={{
                            width: '100%',
                            backgroundColor: '#111',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            color: '#fff',
                            outline: 'none',
                            appearance: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option>All Departments</option>
                        <option>Operations</option>
                        <option>Sales</option>
                        <option>Engineering</option>
                        <option>Logistics</option>
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666', pointerEvents: 'none' }} />
                </div>
            </div>

            {/* Table Area */}
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                            <th style={{ padding: '16px 24px' }}>Role Name</th>
                            <th style={{ padding: '16px' }}>Department</th>
                            <th style={{ padding: '16px' }}>Employees</th>
                            <th style={{ padding: '16px' }}>Website Access Summary</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((role) => (
                            <tr key={role.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#fff' }}>{role.name}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '4px' }}>ID: {role.id}</div>
                                </td>

                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        color: '#3b82f6',
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                        fontSize: '0.75rem',
                                        fontWeight: 500
                                    }}>
                                        {role.departmentName || 'Unassigned'}
                                    </span>
                                </td>

                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{role.employeeCount || 0}</span>
                                        <div style={{ display: 'flex' }}>
                                            <div style={{
                                                width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#333', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <Users size={10} color="#888" />
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {extractAccessTags(role.permissions).length > 0 ? (
                                            extractAccessTags(role.permissions).map((tag, idx) => (
                                                <span key={idx} style={{
                                                    backgroundColor: 'rgba(5, 150, 105, 0.1)',
                                                    color: 'var(--accent-green)',
                                                    border: '1px solid rgba(5, 150, 105, 0.2)',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    {tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No active permissions</span>
                                        )}
                                    </div>
                                </td>

                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <Pencil
                                        size={16}
                                        color="var(--text-secondary)"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/roles/${role.id}/edit`)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Footer - Integrated into table container */}
                {filteredRoles.length > 0 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 24px',
                        borderTop: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem'
                    }}>
                        <div>Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + ITEMS_PER_PAGE, filteredRoles.length)}</strong> of <strong>{filteredRoles.length}</strong> roles</div>

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

            {
                filteredRoles.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                        No roles found matching your criteria.
                    </div>
                )
            }
        </div >
    );
};

export default RoleTemplates;
