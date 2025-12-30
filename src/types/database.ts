export type UserRole = 'admin' | 'employee';

export interface Profile {
    id: string;
    email: string | null;
    full_name: string | null;
    role: UserRole;
    created_at: string;
}

export interface JobSite {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    created_at: string;
}

export interface Timesheet {
    id: string;
    user_id: string;
    site_id?: string;
    clock_in_time: string;
    clock_out_time?: string | null;
    clock_in_lat?: number;
    clock_in_lon?: number;
    status: 'clocked_in' | 'completed';
    created_at: string;

    // Joined fields (optional)
    profiles?: Profile;
    job_sites?: JobSite;
}
