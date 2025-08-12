/**
 * API Client Test
 * Simple test to verify API client functionality
 */

import { apiClient } from './api';

// Mock fetch for testing
global.fetch = jest.fn();

describe('API Client', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should make a health check request', async () => {
    const mockResponse = {
      success: true,
      data: { status: 'healthy', timestamp: '2024-01-01T00:00:00.000Z' }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await apiClient.healthCheck();

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith('/api/health', expect.any(Object));
  });

  it('should handle API errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await apiClient.healthCheck();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network error');
  });

  it('should handle HTTP errors', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    const result = await apiClient.healthCheck();

    expect(result.success).toBe(false);
    expect(result.error).toBe('HTTP 500: Internal Server Error');
  });
});