
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Pencil } from 'lucide-react';

const StatusIcon = ({ permissions, type }) => {
    let hasAccess = false;

    if (permissions) {
        if (type === 'crm') {
            hasAccess = permissions.crm?.enabled;
        } else if (type === 'missionControl') {
            hasAccess = permissions.missionControl?.enabled;
        } else if (type === 'adminPanel') {
            hasAccess = permissions.adminPanel?.enabled;
        }
    }

    if (hasAccess) return <div style={{ display: 'flex', justifyContent: 'center' }}><CheckCircle2 size={18} fill="var(--success)" color="#000" /></div>;
    return <div style={{ display: 'flex', justifyContent: 'center' }}><XCircle size={18} fill="var(--inactive)" color="#000" opacity={0.5} /></div>;
}

const EmployeeTable = ({ employees }) => {
    const navigate = useNavigate();
    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '16px 24px' }}>Employee</th>
                    <th style={{ padding: '16px' }}>Department</th>
                    <th style={{ padding: '16px' }}>Role</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>CRM</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>Mission Control</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>Admin</th>
                    <th style={{ padding: '16px' }}>Status</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {employees.map((emp) => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(emp.fullName)}&background=random`} alt={emp.fullName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                                <div style={{ fontWeight: 600 }}>{emp.fullName}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{emp.email}</div>
                            </div>
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
                                {emp.departmentName || 'Unassigned'}
                            </span>
                        </td>
                        <td style={{ padding: '16px', color: 'var(--text-primary)' }}>{emp.roleName || 'Employee'}</td>
                        <td style={{ padding: '16px' }}>
                            <StatusIcon permissions={emp.rolePermissions} type="crm" />
                        </td>
                        <td style={{ padding: '16px' }}>
                            <StatusIcon permissions={emp.rolePermissions} type="missionControl" />
                        </td>
                        <td style={{ padding: '16px' }}>
                            <StatusIcon permissions={emp.rolePermissions} type="adminPanel" />
                        </td>
                        <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: emp.status === 'Active' ? 'var(--success)' : 'var(--text-muted)'
                                }}></div>
                                <span style={{ color: emp.status === 'Active' ? 'var(--text-primary)' : 'var(--text-muted)' }}>{emp.status}</span>
                            </div>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right', color: '#3b82f6', cursor: 'pointer' }}>
                            <Pencil
                                size={16}
                                color="var(--text-secondary)"
                                fill="none"
                                onClick={() => navigate(`/employees/${emp.id}/edit`)}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default EmployeeTable;
