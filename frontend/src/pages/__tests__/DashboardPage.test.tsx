import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('should display totalHours in the Total Clients card', async () => {
    renderWithQueryClient(<DashboardPage />);

    const card = (await screen.findByText('Total Clients')).closest('[class*="MuiCard-root"]')!;
    await waitFor(() => {
      expect(card).toHaveTextContent('12.50');
    });
  });

  it('should display clients.length in the Total Hours card', async () => {
    renderWithQueryClient(<DashboardPage />);

    const card = (await screen.findByText('Total Hours')).closest('[class*="MuiCard-root"]')!;
    await waitFor(() => {
      expect(card).toHaveTextContent('2');
    });
  });

  it('should render quick action button labeled "New Client"', async () => {
    renderWithQueryClient(<DashboardPage />);
    expect(await screen.findByRole('button', { name: /new client/i })).toBeInTheDocument();
  });

  it('should render quick action button labeled "Log Time"', async () => {
    renderWithQueryClient(<DashboardPage />);
    expect(await screen.findByRole('button', { name: /log time/i })).toBeInTheDocument();
  });

  it('should render quick action button labeled "See Reports"', async () => {
    renderWithQueryClient(<DashboardPage />);
    expect(await screen.findByRole('button', { name: /see reports/i })).toBeInTheDocument();
  });

  it('should navigate to /clients when New Client button is clicked', async () => {
    renderWithQueryClient(<DashboardPage />);
    fireEvent.click(await screen.findByRole('button', { name: /new client/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/clients');
  });

  it('should navigate to /work-entries when Log Time button is clicked', async () => {
    renderWithQueryClient(<DashboardPage />);
    fireEvent.click(await screen.findByRole('button', { name: /log time/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/work-entries');
  });

  it('should navigate to /reports when See Reports button is clicked', async () => {
    renderWithQueryClient(<DashboardPage />);
    fireEvent.click(await screen.findByRole('button', { name: /see reports/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/reports');
  });
});
