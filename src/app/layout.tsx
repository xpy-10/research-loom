import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider, SignInButton, SignOutButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header>
          <SignedOut>
            <SignInButton />
            <div>only signed out users can see this</div>
          </SignedOut>
          <SignedIn>
            <div>only signed in members can see this</div>
            <SignOutButton />
            <UserButton />
          </SignedIn>
        </header>
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
