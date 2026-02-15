/**
 * Tests for tarkov-api module
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchTasks, findTaskById, type TaskData } from '../src/lib/index.js';

describe('tarkov-api', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetchTasks returns tasks when API request succeeds', async () => {
    const tasks: TaskData[] = [{ id: 'task-1', name: 'Task 1' }];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ data: { tasks } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchTasks();

    expect(result).toEqual(tasks);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.tarkov.dev/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('fetchTasks throws when HTTP response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => ({}),
      })
    );

    await expect(fetchTasks()).rejects.toThrow(
      'API request failed: 503 Service Unavailable'
    );
  });

  it('fetchTasks throws when GraphQL errors are returned', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          errors: [{ message: 'Something failed' }],
        }),
      })
    );

    await expect(fetchTasks()).rejects.toThrow('GraphQL errors');
  });

  it('findTaskById returns matching task', () => {
    const tasks: TaskData[] = [
      { id: 'task-1', name: 'Task 1' },
      { id: 'task-2', name: 'Task 2' },
    ];

    expect(findTaskById(tasks, 'task-2')).toEqual({ id: 'task-2', name: 'Task 2' });
    expect(findTaskById(tasks, 'missing')).toBeUndefined();
  });
});
