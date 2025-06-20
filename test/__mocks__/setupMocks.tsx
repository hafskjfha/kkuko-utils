// test/setupMocks.ts

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

jest.mock('@/app/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="card-title">{children}</h2>,
}))

jest.mock('@/app/components/ui/input', () => ({
  Input: (props: any) => <input {...props} data-testid="input" />,
}))

jest.mock('@/app/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props} data-testid="button">
      {children}
    </button>
  ),
}))

jest.mock('@/app/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
      data-testid="checkbox"
    />
  ),
}))

jest.mock('@/app/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props} data-testid="label">{children}</label>,
}))

jest.mock('@/app/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span {...props} data-testid="badge">{children}</span>,
}))

jest.mock('@/app/components/ErrModal', () => {
  return ({ onClose, error }: any) => (
    <div data-testid="error-modal">
      <button onClick={onClose}>Close</button>
      <div>{error.ErrMessage}</div>
    </div>
  )
})

jest.mock('@/app/components/Spinner', () => {
  return () => <div data-testid="spinner">Loading...</div>
})

jest.mock('@/app/components/HelpModal', () => {
  return ({ children, title, triggerText }: any) => (
    <div data-testid="help-modal">
      <button>{triggerText}</button>
      <div>{title}</div>
      {children}
    </div>
  )
})

