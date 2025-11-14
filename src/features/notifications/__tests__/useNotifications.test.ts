import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from '../hooks/useNotifications';
import type { Notification } from '../../../types';

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    message: 'Test notification 1',
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'low',
  },
  {
    id: '2',
    type: 'warning',
    message: 'Test notification 2',
    timestamp: new Date().toISOString(),
    read: true,
    priority: 'high',
  },
];

describe('useNotifications', () => {
  it('should initialize with provided notifications', () => {
    const { result } = renderHook(() => useNotifications(mockNotifications));
    
    expect(result.current.allNotifications).toHaveLength(2);
    expect(result.current.stats.total).toBe(2);
    expect(result.current.stats.unread).toBe(1);
  });

  it('should mark notification as read', () => {
    const { result } = renderHook(() => useNotifications(mockNotifications));
    
    act(() => {
      result.current.markAsRead('1');
    });
    
    expect(result.current.stats.unread).toBe(0);
  });

  it('should filter notifications by type', () => {
    const { result } = renderHook(() => useNotifications(mockNotifications));
    
    act(() => {
      result.current.setTypeFilter('warning');
    });
    
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].type).toBe('warning');
  });
});
