import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "File Share",
  description: "University File sharing System",
  // other metadata
};

export default function SignIn() {
  return <SignInForm />;
}
