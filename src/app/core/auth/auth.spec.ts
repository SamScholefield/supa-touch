import { TestBed } from '@angular/core/testing';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

import { Auth } from './auth';
import { SUPABASE_CLIENT } from '../supabase/supabase-client';

function fakeSession(): Session {
  return { user: { id: 'user-1', email: 'a@b.com' } } as Session;
}

describe('Auth', () => {
  let service: Auth;
  let getSession: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getSession = vi.fn().mockResolvedValue({ data: { session: null } });

    const supabaseStub = {
      auth: {
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        getSession,
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      },
    } as unknown as SupabaseClient;

    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: supabaseStub }],
    });
    service = TestBed.inject(Auth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts signed out', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
  });

  it('reflects the restored session', async () => {
    getSession.mockResolvedValue({ data: { session: fakeSession() } });

    await service.restoreSession();

    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()?.email).toBe('a@b.com');
  });
});
