import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../DashboardPage';

const mockGetClients = vi.fn();
const mockGetWorkEntries = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../api/client', () => ({
  default: {
    getClients: (...args: unknown[]) => mockGetClients(...args),
    getWorkEntries: (...args: unknown[]) => mockGetWorkEntries(...args),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

const sampleClients = [
  { id: 1, name: 'Acme Corp', description: 'Desc', department: 'Eng', email: 'a@b.com', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 2, name: 'Beta LLC', description: null, department: null, email: null, created_at: '2024-02-01', updated_at: '2024-02-01' },
];


describe('DashboardPage E2E', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Page rendering and initial display
  // ---------------------------------------------------------------------------
  describe('page rendering and initial display', () => {
    it('should render the Dashboard title', async () => {
      mockGetClients.mockResolvedValue({ clients: [] });
      mockGetWorkEntries.mockResolvedValue({ workEntries: [] });
      renderWithProviders(<DashboardPage />);

      expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    });

    it('should render the three stat cards', async () => {
      mockGetClients.mockResolvedValue({ clients: [] });
      mockGetWorkEntries.mockResolvedValue({ workEntries: [] });
      renderWithProviders(<DashboardPage />);

      expect(await screen.findByText('Total Clients')).toBeInTheDocument();
      expect(screen.getByText('Total Work Entries')).toBeInTheDocument();
      expect(screen.getByText('Total Hours')).toBeInTheDocument();
    });

    it('should show zero counts when no data exists', async () => {
      mockGetClients.mockResolvedValue({ clients: [] });
      mockGetWorkEntries.mockResolvedValue({ workEntries: [] });
      renderWithProviders(<DashboardPage />);

      const clientsCard = (await screen.findByText('Total Clients')).closest('[class*="MuiCard-root"]')!;
      expect(clientsCard).toHaveTextContent('0');

      const hoursCard = screen.getByText('Total Hours').closest('[class*="MuiCard-root"]')!;
      expect(hoursCard).toHaveTextContent('0.00');
    });

    it('should display the Recent Work Entries section header', async () => {
      mockGetClients.mockResolvedValue({ clients: [] });
      mockGetWorkEntries.mockResolvedValue({ workEntries: [] });
      renderWithProviders(<DashboardPage />);

      expect(await screen.findByText('Recent Work Entries')).toBeInTheDocument();
    });

    it('should display the Quick Actions section header', async () => {
      mockGetClients.mockResolvedValue({ clients: [] });
      mockGetWorkEntries.mockResolvedValue({ workEntries: [] });
      renderWithProviders(<DashboardPage />);

      expect(await screen.findByText('Quick Actions')).toBeInTheDocument();
    });

    it('should show "No work entries yet" when there are no work entries', async () => {
      mockGetClients.mockResolvedValue({ clients: [] });
      mockGetWorkEntries.mockResolvedValue({ workEntries: [] });
      renderWithProviders(<DashboardPage />);

      expect(await screen.findByText('No work entries yet')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Stat card values
  // ---------------------------------------------------------------------------
  describe('stat card values with data', () => {
    beforeEach(() => {
      mockGetClients.mockResolvedValue({ clients: sampleClients });
      mockGetWorkEntries.mockResolvedValue({ workEntries: [] });
    });

    it('should display the correct total client count', async () => {
      renderWithProviders(<DashboardPage />);
      const card = (await screen.findByText('Total Clients')).closest('[class*="MuiCard-root"]')!;
      await waitFor(() => {
        expect(card).toHaveTextContent('2');
      });
    });

    it('should display zero work entries when no entries exist', async () => {
      renderWithProviders(<DashboardPage />);
      const card = (await screen.findByText('Total Work Entries')).closest('[class*="MuiCard-root"]')!;
      await waitFor(() => {
        expect(card).toHaveTextContent('0');
      });
    });

    it('should display zero total hours when no entries exist', async () => {
      renderWithProviders(<DashboardPage />);
      const card = (await screen.findByText('Total Hours')).closest('[class*="MuiCard-root"]')!;
      await waitFor(() => {
        expect(card).toHaveTextContent('0.00');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Recent work entries display
  // ---------------------------------------------------------------------------
  describe('recent work entries display', () => {
    it('should show empty state when no work entries exist', async () => {
      mockGetClients.mockResolvedValue({ clients: sampleClients });
      mockGetWorkEntries.mockResolvedValue({ workEntries: [] });
      renderWithProviders(<DashboardPage />);

      expect(await screen.findByText('No work entries yet')).toBeInTheDocument();
    });

    it('should still show the Recent Work Entries header with no entries', async () => {
      mockGetClients.mockResolvedValue({ clients: sampleClients });
      mockGetWorkEntries.mockResolvedValue({ workEntries: [] });
      renderWithProviders(<DashboardPage />);

      expect(await screen.findByText('Recent Work Entries')).toBeInTheDocument();
    });

    it('should show the Add Entry button even with no entries', async () => {
      mockGetClients.mockResolvedValue({ clients: sampleClients });
      mockGetWorkEntries.mockResolvedValue({ workEntries: [] });
      renderWithProviders(<DashboardPage />);

      expect(await screen.findByRole('button', { name: /add entry/i })).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Quick Action buttons
  // ---------------------------------------------------------------------------
  describe('quick action buttons', () => {
    beforeEach(() => {
      mockGetClients.mockResolvedValue({ clients: [] });
      mockGetWorkEntries.mockResolvedValue({ workEntries: [] });
    });

    it('should render the New Client quick action button', async () => {
      renderWithProviders(<DashboardPage />);
      expect(await screen.findByRole('button', { name: /new client/i })).toBeInTheDocument();
    });

    it('should render the Log Time quick action button', async () => {
      renderWithProviders(<DashboardPage />);
      expect(await screen.findByRole('button', { name: /log time/i })).toBeInTheDocument();
    });

    it('should render the See Reports quick action button', async () => {
      renderWithProviders(<DashboardPage />);
      expect(await screen.findByRole('button', { name: /see reports/i })).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Navigation via stat cards and quick actions
  // ---------------------------------------------------------------------------
  describe('navigation', () => {
    beforeEach(() => {
      mockGetClients.mockResolvedValue({ clients: sampleClients });
      mockGetWorkEntries.mockResolvedValue({ workEntries: [] });
    });

    it('should navigate to /clients when Total Clients card is clicked', async () => {
      renderWithProviders(<DashboardPage />);
      const card = (await screen.findByText('Total Clients')).closest('[class*="MuiCard-root"]')!;
      await userEvent.click(card);
      expect(mockNavigate).toHaveBeenCalledWith('/clients');
    });

    it('should navigate to /work-entries when Total Work Entries card is clicked', async () => {
      renderWithProviders(<DashboardPage />);
      const card = (await screen.findByText('Total Work Entries')).closest('[class*="MuiCard-root"]')!;
      await userEvent.click(card);
      expect(mockNavigate).toHaveBeenCalledWith('/work-entries');
    });

    it('should navigate to /reports when Total Hours card is clicked', async () => {
      renderWithProviders(<DashboardPage />);
      const card = (await screen.findByText('Total Hours')).closest('[class*="MuiCard-root"]')!;
      await userEvent.click(card);
      expect(mockNavigate).toHaveBeenCalledWith('/reports');
    });

    it('should navigate to /clients when New Client button is clicked', async () => {
      renderWithProviders(<DashboardPage />);
      await userEvent.click(await screen.findByRole('button', { name: /new client/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/clients');
    });

    it('should navigate to /work-entries when Log Time button is clicked', async () => {
      renderWithProviders(<DashboardPage />);
      await userEvent.click(await screen.findByRole('button', { name: /log time/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/work-entries');
    });

    it('should navigate to /reports when See Reports button is clicked', async () => {
      renderWithProviders(<DashboardPage />);
      await userEvent.click(await screen.findByRole('button', { name: /see reports/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/reports');
    });

    it('should navigate to /work-entries when Add Entry button in recent section is clicked', async () => {
      renderWithProviders(<DashboardPage />);
      await userEvent.click(await screen.findByRole('button', { name: /add entry/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/work-entries');
    });
  });
});
