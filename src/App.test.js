import { render, screen } from '@testing-library/react';
import App from './App';

test('renders GitHub Pattern & Language Analyzer', () => {
  render(<App />);
  const titleElement = screen.getByText(/GitHub Pattern & Language Analyzer/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders input field for repository URL', () => {
  render(<App />);
  const inputElement = screen.getByPlaceholderText(/Enter GitHub Repo Link/i);
  expect(inputElement).toBeInTheDocument();
});

test('renders analyze patterns button', () => {
  render(<App />);
  const buttonElement = screen.getByRole('button', { name: /Analyze Patterns/i });
  expect(buttonElement).toBeInTheDocument();
});
