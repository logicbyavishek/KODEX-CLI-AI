import React from 'react'
import { ThemeProvider } from "@/components/theme-provider" 

const AuthLayout = ({ children }: { children: React.ReactNode}) => {
  return (
    <> <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >    
            <div className='flex flex-col items-center justify-center h-screen'>{children}</div>
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}

export default AuthLayout