import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button } from '../../app/components/Button';
import { Card } from '../../app/components/Card';
import { DoseChip } from '../../app/components/DoseChip';
import { EmptyState } from '../../app/components/EmptyState';
import { ThemeProvider } from '../../app/providers/ThemeProvider';
import { Dose } from '../../types/api';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('Button Component', () => {
  it('renders button with title', () => {
    render(
      <TestWrapper>
        <Button title="Test Button" onPress={() => {}} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Button')).toBeTruthy();
  });

  it('handles press events', () => {
    const mockOnPress = jest.fn();
    
    render(
      <TestWrapper>
        <Button title="Test Button" onPress={mockOnPress} />
      </TestWrapper>
    );

    fireEvent.press(screen.getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(
      <TestWrapper>
        <Button title="Test Button" loading={true} onPress={() => {}} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Button')).toBeTruthy();
    // Loading indicator should be present
  });

  it('disables button when disabled', () => {
    const mockOnPress = jest.fn();
    
    render(
      <TestWrapper>
        <Button title="Test Button" disabled={true} onPress={mockOnPress} />
      </TestWrapper>
    );

    fireEvent.press(screen.getByText('Test Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});

describe('Card Component', () => {
  it('renders card with children', () => {
    render(
      <TestWrapper>
        <Card>
          <Text>Card Content</Text>
        </Card>
      </TestWrapper>
    );

    expect(screen.getByText('Card Content')).toBeTruthy();
  });

  it('handles press events when onPress is provided', () => {
    const mockOnPress = jest.fn();
    
    render(
      <TestWrapper>
        <Card onPress={mockOnPress}>
          <Text>Card Content</Text>
        </Card>
      </TestWrapper>
    );

    fireEvent.press(screen.getByText('Card Content'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});

describe('DoseChip Component', () => {
  const mockDose: Dose = {
    time_window: '08:00',
    amount: 1,
    unit: 'pill',
    with_food: false,
  };

  it('renders dose chip with correct information', () => {
    render(
      <TestWrapper>
        <DoseChip dose={mockDose} />
      </TestWrapper>
    );

    expect(screen.getByText('08:00')).toBeTruthy();
    expect(screen.getByText('1 pill')).toBeTruthy();
  });

  it('shows different status colors', () => {
    const { rerender } = render(
      <TestWrapper>
        <DoseChip dose={mockDose} status="taken" />
      </TestWrapper>
    );

    expect(screen.getByText('Taken')).toBeTruthy();

    rerender(
      <TestWrapper>
        <DoseChip dose={mockDose} status="missed" />
      </TestWrapper>
    );

    expect(screen.getByText('Missed')).toBeTruthy();
  });

  it('shows with food indicator', () => {
    const doseWithFood: Dose = {
      ...mockDose,
      with_food: true,
    };

    render(
      <TestWrapper>
        <DoseChip dose={doseWithFood} />
      </TestWrapper>
    );

    expect(screen.getByText('with food')).toBeTruthy();
  });
});

describe('EmptyState Component', () => {
  it('renders empty state with title and message', () => {
    render(
      <TestWrapper>
        <EmptyState
          title="No Data"
          message="There is no data to display"
        />
      </TestWrapper>
    );

    expect(screen.getByText('No Data')).toBeTruthy();
    expect(screen.getByText('There is no data to display')).toBeTruthy();
  });

  it('renders action button when provided', () => {
    const mockOnAction = jest.fn();
    
    render(
      <TestWrapper>
        <EmptyState
          title="No Data"
          message="There is no data to display"
          actionLabel="Add Item"
          onAction={mockOnAction}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Add Item')).toBeTruthy();
    
    fireEvent.press(screen.getByText('Add Item'));
    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });
});
