import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "File Share",
  description: "University File sharing System",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
