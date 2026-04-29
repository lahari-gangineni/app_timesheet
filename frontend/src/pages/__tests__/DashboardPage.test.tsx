import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from '../DashboardPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../api/client', () => ({
  default: {
    getClients: vi.fn().mockResolvedValue({
      clients: [
        { id: 1, name: 'Acme Corp', description: null, department: null, email: null, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: 2, name: 'Globex Inc', description: null, department: null, email: null, created_at: '2024-01-01', updated_at: '2024-01-01' },
      ],
    }),
    getWorkEntries: vi.fn().mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, hours: 8, description: 'Dev work', date: '2024-01-15', created_at: '2024-01-15', updated_at: '2024-01-15', client_name: 'Acme Corp' },
        { id: 2, client_id: 2, hours: 4.5, description: 'Consulting', date: '2024-01-16', created_at: '2024-01-16', updated_at: '2024-01-16', client_name: 'Globex Inc' },
      ],
    }),
  },
}));

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render the Dashboard heading', async () => {
    renderWithQueryClient(<DashboardPage />);
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });

  it('should navigate to /clients when Total Clients card is clicked', async () => {
    renderWithQueryClient(<DashboardPage />);

    const card = await screen.findByText('Total Clients');
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith('/clients');
  });

  it('should navigate to /work-entries when Total Work Entries card is clicked', async () => {
    renderWithQueryClient(<DashboardPage />);

    const card = await screen.findByText('Total Work Entries');
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith('/work-entries');
  });

  it('should navigate to /reports when Total Hours card is clicked', async () => {
    renderWithQueryClient(<DashboardPage />);

    const card = await screen.findByText('Total Hours');
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith('/reports');
  });

  it('should display correct stats values after data loads', async () => {
    renderWithQueryClient(<DashboardPage />);

    // Wait for data to load by looking for a known loaded value
    expect(await screen.findByText('12.50')).toBeInTheDocument();

    // Both Total Clients and Total Work Entries should show 2
    const allTwos = screen.getAllByText('2');
    expect(allTwos.length).toBe(2);
  });

  it('should display recent work entries with client names and hours', async () => {
    renderWithQueryClient(<DashboardPage />);

    expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Globex Inc')).toBeInTheDocument();
    expect(screen.getByText(/8 hours/)).toBeInTheDocument();
    expect(screen.getByText(/4.5 hours/)).toBeInTheDocument();
  });

  it('should display work entry descriptions', async () => {
    renderWithQueryClient(<DashboardPage />);

    expect(await screen.findByText('Dev work')).toBeInTheDocument();
    expect(screen.getByText('Consulting')).toBeInTheDocument();
  });

  describe('Quick Actions', () => {
    it('should render Quick Actions section with correct button labels', async () => {
      renderWithQueryClient(<DashboardPage />);

      expect(await screen.findByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /New Client/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Log Time/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /See Reports/i })).toBeInTheDocument();
    });

    it('should navigate to /clients when New Client button is clicked', async () => {
      renderWithQueryClient(<DashboardPage />);

      const btn = await screen.findByRole('button', { name: /New Client/i });
      fireEvent.click(btn);

      expect(mockNavigate).toHaveBeenCalledWith('/clients');
    });

    it('should navigate to /work-entry when Log Time button is clicked', async () => {
      renderWithQueryClient(<DashboardPage />);

      const btn = await screen.findByRole('button', { name: /Log Time/i });
      fireEvent.click(btn);

      expect(mockNavigate).toHaveBeenCalledWith('/work-entry');
    });

    it('should navigate to /reports when See Reports button is clicked', async () => {
      renderWithQueryClient(<DashboardPage />);

      const btn = await screen.findByRole('button', { name: /See Reports/i });
      fireEvent.click(btn);

      expect(mockNavigate).toHaveBeenCalledWith('/reports');
    });
  });

  describe('Recent Work Entries section', () => {
    it('should render the Add Entry button that navigates to /work-entries', async () => {
      renderWithQueryClient(<DashboardPage />);

      const btn = await screen.findByRole('button', { name: /Add Entry/i });
      fireEvent.click(btn);

      expect(mockNavigate).toHaveBeenCalledWith('/work-entries');
    });

    it('should render Recent Work Entries heading', async () => {
      renderWithQueryClient(<DashboardPage />);
      expect(await screen.findByText('Recent Work Entries')).toBeInTheDocument();
    });
  });
});
