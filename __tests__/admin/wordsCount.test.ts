import { SupabaseClientManager } from '@/app/lib/supabase/SupabaseClientManager';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
} as any;

// Mock createClient
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

describe('SupabaseClientManager - wordsCount', () => {
  let scm: SupabaseClientManager;

  beforeEach(() => {
    jest.clearAllMocks();
    scm = new SupabaseClientManager(mockSupabase);
  });

  it('should use word_last_letter_counts table to get total word count', async () => {
    const mockData = [
      { count: 100 },
      { count: 200 },
      { count: 50 },
      { count: 150 },
    ];

    mockSupabase.select.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const result = await scm.get().wordsCount();

    // Verify it uses the correct table and column
    expect(mockSupabase.from).toHaveBeenCalledWith('word_last_letter_counts');
    expect(mockSupabase.select).toHaveBeenCalledWith('count');

    // Verify it returns the sum of all counts
    expect(result.count).toBe(500); // 100 + 200 + 50 + 150
    expect(result.error).toBeNull();
  });

  it('should handle database error correctly', async () => {
    const mockError = { message: 'Database error' };

    mockSupabase.select.mockResolvedValue({
      data: null,
      error: mockError,
    });

    const result = await scm.get().wordsCount();

    expect(result.count).toBeNull();
    expect(result.error).toBe(mockError);
  });

  it('should handle empty data array', async () => {
    mockSupabase.select.mockResolvedValue({
      data: [],
      error: null,
    });

    const result = await scm.get().wordsCount();

    expect(result.count).toBe(0);
    expect(result.error).toBeNull();
  });

  it('should handle null data', async () => {
    mockSupabase.select.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await scm.get().wordsCount();

    expect(result.count).toBe(0);
    expect(result.error).toBeNull();
  });
});