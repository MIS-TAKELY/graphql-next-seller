import React from 'react'
import { ThemeProvider } from '@/components/theme-provider'

const layout = ({children}:{children:React.ReactNode}) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className='flex justify-center items-center min-w-screen min-h-screen'>
        {children}
      </div>
    </ThemeProvider>
  )
}

export default layout
