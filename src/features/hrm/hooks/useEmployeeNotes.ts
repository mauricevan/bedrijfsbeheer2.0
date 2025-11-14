/**
 * useEmployeeNotes Hook
 * Business logic voor Employee Notes System
 */

import { useState, useCallback, useMemo } from 'react';
import type { EmployeeNote, EmployeeNoteType } from '../../../types';

export const useEmployeeNotes = (initialNotes: EmployeeNote[], employeeId: string) => {
  const [notes, setNotes] = useState<EmployeeNote[]>(initialNotes);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  // Get icon for note type
  const getNoteIcon = (type: EmployeeNoteType): string => {
    const icons: Record<EmployeeNoteType, string> = {
      late: '⏰',
      absent: '❌',
      milestone: '🎯',
      performance: '📊',
      warning: '⚠️',
      compliment: '⭐',
      attendance: '✅',
      general: '📝',
    };
    return icons[type] || '📝';
  };

  // Get label for note type
  const getNoteLabel = (type: EmployeeNoteType): string => {
    const labels: Record<EmployeeNoteType, string> = {
      late: 'Te laat',
      absent: 'Afwezig',
      milestone: 'Milestone',
      performance: 'Prestatie',
      warning: 'Waarschuwing',
      compliment: 'Compliment',
      attendance: 'Aanwezigheid',
      general: 'Algemeen',
    };
    return labels[type] || 'Algemeen';
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Employee-specific notes (filtered by employeeId)
  const employeeNotes = useMemo(() => {
    return notes
      .filter((note) => note.employeeId === employeeId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [notes, employeeId]);

  // Stats by type
  const noteStats = useMemo(() => {
    const byType: Record<EmployeeNoteType, number> = {
      late: 0,
      absent: 0,
      milestone: 0,
      performance: 0,
      warning: 0,
      compliment: 0,
      attendance: 0,
      general: 0,
    };

    employeeNotes.forEach((note) => {
      byType[note.type] = (byType[note.type] || 0) + 1;
    });

    return {
      total: employeeNotes.length,
      byType,
    };
  }, [employeeNotes]);

  // Recent notes (last 5)
  const recentNotes = useMemo(() => {
    return employeeNotes.slice(0, 5);
  }, [employeeNotes]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const addNote = useCallback(
    (
      noteData: Omit<EmployeeNote, 'id' | 'employeeId' | 'createdAt' | 'updatedAt'> & {
        createdBy: string;
      }
    ) => {
      const now = new Date().toISOString();

      const newNote: EmployeeNote = {
        ...noteData,
        id: `note-${Date.now()}`,
        employeeId,
        createdAt: now,
        updatedAt: now,
      };

      setNotes((prev) => [...prev, newNote]);
      return newNote;
    },
    [employeeId]
  );

  const updateNote = useCallback((id: string, updates: Partial<EmployeeNote>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? {
              ...note,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  // ============================================================================
  // QUERY HELPERS
  // ============================================================================

  const getNoteById = useCallback(
    (id: string) => {
      return notes.find((n) => n.id === id);
    },
    [notes]
  );

  const getNotesByType = useCallback(
    (type: EmployeeNoteType) => {
      return employeeNotes.filter((n) => n.type === type);
    },
    [employeeNotes]
  );

  const getNotesByDateRange = useCallback(
    (startDate: string, endDate: string) => {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();

      return employeeNotes.filter((note) => {
        const noteDate = new Date(note.date).getTime();
        return noteDate >= start && noteDate <= end;
      });
    },
    [employeeNotes]
  );

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    notes: employeeNotes,
    allNotes: notes,
    recentNotes,
    noteStats,

    // CRUD
    addNote,
    updateNote,
    deleteNote,

    // Query helpers
    getNoteById,
    getNotesByType,
    getNotesByDateRange,

    // Utilities
    getNoteIcon,
    getNoteLabel,
  };
};
