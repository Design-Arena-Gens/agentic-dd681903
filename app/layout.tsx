export const metadata = {
  title: 'LinkedIn AI Auto Poster',
  description: 'Automatically generate and post AI content to LinkedIn',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
