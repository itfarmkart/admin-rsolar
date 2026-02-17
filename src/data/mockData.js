
export const employees = [
    {
        id: 1,
        name: 'Sarah Chen',
        email: 'sarah.c@myrsolar.com',
        avatar: 'https://i.pravatar.cc/150?u=sarah',
        department: 'Operations',
        role: 'Manager',
        permissions: {
            crm: true,
            missionControl: true,
            admin: false,
        },
        status: 'Active'
    },
    {
        id: 2,
        name: 'Michael Scott',
        email: 'm.scott@myrsolar.com',
        avatar: 'https://i.pravatar.cc/150?u=michael',
        department: 'Sales',
        role: 'Sr. Account Executive',
        permissions: {
            crm: true,
            missionControl: false,
            admin: false,
        },
        status: 'Active'
    },
    {
        id: 3,
        name: 'Jessica Vanhook',
        email: 'j.vanhook@myrsolar.com',
        avatar: 'https://i.pravatar.cc/150?u=jessica',
        department: 'Executive',
        role: 'Lead Developer',
        permissions: {
            crm: true,
            missionControl: true,
            admin: true,
        },
        status: 'Active'
    },
    {
        id: 4,
        name: 'David Miller',
        email: 'd.miller@myrsolar.com',
        avatar: 'https://i.pravatar.cc/150?u=david',
        department: 'Field Ops',
        role: 'Lead Electrician',
        permissions: {
            crm: false,
            missionControl: true,
            admin: false,
        },
        status: 'Inactive'
    }
];
