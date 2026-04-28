import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from '../DashboardPage';

const mockNavigate = vi.fn();
const mockGetClients = vi.fn();
const mockGetWorkEntries = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../api/client', () => ({
  default: {
    getClients: (...args: unknown[]) => mockGetClients(...args),
    getWorkEntries: (...args: unknown[]) => mockGetWorkEntries(...args),
  },
}));

const sampleClients = [
  { id: 1, name: 'Acme Corp', description: null, department: null, email: null, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 2, name: 'Globex Inc', description: null, department: null, email: null, created_at: '2024-01-01', updated_at: '2024-01-01' },
];

const sampleWorkEntries = [
  { id: 1, client_id: 1, hours: 8, description: 'Dev work', date: '2024-01-15', created_at: '2024-01-15', updated_at: '2024-01-15', client_name: 'Acme Corp' },
  { id: 2, client_id: 2, hours: 4.5, description: 'Consulting', date: '2024-01-16', created_at: '2024-01-16', updated_at: '2024-01-16', client_name: 'Globex Inc' },
];

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
    vi.clearAllMocks();
    mockGetClients.mockResolvedValue({ clients: sampleClients });
    mockGetWorkEntries.mockResolvedValue({ workEntries: sampleWorkEntries });
  });

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  it('should render the Dashboard title', async () => {
    renderWithQueryClient(<DashboardPage />);
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });

  it('should render all three stat cards', async () => {
    renderWithQueryClient(<DashboardPage />);
    expect(await screen.findByText('Total Clients')).toBeInTheDocument();
    expect(screen.getByText('Total Work Entries')).toBeInTheDocument();
    expect(screen.getByText('Total Hours')).toBeInTheDocument();
  });

  it('should render the Quick Actions section', async () => {
    renderWithQueryClient(<DashboardPage />);
    expect(await screen.findByText('Quick Actions')).toBeInTheDocument();
  });

  it('should render the Recent Work Entries section', async () => {
    renderWithQueryClient(<DashboardPage />);
    expect(await screen.findByText('Recent Work Entries')).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Stat card values
  // ---------------------------------------------------------------------------
  it('should display the correct total client count', async () => {
    renderWithQueryClient(<DashboardPage />);
    const card = (await screen.findByText('Total Clients')).closest('[class*="MuiCard-root"]')!;
    await waitFor(() => {
      expect(card).toHaveTextContent('2');
    });
  });

  it('should display the correct total work entries count', async () => {
    renderWithQueryClient(<DashboardPage />);
    const card = (await screen.findByText('Total Work Entries')).closest('[class*="MuiCard-root"]')!;
    await waitFor(() => {
      expect(card).toHaveTextContent('2');
    });
  });

  it('should display the correct total hours', async () => {
    renderWithQueryClient(<DashboardPage />);
    const card = (await screen.findByText('Total Hours')).closest('[class*="MuiCard-root"]')!;
    await waitFor(() => {
      expect(card).toHaveTextContent('12.50');
    });
  });

  it('should show zero counts when no data exists', async () => {
    mockGetClients.mockResolvedValue({ clients: [] });
    mockGetWorkEntries.mockResolvedValue({ workEntries: [] });
    renderWithQueryClient(<DashboardPage />);

    const clientsCard = (await screen.findByText('Total Clients')).closest('[class*="MuiCard-root"]')!;
    expect(clientsCard).toHaveTextContent('0');

    const hoursCard = screen.getByText('Total Hours').closest('[class*="MuiCard-root"]')!;
    expect(hoursCard).toHaveTextContent('0.00');
  });

  // ---------------------------------------------------------------------------
  // Recent work entries display
  // ---------------------------------------------------------------------------
  it('should display recent work entries with descriptions', async () => {
    renderWithQueryClient(<DashboardPage />);
    expect(await screen.findByText('Dev work')).toBeInTheDocument();
    expect(screen.getByText('Consulting')).toBeInTheDocument();
  });

  it('should show client name for each recent entry', async () => {
    renderWithQueryClient(<DashboardPage />);
    await screen.findByText('Dev work');
    const acmeElements = screen.getAllByText('Acme Corp');
    expect(acmeElements.length).toBeGreaterThanOrEqual(1);
  });

  it('should show hours and formatted date for each entry', async () => {
    renderWithQueryClient(<DashboardPage />);
    const formatted = new Date('2024-01-15').toLocaleDateString();
    expect(await screen.findByText(new RegExp(`8 hours - ${formatted}`))).toBeInTheDocument();
  });

  it('should show "No work entries yet" when there are no work entries', async () => {
    mockGetClients.mockResolvedValue({ clients: [] });
    mockGetWorkEntries.mockResolvedValue({ workEntries: [] });
    renderWithQueryClient(<DashboardPage />);
    expect(await screen.findByText('No work entries yet')).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Stat card navigation
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Quick action button navigation
  // ---------------------------------------------------------------------------
  it('should render the New Client quick action button and navigate to /clients', async () => {
    renderWithQueryClient(<DashboardPage />);

    const button = await screen.findByRole('button', { name: /new client/i });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/clients');
  });

  it('should render the Log Time quick action button and navigate to /work-entry', async () => {
    renderWithQueryClient(<DashboardPage />);

    const button = await screen.findByRole('button', { name: /log time/i });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/work-entry');
  });

  it('should render the See Reports quick action button and navigate to /reports', async () => {
    renderWithQueryClient(<DashboardPage />);

    const button = await screen.findByRole('button', { name: /see reports/i });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/reports');
  });

  it('should navigate to /work-entries when Add Entry button is clicked', async () => {
    renderWithQueryClient(<DashboardPage />);

    const button = await screen.findByRole('button', { name: /add entry/i });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/work-entries');
  });
});
