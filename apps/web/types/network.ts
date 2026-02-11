export type AllyWithHealth = {
    id: string;
    name: string;
    role: string;
    frequencyDays: number;
    lastContact: Date;
    contactMethod: string | null;
    health: number;
    status: 'STABLE' | 'DECAYING' | 'CRITICAL';
};

export type AllyFormData = {
    name: string;
    role: string;
    frequencyDays: number;
    contactMethod: string | null;
};
