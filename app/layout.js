import { getServerSession } from "next-auth";
import AuthProvider from "@/context/AuthProvider";
import "./globals.css";

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({ children }) {
  const authOptions = {}; 
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body>
        <AuthProvider session={session}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}