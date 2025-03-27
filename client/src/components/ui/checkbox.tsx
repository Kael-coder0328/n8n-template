/**
 * Basic checkbox component
 */

interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function Checkbox({ 
  checked = false, 
  onCheckedChange, 
  disabled = false,
  className = '' 
}: CheckboxProps) {
  const handleClick = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked)
    }
  }

  return (
    <div 
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
        checked 
          ? 'bg-blue-600 border-blue-600 text-white' 
          : 'border-gray-300 dark:border-gray-700'
      } ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      onClick={handleClick}
      role="checkbox"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
    >
      {checked && (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
    </div>
  )
} 