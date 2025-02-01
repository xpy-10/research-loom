import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider, SignIn, SignInButton, SignOutButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/_components/sidebarNav/app-sidebar";
import { Separator } from "@radix-ui/react-separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Toaster } from "@/components/ui/toaster";
import { fetchProjects } from "@/lib/actions";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const fetchProjectsResponse = await fetchProjects(3);
  const projectsValidityCheck = fetchProjectsResponse && fetchProjectsResponse.success && fetchProjectsResponse.data && fetchProjectsResponse.data.length >= 1
  const projects = projectsValidityCheck && fetchProjectsResponse.data
  return (
    <ClerkProvider
    appearance={{
      variables: {
        colorPrimary: "#faebd7",
        colorBackground: "#ffffff",
        colorTextOnPrimaryBackground: "#000000"
      }
    }}>
    <html lang="en">
      <body>
        <SignedIn>
          <SidebarProvider>
             <AppSidebar projects={projects? projects: undefined}/>
           <SidebarInset>
           <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
            {children}
           </SidebarInset>
          </SidebarProvider>
        </SignedIn>
        <SignedOut>
          <div className="h-screen flex justify-center items-center">
          <SignIn />
          </div>
        </SignedOut>
        <Toaster/>
      </body>
    </html>
    </ClerkProvider>
  );
}
