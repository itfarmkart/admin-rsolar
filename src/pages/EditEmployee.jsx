
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, AlertCircle, Trash2, ArrowLeft } from 'lucide-react';

const EditEmployee = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        fullName: '',
        employeeId: '',
        email: '',
        mobile: '',
        departmentId: '',
        roleId: '',
        status: 'Active'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Departments
                const deptRes = await fetch('http://localhost:5002/api/departments');
                const deptData = await deptRes.json();
                setDepartments(deptData);

                // Fetch Roles
                const roleRes = await fetch('http://localhost:5002/api/roles');
                const roleData = await roleRes.json();
                setRoles(roleData);

                // Fetch Employee
                const empRes = await fetch(`http://localhost:5002/api/employees/${id}`);
                if (!empRes.ok) throw new Error('Employee not found');
                const empData = await empRes.json();

                setFormData({
                    fullName: empData.fullName,
                    employeeId: empData.employeeId,
                    email: empData.email,
                    mobile: empData.mobile || '',
                    departmentId: empData.departmentId || '',
                    roleId: empData.roleId || '',
                    status: empData.status
                });
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.mobile || formData.mobile.length !== 10) {
            alert("Mobile number must be exactly 10 digits.");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`http://localhost:5002/api/employees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update employee');
            }

            navigate('/'); // Redirect back to list
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ color: 'var(--text-primary)', padding: '40px' }}>Loading employee details...</div>;
    if (error) return <div style={{ color: 'var(--danger)', padding: '40px' }}>Error: {error}</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Breadcrumb / Back */}
            <div style={{ marginBottom: '24px' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    <ArrowLeft size={16} /> Back to Employees
                </button>
            </div>

            <h1 style={{ marginBottom: '32px', fontSize: '1.5rem', fontWeight: 600 }}>Edit Employee Details</h1>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

                {/* Left Column: Personal Info */}
                <div style={{ backgroundColor: 'var(--bg-card)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=random&size=128`}
                            alt="Profile"
                            style={{ width: '80px', height: '80px', borderRadius: '12px' }}
                        />
                        <div>
                            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem' }}>{formData.fullName}</h2>
                            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{formData.employeeId}</p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--accent-green)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>FULL NAME</label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: 'var(--bg-main)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--accent-green)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>EMAIL ADDRESS</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: 'var(--bg-main)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--accent-green)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>MOBILE NUMBER</label>
                        <input
                            type="text"
                            value={formData.mobile}
                            maxLength={10}
                            placeholder="10-digit mobile number"
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) { // Only allow digits
                                    setFormData({ ...formData, mobile: val });
                                }
                            }}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: 'var(--bg-main)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                {/* Right Column: Role & Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Role & Dept Card */}
                    <div style={{ backgroundColor: 'var(--bg-card)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Role & Status</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.9rem' }}>Assign the global role template and primary department for this employee.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--accent-green)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>DEPARTMENT</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={formData.departmentId}
                                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value, role: '' })}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#16191D',
                                            border: '1px solid #333',
                                            borderRadius: '4px',
                                            padding: '10px 12px',
                                            color: '#fff',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            appearance: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="" disabled>Select Department</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666', fontSize: '0.7rem' }}>▼</div>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--accent-green)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>ASSIGN ROLE</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={formData.roleId}
                                        onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#16191D',
                                            border: '1px solid #333',
                                            borderRadius: '4px',
                                            padding: '10px 12px',
                                            color: '#fff',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            appearance: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="" disabled>Select Role</option>
                                        {roles.filter(r => r.departmentId == formData.departmentId).map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666', fontSize: '0.7rem' }}>▼</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'rgba(5, 150, 105, 0.1)', border: '1px solid rgba(5, 150, 105, 0.2)', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px' }}>
                            <AlertCircle size={20} color="var(--accent-green)" />
                            <div>
                                <div style={{ color: 'var(--accent-green)', fontWeight: 600, marginBottom: '4px', fontSize: '0.9rem' }}>POLICY NOTICE</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                                    Changes to the global role or department are logged for compliance. The employee may need to restart their active session for permissions to refresh.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons (Outside Card) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                            type="button"
                            onClick={async () => {
                                if (window.confirm('Are you sure you want to deactivate this employee? They will lose access immediately.')) {
                                    try {
                                        const res = await fetch(`http://localhost:5002/api/employees/${id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ ...formData, status: 'Inactive' })
                                        });
                                        if (!res.ok) throw new Error('Failed to deactivate');
                                        navigate('/');
                                    } catch (err) {
                                        alert(err.message);
                                    }
                                }
                            }}
                            style={{
                                background: 'transparent',
                                border: '1px solid #ef4444',
                                color: '#ef4444',
                                padding: '10px 20px',
                                borderRadius: '6px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer'
                            }}>
                            <Trash2 size={16} /> DEACTIVATE EMPLOYEE
                        </button>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    padding: '10px 20px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel Changes
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    background: 'var(--accent-green)',
                                    border: 'none',
                                    color: '#000',
                                    padding: '10px 24px',
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    opacity: saving ? 0.7 : 1
                                }}
                            >
                                <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
};

export default EditEmployee;
