import { useMemo } from 'react';
import { studentsData } from '../data/students';
import { useAuth } from '../context/AuthContext';

export function useChildStudent() {
    const { user } = useAuth();
    return useMemo(
        () => studentsData.find((s) => s.id === user?.childStudentId),
        [user]
    );
}
